"""
One-off migration: widen parent-authored text columns from VARCHAR to NVARCHAR.

Why this exists
---------------
The database collation is SQL_Latin1_General_CP1_CI_AS, whose code page cannot
represent Urdu. Any Urdu text written to a VARCHAR column is silently replaced
with '?' characters. Since the AI coach can now answer in Urdu, and parents may
type Urdu child names and observations, every free-text column that holds
human-authored prose must be NVARCHAR.

Base.metadata.create_all() never alters existing columns, so the change has to
be applied explicitly. This script is idempotent: it inspects
INFORMATION_SCHEMA.COLUMNS and only issues ALTER statements for columns that are
not already Unicode.

Conversion is lossless — existing ASCII data maps 1:1 into NVARCHAR.

Usage:
    venv\\Scripts\\python.exe -m app.db.migrate_unicode            # apply
    venv\\Scripts\\python.exe -m app.db.migrate_unicode --dry-run  # report only
"""

import sys
from typing import List, Tuple

from sqlalchemy import text

from app.db.session import engine


# (table, column, target NVARCHAR type)
COLUMNS_TO_CONVERT: List[Tuple[str, str, str]] = [
    ("users", "full_name", "NVARCHAR(255)"),
    ("children", "first_name", "NVARCHAR(100)"),
    ("child_profiles", "strengths", "NVARCHAR(MAX)"),
    ("child_profiles", "challenges", "NVARCHAR(MAX)"),
    ("child_profiles", "personality_notes", "NVARCHAR(MAX)"),
    ("child_profiles", "communication_style", "NVARCHAR(MAX)"),
    ("parenting_goals", "description", "NVARCHAR(MAX)"),
    ("daily_check_ins", "general_notes", "NVARCHAR(MAX)"),
    ("behavior_events", "behavior_description", "NVARCHAR(MAX)"),
    ("behavior_events", "event_notes", "NVARCHAR(MAX)"),
    ("coach_conversations", "title", "NVARCHAR(255)"),
    ("coach_messages", "content", "NVARCHAR(MAX)"),
]

NON_UNICODE_TYPES = ("varchar", "text", "char", "ntext")


def find_pending_conversions(connection) -> List[Tuple[str, str, str, str]]:
    """Returns (table, column, current_type, target_type) for columns needing conversion."""
    existing_tables = {
        row[0]
        for row in connection.execute(
            text("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'")
        ).fetchall()
    }

    pending = []
    for table, column, target_type in COLUMNS_TO_CONVERT:
        if table not in existing_tables:
            print(f"  SKIP  {table}.{column} — table does not exist yet")
            continue

        row = connection.execute(
            text(
                """
                SELECT DATA_TYPE, IS_NULLABLE
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = :table AND COLUMN_NAME = :column
                """
            ),
            {"table": table, "column": column},
        ).fetchone()

        if row is None:
            print(f"  SKIP  {table}.{column} — column does not exist")
            continue

        current_type, is_nullable = row[0].lower(), row[1]
        if current_type == "nvarchar":
            print(f"  OK    {table}.{column} — already NVARCHAR")
            continue
        if current_type not in NON_UNICODE_TYPES:
            print(f"  SKIP  {table}.{column} — unexpected type '{current_type}'")
            continue

        pending.append((table, column, current_type, target_type, is_nullable))
    return pending


def migrate(dry_run: bool = False) -> int:
    with engine.connect() as connection:
        print("Scanning columns for non-Unicode storage...\n")
        pending = find_pending_conversions(connection)

        if not pending:
            print("\nNothing to convert — all target columns are already NVARCHAR.")
            return 0

        print(f"\n{len(pending)} column(s) to convert:")
        statements = []
        for table, column, current_type, target_type, is_nullable in pending:
            null_clause = "NULL" if is_nullable == "YES" else "NOT NULL"
            ddl = f"ALTER TABLE [{table}] ALTER COLUMN [{column}] {target_type} {null_clause}"
            statements.append(ddl)
            print(f"  {table}.{column}: {current_type} -> {target_type}")

        if dry_run:
            print("\n--dry-run set; no changes applied. Statements that would run:")
            for ddl in statements:
                print(f"  {ddl};")
            return len(statements)

        print("\nApplying...")
        for ddl in statements:
            connection.execute(text(ddl))
        connection.commit()
        print(f"Done. {len(statements)} column(s) converted to NVARCHAR.")
        return len(statements)


if __name__ == "__main__":
    dry = "--dry-run" in sys.argv
    sys.exit(0 if migrate(dry_run=dry) is not None else 1)
