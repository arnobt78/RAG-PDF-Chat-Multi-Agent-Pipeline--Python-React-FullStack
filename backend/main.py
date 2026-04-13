import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
import tempfile
import shutil

# Load environment variables
load_dotenv()

# OpenRouter configuration (OpenAI-compatible)
OPENAI_API_BASE = os.getenv("OPENAI_API_BASE", "https://openrouter.ai/api/v1")

# Initialize FastAPI app
app = FastAPI(
    title="PDF Chat API",
    description="Chat with your PDF using Retrieval Augmented Generation",
    version="1.0.0"
)

# Add CORS middleware to allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to store the QA chain and vector store
qa_chain = None
vectorstore = None

class QuestionRequest(BaseModel):
    question: str

class AnswerResponse(BaseModel):
    answer: str

def format_docs(docs):
    """Format retrieved documents into a single string."""
    return "\n\n".join(doc.page_content for doc in docs)

def load_and_process_pdf(pdf_path: str):
    """Load PDF and create vector store with embeddings."""
    global qa_chain, vectorstore
    
    # Load the PDF
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()
    
    # Split documents into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = text_splitter.split_documents(documents)
    
    # Create embeddings and vector store (using OpenRouter)
    embeddings = OpenAIEmbeddings(
        base_url=OPENAI_API_BASE,
        model="openai/text-embedding-3-small"
    )
    vectorstore = FAISS.from_documents(chunks, embeddings)
    
    # Create the retrieval QA chain using LCEL (LangChain Expression Language)
    llm = ChatOpenAI(
        temperature=0,
        model="openai/gpt-4o-mini",
        base_url=OPENAI_API_BASE
    )
    
    # Create a RAG prompt template
    prompt = ChatPromptTemplate.from_template("""Answer the question based only on the following context:

{context}

Question: {question}

Answer: """)
    
    # Create the retriever
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
    
    # Build the RAG chain using LCEL
    qa_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    
    return len(chunks)

@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "running", "message": "PDF Chat API is ready"}

@app.get("/status")
def get_status():
    """Check if a PDF has been loaded."""
    return {
        "pdf_loaded": qa_chain is not None,
        "message": "PDF is loaded and ready for questions" if qa_chain else "No PDF loaded yet. Please upload a PDF first."
    }

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload and process a PDF file."""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            shutil.copyfileobj(file.file, tmp_file)
            tmp_path = tmp_file.name
        
        # Process the PDF
        num_chunks = load_and_process_pdf(tmp_path)
        
        # Clean up temp file
        os.unlink(tmp_path)
        
        return {
            "message": f"PDF '{file.filename}' processed successfully",
            "chunks_created": num_chunks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@app.post("/ask", response_model=AnswerResponse)
def ask_question(req: QuestionRequest):
    """Ask a question about the uploaded PDF."""
    if qa_chain is None:
        raise HTTPException(
            status_code=400, 
            detail="No PDF has been loaded. Please upload a PDF first using the /upload endpoint."
        )
    
    try:
        result = qa_chain.invoke(req.question)
        return {"answer": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

# Load a default PDF if it exists in the documents folder
@app.on_event("startup")
async def startup_event():
    """Load default PDF on startup if available."""
    default_pdf = os.path.join(os.path.dirname(__file__), "documents", "document.pdf")
    if os.path.exists(default_pdf):
        try:
            load_and_process_pdf(default_pdf)
            print(f"Loaded default PDF: {default_pdf}")
        except Exception as e:
            print(f"Could not load default PDF: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
