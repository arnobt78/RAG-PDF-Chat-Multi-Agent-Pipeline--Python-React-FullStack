# RAG PDF Chat

A professional, production-ready application for chatting with PDF documents using AI-powered Retrieval Augmented Generation (RAG). Built with FastAPI, React, TypeScript, and LangChain.

## Features

- **PDF Analysis** - Upload any PDF and let AI understand its content
- **Smart Retrieval** - FAISS vector store with semantic similarity search
- **AI-Powered Answers** - Multi-model support via OpenRouter, Groq, and more
- **Multi-Agent Pipeline** - Professional RAG architecture with Extractor → Analyzer → Synthesizer → Validator
- **Modern UI** - Glassmorphism design with Framer Motion animations
- **Production Ready** - Vercel deployment configuration included

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS with custom glassmorphism design system
- Framer Motion for animations
- Vite for fast development and building
- React Router for navigation

### Backend
- FastAPI with Python 3.11+
- LangChain for RAG pipeline
- FAISS for vector storage
- OpenRouter/Groq/OpenAI for LLM access
- Multi-agent architecture

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- An API key from [OpenRouter](https://openrouter.ai/keys) (or other supported provider)

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd rag-pdf-chat
```

2. **Setup Backend**

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY
```

3. **Setup Frontend**

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional, for production API URL)
cp .env.example .env
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

## Project Structure

```
rag-pdf-chat/
├── frontend/                    # React TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # Reusable UI components
│   │   │   ├── layout/         # Header, Footer, PageWrapper
│   │   │   ├── chat/           # Chat-specific components
│   │   │   └── sections/       # Homepage sections
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utilities and API client
│   │   ├── types/              # TypeScript types
│   │   ├── context/            # React Context providers
│   │   └── pages/              # Page components
│   ├── public/                 # Static assets
│   ├── vercel.json             # Vercel deployment config
│   └── package.json
│
├── backend/                     # FastAPI Python backend
│   ├── app/
│   │   ├── routes/             # API endpoints
│   │   ├── services/           # Business logic
│   │   ├── agents/             # Multi-agent pipeline
│   │   ├── models/             # Pydantic schemas
│   │   ├── config.py           # Configuration
│   │   └── main.py             # FastAPI app
│   ├── requirements.txt
│   └── .env.example
│
└── docs/                        # Documentation
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/health` | Detailed health status |
| GET | `/status` | PDF loading status |
| GET | `/models` | List available AI models |
| POST | `/upload` | Upload and process PDF |
| POST | `/ask` | Ask a question about the PDF |

## Multi-Agent Pipeline

The backend implements a professional multi-agent architecture:

```
Question → Extractor → Analyzer → Synthesizer → Validator → Answer
              ↓           ↓            ↓            ↓
          Retrieves   Filters     Generates    Validates
          chunks      quality     response     quality
```

## Environment Variables

### Backend (.env)
```env
OPENROUTER_API_KEY=sk-or-v1-your_key_here
OPENROUTER_API_BASE=https://openrouter.ai/api/v1
DEFAULT_MODEL=openai/gpt-4o-mini
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
```

## Deployment

### Frontend (Vercel)

The frontend is configured for Vercel deployment with SPA routing:

```bash
cd frontend
vercel
```

### Backend (Docker/VPS)

A Dockerfile is available for container deployment:

```bash
cd backend
docker build -t rag-pdf-chat-api .
docker run -p 8000:8000 --env-file .env rag-pdf-chat-api
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT

## Credits

Built with:
- [LangChain](https://langchain.com/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
