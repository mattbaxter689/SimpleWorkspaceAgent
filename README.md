# SimpleWorkspaceAgent
 
A simple TypeScript agent, served via an HTTP API, that answers natural-language questions about your Azure Machine Learning workspace.
 
> **Status:** 🚧 Work in progress

**Why this project**: TypeScript has been interesting me more and more lately, and I saw the agent as a good
way to grasp a better understanding of working with TypeScript, and it also removes the need to constantly check the Azure portal for updates on jobs and their statuses
 
## Overview
 
SimpleWorkspaceAgent connects to an Azure ML workspace and exposes an API endpoint where you can ask questions about it. The agent uses an LLM together with tools that query the workspace, and returns an answer in plain language.
 
<!-- TODO: Confirm/expand. Example questions the agent can answer: -->
 
**Example questions**
 
- "What models are registered in my workspace?"
- "What data assets exist in my workspace, and what are their versions?"

*Questions I want to Enable*
- "What jobs failed last week?"
- "Can you create this data asset for me?"
- "What environments are available and their latest versions"
- "What compute clusters do we have?"

## Tech Stack
 
| Area | Technology |
| --- | --- |
| Runtime | [Bun](https://bun.com) |
| Language | TypeScript |
| Web framework | [Hono](https://hono.dev) with `@hono/zod-openapi` (typed routes + OpenAPI spec) |
| Agent / LLM layer | [Vercel AI SDK](https://ai-sdk.dev) (`ai`) |
| LLM provider | Google Gemini |
| Azure access | `@azure/arm-machinelearning`, `@azure/storage-blob`, `@azure/identity` |
| Validation | [Zod](https://zod.dev) |
| Logging | [Pino](https://getpino.io) via `@hono/structured-logger` |
| Config parsing | `yaml` |
| Task runner | [just](https://github.com/casey/just) |
 
## Architecture
**Work in Progress** 
 
### Agent tools
**Work in Progress**
 
| Tool | Description |
| --- | --- |
| *TODO* | *e.g. list registered models* |
| *TODO* | *e.g. list recent jobs and their status* |
| *TODO* | *e.g. read blob/job output from storage* |
 
## Project Structure
**Work in Progress**
Will update once project is further along
 
## Prerequisites
 
- [Bun](https://bun.com) (project was created with v1.4.2)
- An Azure subscription with an existing Azure ML workspace
- Azure credentials available to `DefaultAzureCredential` (e.g. `az login`) — *TODO: confirm auth method*
- An API key for your LLM provider *(TODO: confirm provider)*
- *(Optional)* [just](https://github.com/casey/just)
## Getting Started
 
### 1. Clone and install
 
```bash
git clone https://github.com/mattbaxter689/SimpleWorkspaceAgent.git
cd SimpleWorkspaceAgent
bun install
```
 
### 2. Configure environment
 
```bash
cp .env.example .env
```
 
Then fill in `.env`:
 
| Variable | Description |
| --- | --- |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription containing your workspace |
| `AZURE_RESOURCE_GROUP` | Resource group of the workspace |
| `AZURE_WORKSPACE_NAME` | Name of the Azure ML workspace |
| `GEMINI_API_KEY` | API key for Gemini |
 
### 4. Run
 
```bash
bun start
# or
just run
```
 
The server will start on `http://localhost:3000`
 
## API Usage
**Work in Progress** 
 
## Development
 
| Command | Description |
| --- | --- |
| `bun install` | Install dependencies |
| `bun start` | Run the server (`bun run src/index.ts`) |
| `just run` | Same as `bun start`, with `.env` loaded |
 
 
## Roadmap
 
- [ ] Finalize LLM provider setup (billing account for API key)
- [ ] *TODO: additional tools / workspace resources to support*
- [ ] *TODO: tests*
- [ ] *TODO: Dockerfile / deployment*
## Security Notes
 
- Never commit your `.env` file (it is listed in `.gitignore`).
- Use least-privilege Azure credentials — a read-only role is sufficient if the agent only reads workspace data. *(TODO: confirm the agent is read-only)*
