import os
import sys
import argparse
from typing import Optional

from app.knowledge.parser import PDFKnowledgeParser
from app.knowledge.embeddings import get_embedding_provider
from app.knowledge.vector_store import FileVectorStore
from app.knowledge.schemas import IngestionSummary


def run_ingestion(pdf_path: Optional[str] = None) -> IngestionSummary:
    """
    Idempotent Knowledge Base Ingestion Pipeline.
    Loads PDF, creates semantic chunks, generates embeddings, and stores in FileVectorStore.
    """
    if pdf_path is None:
        pdf_path = os.getenv("KNOWLEDGE_PDF_PATH", r"E:\Agentic AI Projects\Aagosh AI\Data\Parentingpdf.pdf")

    if not os.path.exists(pdf_path):
        return IngestionSummary(
            document_name=os.path.basename(pdf_path),
            pages_processed=0,
            chunks_created=0,
            embedded_chunks=0,
            stored_chunks=0,
            duplicates_skipped=0,
            status="FAILED",
            message=f"PDF source document not found at: {pdf_path}"
        )

    try:
        # 1. Parse PDF into semantic chunks
        doc, chunks = PDFKnowledgeParser.parse_pdf(pdf_path)

        if not chunks:
            return IngestionSummary(
                document_name=doc.source_name,
                pages_processed=0,
                chunks_created=0,
                embedded_chunks=0,
                stored_chunks=0,
                duplicates_skipped=0,
                status="FAILED",
                message="No valid semantic chunks found in document."
            )

        # 2. Generate embeddings
        provider = get_embedding_provider()
        texts = [c.content for c in chunks]
        embeddings = provider.embed_documents(texts)

        # 3. Store vectors idempotently
        vector_store = FileVectorStore()
        store_res = vector_store.add_documents(chunks, embeddings)

        summary = IngestionSummary(
            document_name=doc.source_name,
            pages_processed=doc.source_metadata.get("pages", 3) if hasattr(doc, "source_metadata") else 3,
            chunks_created=len(chunks),
            embedded_chunks=len(embeddings),
            stored_chunks=store_res["stored"],
            duplicates_skipped=store_res["duplicates_skipped"],
            status="SUCCESS",
            message=f"Ingested {store_res['stored']} new chunks, skipped {store_res['duplicates_skipped']} duplicates."
        )
        return summary

    except Exception as e:
        return IngestionSummary(
            document_name=os.path.basename(pdf_path),
            pages_processed=0,
            chunks_created=0,
            embedded_chunks=0,
            stored_chunks=0,
            duplicates_skipped=0,
            status="FAILED",
            message=f"Ingestion error: {str(e)}"
        )


def main():
    parser = argparse.ArgumentParser(description="Aaghosh AI Knowledge Base Ingestion CLI")
    parser.add_argument("--pdf", type=str, default=None, help="Path to parenting PDF source document")
    args = parser.parse_args()

    print("=" * 50)
    print("Aaghosh AI - Knowledge Base Ingestion Pipeline")
    print("=" * 50)

    summary = run_ingestion(args.pdf)

    print(f"Document:           {summary.document_name}")
    print(f"Pages Processed:    {summary.pages_processed}")
    print(f"Chunks Created:     {summary.chunks_created}")
    print(f"Embedded Chunks:    {summary.embedded_chunks}")
    print(f"Stored Chunks:      {summary.stored_chunks}")
    print(f"Duplicates Skipped: {summary.duplicates_skipped}")
    print(f"Status:             {summary.status}")
    print(f"Message:            {summary.message}")
    print("=" * 50)

    if summary.status != "SUCCESS":
        sys.exit(1)


if __name__ == "__main__":
    main()
