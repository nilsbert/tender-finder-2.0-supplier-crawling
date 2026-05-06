import os
import logging
import requests
from typing import Optional
import PyPDF2
import docx

logger = logging.getLogger(__name__)

class DocumentProcessor:
    @staticmethod
    def download_file(url: str, dest_path: str) -> bool:
        try:
            response = requests.get(url, timeout=30, stream=True)
            response.raise_for_status()
            with open(dest_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            return True
        except Exception as e:
            logger.error(f"Failed to download file from {url}: {e}")
            return False

    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        text = ""
        try:
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page_num in range(len(reader.pages)):
                    page = reader.pages[page_num]
                    text += page.extract_text() + "\n"
        except Exception as e:
            logger.error(f"Error extracting text from PDF {file_path}: {e}")
        return text

    @staticmethod
    def extract_text_from_docx(file_path: str) -> str:
        try:
            doc = docx.Document(file_path)
            return "\n".join([para.text for para in doc.paragraphs])
        except Exception as e:
            logger.error(f"Error extracting text from DOCX {file_path}: {e}")
            return ""

    @classmethod
    def process_file(cls, file_path: str) -> str:
        """Extracts text based on file extension."""
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            return cls.extract_text_from_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            # Note: .doc might require a different library, but python-docx is mainly for .docx
            return cls.extract_text_from_docx(file_path)
        elif ext == ".txt":
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    return f.read()
            except:
                return ""
        return ""

    @classmethod
    def to_markdown(cls, filename: str, content: str) -> str:
        """Wraps content in markdown format."""
        return f"\n\n## Document: {filename}\n\n{content}\n\n---\n"
