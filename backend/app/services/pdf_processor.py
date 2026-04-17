"""
PDF Processing Service

Handles loading, parsing, and chunking of PDF documents.
Uses LangChain for document loading and text splitting.
"""

import os
import tempfile
from dataclasses import dataclass

from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from ..config import get_settings


@dataclass
class ProcessedPDF:
    """
    Result of PDF processing.
    
    Attributes:
        chunks: List of document chunks
        file_name: Original file name
        total_pages: Number of pages in PDF
        total_chunks: Number of chunks created
    """
    chunks: list[Document]
    file_name: str
    total_pages: int
    total_chunks: int


class PDFProcessor:
    """
    Service for processing PDF documents.
    
    Handles:
    - Loading PDF files
    - Splitting into manageable chunks
    - Text cleaning and preprocessing
    
    Usage:
        processor = PDFProcessor()
        result = processor.process_file(uploaded_file)
    """
    
    def __init__(
        self,
        chunk_size: int | None = None,
        chunk_overlap: int | None = None
    ):
        """
        Initialize the PDF processor.
        
        Args:
            chunk_size: Size of text chunks (default from settings)
            chunk_overlap: Overlap between chunks (default from settings)
        """
        settings = get_settings()
        self.chunk_size = chunk_size or settings.chunk_size
        self.chunk_overlap = chunk_overlap or settings.chunk_overlap
        
        # Overlap preserves context across chunk boundaries (important for legal/technical PDFs).
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],  # Prioritize semantic breaks
        )
    
    def process_file(self, file_path: str, file_name: str = "document.pdf") -> ProcessedPDF:
        """
        Process a PDF file into chunks.
        
        Args:
            file_path: Path to the PDF file
            file_name: Original file name for metadata
            
        Returns:
            ProcessedPDF with chunks and metadata
            
        Raises:
            ValueError: If file is not a valid PDF
            IOError: If file cannot be read
        """
        # Load PDF using PyPDFLoader
        loader = PyPDFLoader(file_path)
        documents = loader.load()
        
        if not documents:
            raise ValueError("PDF appears to be empty or could not be parsed")
        
        # Add metadata to each document
        for doc in documents:
            doc.metadata["source_file"] = file_name
        
        # Split documents into chunks
        chunks = self.text_splitter.split_documents(documents)
        
        # Add chunk indices to metadata
        for i, chunk in enumerate(chunks):
            chunk.metadata["chunk_index"] = i
            chunk.metadata["total_chunks"] = len(chunks)
        
        return ProcessedPDF(
            chunks=chunks,
            file_name=file_name,
            total_pages=len(documents),
            total_chunks=len(chunks)
        )
    
    def process_uploaded_file(self, file_content: bytes, file_name: str) -> ProcessedPDF:
        """
        Process an uploaded file from bytes.
        
        Creates a temporary file, processes it, then cleans up.
        
        Args:
            file_content: Raw file bytes
            file_name: Original file name
            
        Returns:
            ProcessedPDF with chunks and metadata
        """
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(file_content)
            tmp_path = tmp_file.name
        
        try:
            # Process the temporary file
            result = self.process_file(tmp_path, file_name)
            return result
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
