import os
import re
import hashlib
import pypdf
from typing import List, Tuple, Dict, Any
from app.knowledge.schemas import KnowledgeDocument, KnowledgeChunk, SourceMetadata


class PDFKnowledgeParser:
    """
    Semantic parser for Parentingpdf.pdf CDC Positive Parenting Protocols.
    Extracts structured action-response pairs with age bounds, tags, and page traceability.
    """
    CATEGORY_AGE_MAP = {
        "infants": (0, 1),
        "toddlers": (1, 3),
        "preschoolers": (3, 5),
        "school-age": (6, 14),
        "adolescence": (15, 18),
    }

    @staticmethod
    def parse_pdf(file_path: str) -> Tuple[KnowledgeDocument, List[KnowledgeChunk]]:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF source document not found at: {file_path}")

        reader = pypdf.PdfReader(file_path)
        source_filename = os.path.basename(file_path)

        doc = KnowledgeDocument(
            id=hashlib.md5(source_filename.encode()).hexdigest()[:16],
            title="Comprehensive CDC Positive Parenting Protocols",
            source_name=source_filename,
            source_type="pdf",
            source_reference=file_path,
            version="1.0",
            status="active"
        )

        chunks: List[KnowledgeChunk] = []
        chunk_index = 0

        # Global category state across pages
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
                    # Determine age range
                    cat_lower = current_category.lower()
                    for cat_key, (amin, amax) in PDFKnowledgeParser.CATEGORY_AGE_MAP.items():
                        if cat_key in cat_lower:
                            current_age_min, current_age_max = amin, amax
                            break

                # Detect Tags (e.g., "[Tags: infant, crying, soothing, emotional regulation]")
                if line.startswith("[Tags:"):
                    tag_line = line
                    tags_raw = tag_line.replace("[Tags:", "").replace("]", "").strip()
                    tags = [t.strip() for t in tags_raw.split(",") if t.strip()]

                    # Look ahead for Child Action and Protocol
                    situation_lines = []
                    protocol_lines = []
                    i += 1

                    # Collect Child Action lines
                    while i < len(lines) and not ("Protocol:" in lines[i]):
                        if lines[i].strip().startswith("Child Action"):
                            act_line = lines[i].strip()
                            situation_lines.append(act_line)
                        elif situation_lines:
                            situation_lines.append(lines[i].strip())
                        i += 1

                    # Collect Protocol lines
                    if i < len(lines) and "Protocol:" in lines[i]:
                        protocol_header = lines[i].strip()
                        protocol_lines.append(protocol_header)
                        i += 1
                        while i < len(lines) and (
                            re.match(r'^\d+\.', lines[i].strip()) or
                            (protocol_lines and not lines[i].strip().startswith("Category:") and not lines[i].strip().startswith("[Tags:"))
                        ):
                            if lines[i].strip().startswith("Category:") or lines[i].strip().startswith("[Tags:"):
                                break
                            protocol_lines.append(lines[i].strip())
                            i += 1
                        # Backtrack 1 step so outer loop catches next Category/Tag header
                        i -= 1

                    situation_str = " ".join(situation_lines).strip()
                    protocol_str = "\n".join(protocol_lines).strip()

                    if situation_str and protocol_str:
                        content = f"Category: {current_category}\nTags: {', '.join(tags)}\n{situation_str}\n{protocol_str}"

                        # Generate deterministic chunk ID based on doc ID + content hash
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
                                source_name=source_filename,
                                page_number=page_num
                            )
                        )
                        chunks.append(chunk)
                        chunk_index += 1

                i += 1

        return doc, chunks
