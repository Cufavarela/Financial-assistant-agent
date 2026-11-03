# Development Guide

## Prerequisites

Make sure you have the following installed:

- Node.js (use a version compatible with the project dependencies).
- Yarn.
- An OpenAI API key.
- `wget` (used by the knowledge-base download scripts).

## Environment Configuration

Create a `.env` file in the project root and configure the required environment variables.

At minimum, the project needs an OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key
```

Optional agent URL overrides (defaults shown):

```env
LADY_AGENT_URL=http://localhost:3001
SUPER_AGENT_URL=http://localhost:3002
FEMI_AGENT_URL=http://localhost:3003
```

Keep your API key private and never commit your `.env` file.

## Installation

Install the project dependencies:

```bash
yarn install
```

## Knowledge Base Downloads

The project includes scripts to download the source content used by each specialist's RAG pipeline.

```bash
yarn download-lady
yarn download-femi
```

These run `downloadLady.sh` and `downloadFemi.sh`, which use `wget` to save HTML under `ladyahorro.com/` and `feminanzasonline.com/`.

Ingestion into vector stores happens later, lazily inside each specialist process. See [RAG Pipelines](rag-pipelines.md).

## Running the Application

The application consists of four processes that should run simultaneously during local development.

Open separate terminal sessions and start each service:

**1. Lady Ahorro specialist — port 3001**

```bash
yarn lady-agent
```

**2. Feminanzas specialist — port 3003**

```bash
yarn femi-agent
```

**3. Super Agent — port 3002**

```bash
yarn super-agent
```

**4. Frontend — port 3000**

```bash
yarn dev
```

Once all services are running, open:

[http://localhost:3000](http://localhost:3000)

The frontend communicates with the Super Agent, which coordinates requests to the specialist agents.

## Available Scripts

| Command | Description |
|---|---|
| `yarn dev` | Starts the Next.js development server |
| `yarn build` | Builds the application |
| `yarn start` | Starts the production server |
| `yarn lint` | Runs the project's lint command |
| `yarn download-lady` | Downloads Lady Ahorro HTML via `downloadLady.sh` |
| `yarn download-femi` | Downloads Feminanzas HTML via `downloadFemi.sh` |
| `yarn ingest-lady` | Loads `ingest.ts` (see note below) |
| `yarn ingest-femi` | Loads `ingest-femi.ts` (see note below) |
| `yarn lady-agent` | Starts the Lady Ahorro A2A server |
| `yarn femi-agent` | Starts the Feminanzas A2A server |
| `yarn super-agent` | Starts the Super Agent A2A server |

### Ingest script behavior

`yarn ingest-lady` and `yarn ingest-femi` run:

```bash
tsx -r dotenv/config ingest.ts
tsx -r dotenv/config ingest-femi.ts
```

Both files only **export** an async `run()` function. They do not call it when executed as scripts, so these commands currently exit successfully without building a vector store.

Actual ingestion is triggered when a specialist agent first needs its store:

- Lady Ahorro → `getVectorStore()` → imports and calls `run` from `ingest.ts`
- Feminanzas → `getFemiVectorStore()` → imports and calls `run` from `ingest-femi.ts`

Because the project uses in-memory `MemoryVectorStore`, a successful CLI ingest would still discard the store when the process exits. Building the store inside the long-lived agent process is the intended path.

## Local Service Overview

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| Lady Ahorro | `http://localhost:3001` |
| Super Agent | `http://localhost:3002` |
| Feminanzas | `http://localhost:3003` |

Each agent exposes its Agent Card at:

```text
/.well-known/agent-card.json
```

For example:

```text
http://localhost:3002/.well-known/agent-card.json
```

## Development Notes

- Start the specialist agents before sending requests through the frontend.
- The Super Agent uses `lib/agents/config.ts` URLs (or the env overrides above) to reach specialists.
- Each specialist maintains its own RAG pipeline and knowledge base.
- Vector stores are initialized lazily and cached within their respective processes.
- The first request to a specialist after a restart can take longer while HTML is parsed, chunked, and embedded.
- Restart the relevant agent process after changing its implementation.
