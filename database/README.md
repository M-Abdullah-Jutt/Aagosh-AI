# Microsoft SQL Server Database Configuration

Aaghosh uses **Microsoft SQL Server** as its primary application database via **SQLAlchemy** and the `pyodbc` database driver.

> **Important Note**: PostgreSQL and MS Access are explicitly prohibited for this project.

## Connection Architecture

- **ORM**: SQLAlchemy 2.x (`DeclarativeBase`)
- **Driver**: `pyodbc`
- **Dialect**: `mssql+pyodbc`

## Driver Setup Requirements

To connect Python to Microsoft SQL Server, ensure the appropriate **ODBC Driver for SQL Server** is installed on your host system:

- Windows: Download [Microsoft ODBC Driver 17 or 18 for SQL Server](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)
- Linux / macOS: Install `unixodbc` and `msodbcsql17` or `msodbcsql18` packages.

## Connection URI Format

The connection URI is constructed dynamically in `backend/app/core/config.py`:

```
mssql+pyodbc://<DB_USER>:<DB_PASSWORD>@<DB_SERVER>:<DB_PORT>/<DB_NAME>?driver=ODBC+Driver+17+for+SQL+Server
```

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and update the following settings:

```env
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=AaghoshDB
DB_USER=sa
DB_PASSWORD=YourStrongPassw0rd!
DB_DRIVER=ODBC Driver 17 for SQL Server
```

## Future Schema & Migrations

- Domain models will be created in `backend/app/models/` as business requirements are introduced.
- Alembic will be used for schema migrations targeting Microsoft SQL Server.
