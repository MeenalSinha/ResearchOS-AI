"""
Extracts raw text from uploaded resumes/transcripts. Supports text PDFs
via pypdf and falls back to OCR (pytesseract + pdf2image) for scanned
documents.
"""
import io
from pypdf import PdfReader


def extract_text_from_upload(filename: str, content: bytes) -> str:
    if filename.lower().endswith(".pdf"):
        return _extract_pdf_text(content)
    if filename.lower().endswith((".txt", ".md")):
        return content.decode("utf-8", errors="ignore")
    # Unsupported format fallback - return empty, frontend should validate file types.
    return ""


def _extract_pdf_text(content: bytes) -> str:
    reader = PdfReader(io.BytesIO(content))
    text_parts = [page.extract_text() or "" for page in reader.pages]
    text = "\n".join(text_parts).strip()
    if text:
        return text
    return _ocr_fallback(content)


def _ocr_fallback(content: bytes) -> str:
    """Used when a PDF has no extractable text layer (scanned document)."""
    try:
        from pdf2image import convert_from_bytes
        import pytesseract

        images = convert_from_bytes(content)
        return "\n".join(pytesseract.image_to_string(img) for img in images)
    except Exception:
        return ""
