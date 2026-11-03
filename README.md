# Multi-Agent Financial Assistant

A Next.js chat app backed by three independent A2A agents: Lady Ahorro, Feminanzas, and a Super Agent that routes and synthesizes their answers.

## Documentation

- [Architecture](docs/architecture.md) — system components and request lifecycle
- [A2A Communication](docs/a2a-communication.md) — Agent2Agent protocol usage
- [RAG Pipelines](docs/rag-pipelines.md) — knowledge ingestion, retrieval, and generation
- [Frontend Integration](docs/frontend-integration.md) — chat UI and `/api/chat` adapter
- [Development Guide](docs/development.md) — setup, scripts, and local services

## Getting Started

### Requirements

- Node.js
- Yarn
- OpenAI API key
- `wget` (for knowledge-base downloads)

### Installation

```bash
yarn install
```

Configure your environment variables in `.env`:

```env
OPENAI_API_KEY=your_openai_api_key
```

### Download knowledge-base content

```bash
yarn download-lady
yarn download-femi
```

These scripts crawl Lady Ahorro and Feminanzas into local HTML directories. Vector stores are built lazily in memory the first time each specialist handles a request — you do not need a separate ingest step for normal local development.

### Run the application

Start each agent in a separate terminal:

**Terminal 1 — Lady Ahorro**
```bash
yarn lady-agent
```

**Terminal 2 — Feminanzas**
```bash
yarn femi-agent
```

**Terminal 3 — Super Agent**
```bash
yarn super-agent
```

**Terminal 4 — Next.js application**
```bash
yarn dev
```

The application will be available at:

`http://localhost:3000`

Make sure all three agent servers are running before using the chat.
