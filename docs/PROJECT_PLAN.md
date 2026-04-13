# RAG PDF Chat — project plan & delivery status

**Last updated:** 2026-04-13

This document tracks what is **done** versus what is **still to implement** for this repo (FastAPI + LangChain RAG backend, React/TypeScript Vite frontend, deployment-oriented layout). The original step-by-step tutorial text is preserved in the [Appendix](#appendix-original-tutorial-reference) below.

---

## Completed

### Core RAG & API

- [x] PDF upload, chunking (`RecursiveCharacterTextSplitter`), embeddings, **FAISS** vector store
- [x] **FastAPI** modular app: `app/main.py`, routers for health, upload/status, chat (`/ask`)
- [x] **OpenRouter**-compatible LLM path (`ChatOpenAI` + configurable base URL / model IDs)
- [x] **Multi-provider config** in code: OpenRouter, Groq, direct OpenAI (keys + model lists in `app/config.py`)
- [x] **LCEL-style** RAG answer generation in `LLMService` (prompt → LLM → parser)
- [x] **Pydantic** request/response models; **`pydantic-settings`** for env-based config
- [x] CORS, `.env.example`, default PDF load from `backend/documents/` when present

### Multi-agent pipeline (7 agents)

- [x] **Extractor** → **Analyzer** → **Preprocessor** → **Optimizer** → **Synthesizer** → **Validator** → **Assembler** as separate classes, orchestrated in `AgentPipeline`
- [x] **`GET /pipeline-info`** — JSON description of pipeline stages for UI/docs

### Frontend (showcase)

- [x] **TypeScript** + **Vite** + **React Router** (Home, Chat, About; catch-all → home for SPA)
- [x] **Tailwind CSS**, **Framer Motion**, **Lucide** icons, **CVA**-style UI primitives (button, glass card, scroll reveal, etc.)
- [x] **max-w-9xl** layout, responsive behavior, **glassmorphism** styling
- [x] **Public assets:** `favicon.ico`, `logo.svg`, hero/background via `bg-images/bg-66.avif` (CSS)
- [x] Landing sections: hero, features, how-it-works, **pipeline**, **models/providers**, tech stack, CTA
- [x] Chat UI: PDF upload (drag/drop), messages, suggestions, toolbar (clear / new PDF), typing indicator
- [x] **Model selector UI** (dropdown) — _see “Still to implement” for API wiring_
- [x] **`vercel.json`** — SPA rewrites + basic security/cache headers for static assets
- [x] **ESLint 9** (flat config), TypeScript strict build, production **Vite build** passing

### Deployment & repo hygiene

- [x] **Backend `Dockerfile`** (slim Python, non-root user, healthcheck, `PORT`, `uvicorn app.main:app`)
- [x] **`backend/.dockerignore`**
- [x] **`.gitignore`** coverage for root / backend / frontend (venv, `node_modules`, `.env`, build artifacts, etc.)

---

## Still to implement (recommended next)

### High priority (closes known gaps)

1. **Wire chat model selection to the API**
   - `useChat` currently calls `api.askQuestion(message)` without the selected model id.
   - **Do:** pass `model` from `ModelSelector` into `useChat` (e.g. `sendMessage(message, model)` or hook state) so `/ask` receives `model` consistently. Optionally unify with `ChatContext` so one source of truth drives upload + chat + model.

2. **Optional sources in the UI**
   - Backend supports `include_sources` on `/ask` and Assembler can attach sources.
   - **Do:** add a toggle and display page/source hints on assistant messages when the API returns `sources`.

### Medium priority (plan / “real world” hardening)

1. **Stronger multi-provider failover**
   - Today: provider is chosen from model id + available keys; limited automatic retry across providers on transient failures.
   - **Do:** explicit ordered fallback (e.g. primary model → alternate provider/model) with logging and user-visible “used model X after fallback”.

2. **First-class Gemini & Hugging Face (optional)**
   - Gemini today is mainly reachable **via OpenRouter** model ids, not a separate `AIProvider` + env block.
   - **Do:** add `google-generativeai` or HF Inference API as optional providers in `config.py` + `LLMService`, gated by env keys.

3. **Persist vector store**
   - FAISS is in-memory per process; restart loses index unless default PDF reload path runs.
   - **Do:** save/load FAISS index (disk or object storage) keyed by upload/session.

4. **Streaming answers**
   - **Do:** SSE or WebSocket from backend + incremental assistant message in the chat UI.

### Lower priority (future production — referenced in other docs)

1. **Auth & multi-tenant** — user accounts, per-user document isolation, rate limits.
2. **Observability** — Sentry, structured logging, metrics (see [`Redis_Sentry_PostHog_INTEGRATION_GUIDE.md`](./Redis_Sentry_PostHog_INTEGRATION_GUIDE.md)).
3. **Redis / job queue** — async embedding jobs, deduplication, caching.
4. **E2E / API tests** — pytest for agents/routes; Playwright or similar for critical UI flows.

---

## Appendix: original tutorial (reference)

The text below is the original blog-style walkthrough this project was inspired by. The **implemented codebase** uses updated LangChain import paths (e.g. `langchain_text_splitters`, LCEL instead of deprecated `RetrievalQA.from_chain_type`), a modular FastAPI layout, and the features listed under **Completed** above.

---

How to Chat with Your PDF Using Retrieval Augmented Generation

How to Chat with Your PDF Using Retrieval Augmented Generation
Large language models are good at answering questions, but they have one big limitation: they don’t know what is inside your private documents.

If you upload a PDF like a company policy, research paper, or contract, the model cannot magically read it unless you give it that content.

This is where Retrieval Augmented Generation, or RAG, becomes useful.

RAG lets you combine a language model with your own data. Instead of asking the model to guess, you first retrieve the right parts of the document and then ask the model to answer using that information.

In this article, you will learn how to chat with your own PDF using RAG. You will build the backend using LangChain and create a simple React user interface to ask questions and see answers.

You should be comfortable with basic Python and JavaScript, and have a working knowledge of React and REST APIs. Familiarity with language models and a basic understanding of embeddings or vector search will be helpful but not mandatory.

What We’ll Cover
What Problem Are We Solving?

What Is Retrieval Augmented Generation?

Setting Up the Backend with LangChain

Installing Dependencies

Loading and Splitting the PDF

Creating Embeddings and Vector Store

Creating the Retrieval Chain

Exposing an API with FastAPI

Building a Simple React Chat UI

How the Full Flow Works

Why This Approach Works Well

Common Improvements You Can Add

Final Thoughts

What Problem Are We Solving?
Imagine you have a long PDF with hundreds of pages. Searching manually is slow. Copying text into ChatGPT is not practical.

You want to ask simple questions like “What is the leave policy?” or “What does this contract say about termination?”

A normal language model cannot answer these questions correctly because it has never seen your PDF. RAG solves this by adding a retrieval step before generation.

The system first finds relevant parts of the PDF and then uses those parts as context for the answer.

What Is Retrieval Augmented Generation?
Retrieval Augmented Generation is a pattern with three main steps.

First, your document is split into small chunks. Each chunk is converted into a vector embedding. These embeddings are stored in a vector database.

Second, when a user asks a question, that question is also converted into an embedding. The system searches the vector database to find the most similar chunks.

Third, those chunks are sent to the language model along with the question. The model uses only that context to generate an answer.

This approach keeps answers grounded in your document and reduces hallucinations.

The system has four main parts:

A PDF loader reads the document.

A text splitter breaks it into chunks.

An embedding model converts text into vectors and stores them in a vector store.

A language model answers questions using retrieved chunks.

The frontend is a simple chat interface built in React. It sends the user’s question to a backend API and displays the response.

This type of custom RAG development helps companies build internal tools that work with their own private data instead of sending it to large language models.

Setting Up the Backend with LangChain
We’ll use Python and LangChain for the backend. The backend will load the PDF, build the vector store, and expose an API to answer questions.

Installing Dependencies
Start by installing the required libraries.

pip install langchain langchain-community langchain-openai faiss-cpu pypdf fastapi uvicorn
This setup uses FAISS as a local vector store and OpenAI for embeddings and chat. You can swap these later for other models.

Loading and Splitting the PDF
The first step is to load the PDF and split it into chunks that are small enough for embeddings.

from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

loader = PyPDFLoader("document.pdf")
documents = loader.load()
text_splitter = RecursiveCharacterTextSplitter(
chunk_size=1000,
chunk_overlap=200
)
chunks = text_splitter.split_documents(documents)
Chunking is important. If chunks are too large, embeddings become less accurate. If they are too small, context is lost.

Creating Embeddings and Vector Store
Next, convert the chunks into embeddings and store them in FAISS.

from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_documents(chunks, embeddings)
This step is usually done once. In a real app, you would persist the vector store to disk.

Creating the Retrieval Chain
Now create a retrieval-based question answering chain.

from langchain_openai import ChatOpenAI
from langchain.chains import RetrievalQA

llm = ChatOpenAI(
temperature=0,
model="gpt-4o-mini"
)
qa_chain = RetrievalQA.from_chain_type(
llm=llm,
retriever=vectorstore.as_retriever(search_kwargs={"k": 4}),
return_source_documents=False
)
The retriever finds the top matching chunks. The language model answers using only those chunks.

Exposing an API with FastAPI
Now wrap this logic in an API so the React app can use it.

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()
class QuestionRequest(BaseModel):
question: str
@app.post("/ask")
def ask_question(req: QuestionRequest):
result = qa_chain.run(req.question)
return {"answer": result}
Run the server using this command:

uvicorn main:app --reload
Your backend is now ready.

Building a Simple React Chat UI
Next, build a simple React interface that sends questions to the backend and shows answers.

You can use any React setup. A simple Vite or Create React App project works fine.

Inside your main component, manage the question input and answer state.

import { useState } from "react";

function App() {
const [question, setQuestion] = useState("");
const [answer, setAnswer] = useState("");
const [loading, setLoading] = useState(false);
const askQuestion = async () => {
setLoading(true);
const res = await fetch("<http://localhost:8000/ask>", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ question })
});
const data = await res.json();
setAnswer(data.answer);
setLoading(false);
};
return (

<div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
<h2>Chat with your PDF</h2>
<textarea
value={question}
onChange={(e) => setQuestion(e.target.value)}
rows={4}
style={{ width: "100%" }}
placeholder="Ask a question about the PDF"
/>
<button onClick={askQuestion} disabled={loading}>
{loading ? "Thinking..." : "Ask"}
</button>
<div style={{ marginTop: "1rem" }}>
<strong>Answer</strong>
<p>{answer}</p>
</div>
</div>
);
}
export default App;
This UI is simple but effective. It lets users type a question, sends it to the backend, and shows the answer. Make sure to use the latest version of React to avoid the growing React vulnerabilities.

How the Full Flow Works
When the app starts, the backend has already processed the PDF and built the vector store. When a user types a question, the React app sends it to the API.

The backend converts the question into an embedding. It searches the vector store for similar chunks. Those chunks are passed to the language model as context. The model generates an answer based only on that context.

The answer is sent back to the frontend and displayed to the user.

Why This Approach Works Well
RAG works well because it keeps answers grounded in real data. The model is not guessing – it’s reading from your document.

This approach also scales well. You can add more PDFs, reindex them, and reuse the same chat interface. You can also swap FAISS for a hosted vector database if needed.

Another benefit is control. You decide what data the model can see. This is important for private or sensitive documents.

Common Improvements You Can Add
You can improve this setup in many ways. You can persist the vector store so it doesn’t rebuild on every restart. You can also add document citations to the answer. And you can stream responses for a better chat experience.

You can also add authentication, upload new PDFs from the UI, or support multiple documents per user.

Final Thoughts
Chatting with PDFs using Retrieval Augmented Generation is one of the most practical uses of language models today. It turns static documents into interactive knowledge sources.

With LangChain handling retrieval and a simple React UI for interaction, you can build a useful system with very little code. The same pattern can be used for HR policies, legal documents, technical manuals, or research papers.

Once you understand this flow, you can adapt it to many real world problems where answers must come from trusted documents rather than from the model’s memory alone.
