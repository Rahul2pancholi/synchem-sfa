# Insights Service (AI Analytics Chatbot)

Extractable microservice for **natural-language analytics** over SFA data.

**Architecture:** Knowledge Graph → Semantic Layer → LLM (intent only) → SQL Validation → read-only DB.

Full plan: [docs/25-AI-ANALYTICS-CHATBOT-PLAN.md](../../docs/25-AI-ANALYTICS-CHATBOT-PLAN.md)

## Status

**Scaffold only** — health + chat stub returns `503 INSIGHTS_NOT_READY`. No LLM keys or DB required.

## Run locally

```bash
pnpm install
pnpm dev:insights
curl http://localhost:3010/api/v1/health
```

## Environment

Copy `.env.example` to `.env`. For local dev (no Docker), point `MAIN_API_URL` at running API (`http://localhost:3000`) and set the same `INTERNAL_API_KEY` in `apps/api/.env.local`.

**Admin configures** provider, API key, model, and prompts at **Admin → AI Chatbot Settings** (`/app/insightsChatConfig`).

| Variable | Default | Purpose |
|----------|---------|---------|
| `INSIGHTS_PORT` | `3010` | HTTP port |
| `INSIGHTS_CORS_ORIGINS` | `http://localhost:5173` | Web app origins |
| `JWT_SECRET` | — | Phase D: verify JWT (shared with API) |
| `INSIGHTS_DATABASE_URL` | — | Phase D: read-only Postgres user |
| `LLM_PROVIDER` | `stub` | `openai` \| `gemini` \| `stub` |

## API (draft)

```
POST /api/v1/insights/chat
Authorization: Bearer <jwt>
{ "message": "...", "locale": "hinglish" }
```

## Future extraction

Deploy as separate container; main API can proxy `/api/v1/insights/*` to this service.
