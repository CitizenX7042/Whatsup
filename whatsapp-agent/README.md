# WhatsApp Agent

A personal WhatsApp agent that processes messages through an LLM and responds. Designed for local development on WSL with incremental setup.

## Purpose

- Receive messages (mock console or WhatsApp)
- Process through a local gateway/orchestrator
- Send context to an LLM (mock or real)
- Return the response
- Persist in Azure SQL or in-memory
- Load persistent memory from Markdown files
- Support a secure tools framework

This is a **personal agent** for your own use—not multi-user or SaaS.

## Current Working Flow

1. **Start the app** – `npm run dev`
2. **Type a message** in the terminal and press Enter
3. **Gateway** receives it, loads memory and history from the configured persistence layer
4. **Mock LLM** (or real LLM if configured) generates a response
5. **Response** is stored and printed back to the console

## What's Mock vs Real

| Component | Default (Mock) | Real (When Configured) |
|-----------|----------------|-------------------------|
| **Transport** | `MockConsoleTransport` – read/write from terminal | `WhatsAppBaileysTransport` – placeholder, not yet implemented |
| **Persistence** | `InMemoryChatRepository` / `InMemoryMessageRepository` | `AzureSqlChatRepository` / `AzureSqlMessageRepository` |
| **LLM** | `MockLlmClient` – deterministic test responses | Azure OpenAI or OpenAI provider |

---

## Azure OpenAI Setup

### Create the resource

You can create an Azure OpenAI resource in either:

- **Azure Portal** – Create resource → Search "Azure OpenAI" → Create
- **Azure AI Studio / Azure AI Foundry** – [portal.azure.com](https://portal.azure.com) → Create a resource → "Azure OpenAI"

### Steps

1. **Create the resource**
   - Name it (e.g. `my-openai`)
   - Choose subscription, resource group, region
   - Create

2. **Deploy a model**
   - Open the resource → **Model deployments** (or **Azure AI Studio** → **Deployments**)
   - **+ Create new deployment**
   - Pick a model (e.g. `gpt-4o-mini` or `gpt-4o`)
   - Set deployment name (e.g. `gpt-4o-mini`)
   - Deploy

3. **Get credentials**
   - **Keys and Endpoint** (or **Resource management** → **Keys and endpoint**)
   - Copy:
     - **Endpoint** (e.g. `https://my-openai.openai.azure.com`)
     - **Key 1** (API key)

### .env variables

Add to `.env`:

```
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
AZURE_OPENAI_API_KEY=your-key-here
AZURE_OPENAI_DEPLOYMENT=gpt-4o-mini
```

Optional (defaults shown):

```
AZURE_OPENAI_API_VERSION=2024-02-01
AZURE_OPENAI_TIMEOUT_MS=60000
AZURE_OPENAI_MAX_RETRIES=3
```

### Verify

Start the app and check logs for:

- `"llm": "azure-openai"`
- `Azure OpenAI request completed` after sending a message

---

## Azure SQL Setup

### Required .env Variables

To use Azure SQL instead of in-memory, set **all four** of these in `.env`:

```
AZURE_SQL_SERVER=yourserver.database.windows.net
AZURE_SQL_DATABASE=yourdb
AZURE_SQL_USER=youruser
AZURE_SQL_PASSWORD=yourpassword
```

Optional (defaults shown):

```
AZURE_SQL_PORT=1433
AZURE_SQL_TRUST_SERVER_CERTIFICATE=false
AZURE_SQL_CONNECTION_TIMEOUT=15000
AZURE_SQL_REQUEST_TIMEOUT=15000
```

### Run the Schema Script

1. Connect to your Azure SQL Database (Azure Data Studio, SSMS, or `sqlcmd`)
2. Execute `scripts/azure-schema.sql` against the database
3. This creates `chats` and `messages` tables with indexes

Example with sqlcmd:

```bash
sqlcmd -S yourserver.database.windows.net -d yourdb -U youruser -P yourpassword -i scripts/azure-schema.sql
```

### Verify Azure SQL is Being Used

1. Start the app: `npm run dev`
2. Check startup logs for:
   - `"persistence": "azure-sql"` – Azure SQL is active
   - `"Startup: Azure SQL connection verified"` – connection succeeded
3. If you see `"persistence": "in-memory"` – Azure SQL vars are missing or incomplete
4. If you see `"Startup: Azure SQL connection FAILED"` – check credentials and firewall

### Firewall

Ensure your IP is allowed in the Azure SQL server firewall (Azure Portal → SQL server → Networking).

---

## Manual Test: Full Flow with MockConsoleTransport

1. Set Azure SQL vars in `.env` (or leave unset for in-memory)
2. Run `npm run dev`
3. Wait for "Agent ready" and the `>` prompt
4. Type `Hello` and press Enter
5. You should see:
   - `[Agent] [Mock LLM] You said: "Hello"...`
   - Logs: "Gateway: processing message", "Gateway: LLM request start/end"
6. Type another message – the mock LLM will echo it
7. With Azure SQL: query `SELECT * FROM messages` to see stored messages

---

## Setup on WSL

### Prerequisites

- Node.js 18+
- (Optional) Azure SQL Database for persistence
- (Optional) LLM API key for real responses

### Install

```bash
cd whatsapp-agent
npm install
```

### Configure

```bash
cp .env.example .env
# Edit .env - defaults work for local testing (mock transport, in-memory DB, mock LLM)
```

### Run (Local Testing)

```bash
npm run dev
```

- Type a message and press Enter
- The mock LLM responds
- With in-memory: messages lost on restart
- With Azure SQL: messages persisted

---

## Architecture

```
Transport (mock/WhatsApp) → Gateway → LLM (mock/OpenAI/Azure)
                                ↓
                    Repositories (in-memory/Azure SQL)
                                ↓
                    Memory (Markdown files)
```

### Folder Structure

```
whatsapp-agent/
  src/
    index.ts
    app/container.ts
    app/startupDiagnostics.ts
    config/env.ts
    transport/
    core/
    llm/
    memory/
    db/
      interfaces.ts
      azureSql/             # Connection, ChatRepository, MessageRepository
      inMemory/
    tools/
    security/
    utils/
  scripts/
    azure-schema.sql
  data/memory/
```

---

## Debugging

- `LOG_LEVEL=debug` for verbose logs
- Flow: `MockConsoleTransport` → `messageRouter` → `gateway` → `contextBuilder` → `llm`
- **If DB insert/select fails**: start with `src/db/azureSql/connection.ts` (connection) then `AzureSqlMessageRepository.ts` (queries)
- With Azure SQL: inspect tables `chats` and `messages` in your database

---

## Security

- Auth/session handling is encapsulated
- No secrets in logs (redaction)
- Path allowlists for file tools
- Command allowlists for shell tools
- Timeouts and output truncation

---

## Known Limitations

- WhatsApp transport is a placeholder
- Tools are registered but not invoked by the LLM (no function-calling yet)
