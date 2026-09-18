import os
import re
import hashlib
import pypdf
from typing import List, Tuple
from app.knowledge.schemas import KnowledgeDocument, KnowledgeChunk, SourceMetadata


class PDFKnowledgeParser:
    """
    Semantic parser for Aaghosh AI knowledge PDFs.

    Supports two document formats automatically:

    1. **Legacy format** (Parentingpdf.pdf):
       [Tags: a, b, c]
       Child Action: <situation>
       Protocol: <numbered steps>

    2. **Aaghosh Protocol format** (Aaghosh_Parvarish_RAG_Protocols.pdf,
       Aaghosh_RAG_Action_Protocols.pdf):
       [Module: X | Stage: Y | Category: Z | Tags: a, b, c]
       <Child|Adolescent|Family> Trigger: <situation>
       Evidence-Based Parent Protocol:
       <numbered steps>

    Format is auto-detected per document via full-text scan.
    """

    # ------------------------------------------------------------------ #
    # Age-range maps                                                       #
    # ------------------------------------------------------------------ #

    # Legacy format: category keyword → (age_min, age_max)
    CATEGORY_AGE_MAP = {
        "infants": (0, 1),
        "toddlers": (1, 3),
        "preschoolers": (3, 5),
        "school-age": (6, 14),
        "adolescence": (15, 18),
    }

    # New format: Stage keyword → (age_min, age_max)
    STAGE_AGE_MAP = {
        "infant_0_6m": (0, 0),
        "infant_6_12m": (0, 1),
        "infant_toddler": (0, 3),
        "infant": (0, 1),
        "toddler/preschool": (1, 5),
        "toddler": (1, 3),
        "preschool": (3, 5),
        "earlychildhood": (0, 6),
        "early_childhood": (0, 6),
        "schoolage": (6, 14),
        "school_age": (6, 14),
        "preteen_teen": (8, 16),
        "preteen": (8, 12),
        "adolescence": (12, 18),
        "teen": (13, 18),
        "allages": (0, 18),
        "all_ages": (0, 18),
    }

    # Inline module header regex: [Module: X | Stage: Y | Category: Z | Tags: a, b]
    _MODULE_RE = re.compile(
        r'\[Module:\s*(?P<module>[^|\]]+)\|'
        r'\s*Stage:\s*(?P<stage>[^|\]]+)\|'
        r'\s*Category:\s*(?P<category>[^|\]]+)\|'
        r'\s*Tags:\s*(?P<tags>[^\]]+)\]',
        re.IGNORECASE,
    )

    # Trigger line prefixes used in the new format
    _TRIGGER_PREFIXES = (
        "child trigger:",
        "adolescent trigger:",
        "family trigger:",
        "trigger:",
    )

    _PROTOCOL_PREFIX = "evidence-based parent protocol:"

    # ------------------------------------------------------------------ #
    # Public entry point                                                   #
    # ------------------------------------------------------------------ #

    @staticmethod
    def parse_pdf(file_path: str) -> Tuple[KnowledgeDocument, List[KnowledgeChunk]]:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF source document not found at: {file_path}")

        reader = pypdf.PdfReader(file_path)
        source_filename = os.path.basename(file_path)

        # Auto-detect format from full text
        all_text = "\n".join((p.extract_text() or "") for p in reader.pages)
        is_new_format = bool(re.search(r'\[Module:', all_text, re.IGNORECASE))

        doc = KnowledgeDocument(
            id=hashlib.md5(source_filename.encode()).hexdigest()[:16],
            title=source_filename.replace("_", " ").replace(".pdf", ""),
            source_name=source_filename,
            source_type="pdf",
            source_reference=file_path,
            version="1.0",
            status="active",
        )

        if is_new_format:
            chunks = PDFKnowledgeParser._parse_new_format(reader, doc)
        else:
            chunks = PDFKnowledgeParser._parse_legacy_format(reader, doc)

        return doc, chunks

    # ------------------------------------------------------------------ #
    # New format parser                                                    #
    # ------------------------------------------------------------------ #

    @staticmethod
    def _age_from_stage(stage: str) -> Tuple[int, int]:
        """Map a Stage string to (age_min, age_max). Falls back to (0, 18)."""
        # Normalise: lowercase, collapse spaces/slashes to underscore
        key = re.sub(r'[\s/]+', '_', stage.strip().lower())
        # Exact match
        if key in PDFKnowledgeParser.STAGE_AGE_MAP:
            return PDFKnowledgeParser.STAGE_AGE_MAP[key]
        # Substring match
        for map_key, bounds in PDFKnowledgeParser.STAGE_AGE_MAP.items():
            if map_key in key or key in map_key:
                return bounds
        return (0, 18)

    @staticmethod
    def _parse_new_format(
        reader: pypdf.PdfReader,
        doc: KnowledgeDocument,
    ) -> List[KnowledgeChunk]:
        """
        Parse Aaghosh Protocol PDFs.

        Each chunk is delimited by a [Module: | Stage: | Category: | Tags:] header,
        followed by a Trigger line, then Evidence-Based Parent Protocol steps.
        """
        chunks: List[KnowledgeChunk] = []
        chunk_index = 0

        # Carry state across pages
        current_module = ""
        current_stage = ""
        current_category = "General Parenting"
        current_tags: List[str] = []
        age_min, age_max = 0, 18

        for page_idx, page in enumerate(reader.pages):
            page_num = page_idx + 1
            raw_lines = (page.extract_text() or "").splitlines()
            # Strip blank lines for easier look-ahead
            lines = [ln for ln in raw_lines]

            i = 0
            while i < len(lines):
                line = lines[i].strip()

                # ---- Try to find a module header (may span two lines) ----
                combined = line
                if "[Module:" in combined and "]" not in combined:
                    # Try to stitch the next line
                    if i + 1 < len(lines):
                        combined = combined + " " + lines[i + 1].strip()
                    if "]" not in combined and i + 2 < len(lines):
                        combined = combined + " " + lines[i + 2].strip()

                m = PDFKnowledgeParser._MODULE_RE.search(combined)
                if m:
                    current_module = m.group("module").strip()
                    current_stage = m.group("stage").strip()
                    current_category = m.group("category").strip()
                    tags_raw = m.group("tags").strip()
                    current_tags = [t.strip() for t in tags_raw.split(",") if t.strip()]
                    age_min, age_max = PDFKnowledgeParser._age_from_stage(current_stage)
                    i += 1
                    continue

                # ---- Detect Trigger line ----
                line_lower = line.lower()
                if any(line_lower.startswith(p) for p in PDFKnowledgeParser._TRIGGER_PREFIXES):
                    trigger_lines: List[str] = [line]
                    i += 1

                    # Collect remaining trigger text until we hit the protocol header
                    while i < len(lines):
                        nxt = lines[i].strip()
                        nxt_lower = nxt.lower()
                        if (nxt_lower.startswith(PDFKnowledgeParser._PROTOCOL_PREFIX) or
                                "[Module:" in nxt or
                                any(nxt_lower.startswith(p) for p in PDFKnowledgeParser._TRIGGER_PREFIXES)):
                            break
                        trigger_lines.append(nxt)
                        i += 1

                    # ---- Collect Evidence-Based Parent Protocol steps ----
                    protocol_lines: List[str] = []
                    if (i < len(lines) and
                            lines[i].strip().lower().startswith(PDFKnowledgeParser._PROTOCOL_PREFIX)):
                        protocol_lines.append(lines[i].strip())
                        i += 1
                        while i < len(lines):
                            nxt = lines[i].strip()
                            nxt_lower = nxt.lower()
                            # Stop at next module header or trigger
                            if ("[Module:" in nxt or
                                    any(nxt_lower.startswith(p) for p in PDFKnowledgeParser._TRIGGER_PREFIXES)):
                                break
                            protocol_lines.append(nxt)
                            i += 1
                        i -= 1  # backtrack so outer loop re-evaluates boundary

                    situation_str = " ".join(t for t in trigger_lines if t).strip()
                    protocol_str = "\n".join(protocol_lines).strip()

                    if situation_str and protocol_str:
                        content = (
                            f"Module: {current_module}\n"
                            f"Stage: {current_stage}\n"
                            f"Category: {current_category} ({current_stage})\n"
                            f"Tags: {', '.join(current_tags)}\n"
                            f"Trigger: {situation_str}\n"
                            f"{protocol_str}"
                        )
                        content_hash = hashlib.sha256(content.encode()).hexdigest()[:16]
                        chunk_id = f"{doc.id}_chunk_{chunk_index}_{content_hash}"

                        chunk = KnowledgeChunk(
                            id=chunk_id,
                            document_id=doc.id,
                            chunk_index=chunk_index,
                            content=content,
                            category=f"{current_category} ({current_stage})",
                            age_min=age_min,
                            age_max=age_max,
                            tags=list(current_tags),
                            situation=situation_str,
                            parent_response=protocol_str,
                            source_metadata=SourceMetadata(
                                source_name=doc.source_name,
                                page_number=page_num,
                            ),
                        )
                        chunks.append(chunk)
                        chunk_index += 1

                i += 1

        return chunks

    # ------------------------------------------------------------------ #
    # Legacy format parser (original logic, extracted into a method)       #
    # ------------------------------------------------------------------ #

    @staticmethod
    def _parse_legacy_format(
        reader: pypdf.PdfReader,
        doc: KnowledgeDocument,
    ) -> List[KnowledgeChunk]:
        """
        Original parser for Parentingpdf.pdf CDC Positive Parenting Protocols.
        Extracts structured action-response pairs with age bounds, tags, and
        page traceability.
        """
        chunks: List[KnowledgeChunk] = []
        chunk_index = 0

        current_category = "General Parenting"
        current_age_min, current_age_max = 0, 18

        for page_idx, page in enumerate(reader.pages):
            page_num = page_idx + 1
            page_text = page.extract_text() or ""
            lines = page_text.splitlines()

            i = 0
            while i < len(lines):
                line = lines[i].strip()

                # Detect Category header (e.g., "Category: Infants (0-1 Year)")
                if line.startswith("Category:"):
                    current_category = line.replace("Category:", "").strip()
                    cat_lower = current_category.lower()
                    for cat_key, (amin, amax) in PDFKnowledgeParser.CATEGORY_AGE_MAP.items():
                        if cat_key in cat_lower:
                            current_age_min, current_age_max = amin, amax
                            break

                # Detect Tags (e.g., "[Tags: infant, crying, soothing]")
                if line.startswith("[Tags:"):
                    tags_raw = line.replace("[Tags:", "").replace("]", "").strip()
                    tags = [t.strip() for t in tags_raw.split(",") if t.strip()]

                    situation_lines: List[str] = []
                    protocol_lines: List[str] = []
                    i += 1

                    # Collect Child Action lines
                    while i < len(lines) and "Protocol:" not in lines[i]:
                        if lines[i].strip().startswith("Child Action"):
                            situation_lines.append(lines[i].strip())
                        elif situation_lines:
                            situation_lines.append(lines[i].strip())
                        i += 1

                    # Collect Protocol lines
                    if i < len(lines) and "Protocol:" in lines[i]:
                        protocol_lines.append(lines[i].strip())
                        i += 1
                        while i < len(lines) and (
                            re.match(r'^\d+\.', lines[i].strip()) or
                            (protocol_lines and
                             not lines[i].strip().startswith("Category:") and
                             not lines[i].strip().startswith("[Tags:"))
                        ):
                            if (lines[i].strip().startswith("Category:") or
                                    lines[i].strip().startswith("[Tags:")):
                                break
                            protocol_lines.append(lines[i].strip())
                            i += 1
                        i -= 1  # backtrack so outer loop catches next header

                    situation_str = " ".join(situation_lines).strip()
                    protocol_str = "\n".join(protocol_lines).strip()

                    if situation_str and protocol_str:
                        content = (
                            f"Category: {current_category}\n"
                            f"Tags: {', '.join(tags)}\n"
                            f"{situation_str}\n"
                            f"{protocol_str}"
                        )
                        content_hash = hashlib.sha256(content.encode()).hexdigest()[:16]
                        chunk_id = f"{doc.id}_chunk_{chunk_index}_{content_hash}"

                        chunk = KnowledgeChunk(
                            id=chunk_id,
                            document_id=doc.id,
                            chunk_index=chunk_index,
                            content=content,
                            category=current_category,
                            age_min=current_age_min,
                            age_max=current_age_max,
                            tags=tags,
                            situation=situation_str,
                            parent_response=protocol_str,
                            source_metadata=SourceMetadata(
                                source_name=doc.source_name,
                                page_number=page_num,
                            ),
                        )
                        chunks.append(chunk)
                        chunk_index += 1

                i += 1

        return chunks
