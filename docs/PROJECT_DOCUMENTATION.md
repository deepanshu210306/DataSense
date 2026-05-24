# DataSense — Complete Project Documentation

**Purpose:** Explain the Chat Layer for Government Data project to technical leads and stakeholders.  
**Application folder:** `datasense/` (inside `Chat_Layer_For_Gov_Data/`)

---

## 1. Executive Summary

**DataSense** is a web chat application that answers natural-language questions about Indian government open data from [data.gov.in](https://data.gov.in).

For each question, the system:

1. Fetches live rows from the selected dataset (2011 Census tables by default).
2. Sends those rows plus the user question to an AI model on the **server** (Groq).
3. Streams a Markdown answer back to the browser.

API keys never go to the browser—they stay in server-side environment variables.

---

## 2. Technology Stack

| Layer | Technology | Why it is used |
|--------|------------|----------------|
| **Framework** | Next.js 16 (App Router) | Single codebase for UI + secure API routes |
| **Language** | TypeScript 5 | Type safety, easier maintenance |
| **UI** | React 19 | Component-based interface |
| **Styling** | Tailwind CSS 4 | Fast styling, dark/light mode |
| **Animation** | Framer Motion 12 | Sidebar, message animations |
| **Icons** | Lucide React | Consistent icons |
| **Markdown rendering** | react-markdown + remark-gfm | Tables, lists, code in AI replies |
| **Notifications** | Sonner | Toasts (errors, rate limits) |
| **Env validation** | Zod 4 | Validate `.env.local` on server start |
| **Government data** | data.gov.in REST API | Official open data (JSON) |
| **AI** | Groq API (`openai/gpt-oss-120b`) | Fast LLM with streaming |
| **Fonts** | Geist (via next/font) | Modern typography |
| **Linting** | ESLint + eslint-config-next | Code quality |

---

## 3. How the System Works (Request Flow)

```
User types question in browser
        │
        ▼
useChat.ts  →  POST /api/chat  { message, datasetId, history }
        │
        ▼
api/chat/route.ts
        │
        ├──► lib/ai/chat-service.ts
        │         ├── getDatasetById()  (registry.ts)
        │         ├── fetchDataGovResource()  (data-gov-in/client.ts)
        │         ├── buildSystemPrompt()  (ai/prompts.ts)
        │         └── streamGroqChat()  (groq/client.ts)
        │
        ▼
Stream of plain text (Markdown) back to browser
        │
        ▼
MessageBubble + MarkdownMessage render the answer
```

**Important:** The AI only sees a **sample** of rows (up to ~50 by default), not the entire national database. Answers must be grounded in that sample.

---

## 4. Folder Structure

```
Chat_Layer_For_Gov_Data/
└── datasense/                          ← Main application
    ├── docs/                           ← Documentation (this file + LaTeX)
    ├── public/                         ← Static files (SVGs, etc.)
    ├── scripts/
    │   └── find-census-resource.mjs    ← Dev tool to find data.gov.in UUIDs
    ├── src/
    │   ├── app/                        ← Next.js routes
    │   │   ├── layout.tsx              ← Root layout, fonts, providers
    │   │   ├── page.tsx                ← Home page → DataSenseApp
    │   │   ├── globals.css             ← Global styles
    │   │   └── api/
    │   │       ├── chat/route.ts       ← Main chat API (streaming)
    │   │       └── datasets/route.ts   ← Public dataset metadata
    │   ├── components/
    │   │   ├── datasense/              ← All UI screens
    │   │   └── providers/              ← Theme + toast wrapper
    │   ├── hooks/
    │   │   └── useChat.ts              ← Chat state + API calls
    │   └── lib/                        ← Business logic
    │       ├── env.ts                  ← Server env (Zod)
    │       ├── errors.ts               ← AppError types
    │       ├── utils.ts                ← CSS class helper
    │       ├── chatThreads.ts          ← Demo sidebar thread names
    │       ├── types/chat.ts           ← API types
    │       ├── datasets/               ← Dataset registry + labels
    │       ├── data-gov-in/            ← data.gov.in HTTP client
    │       ├── groq/                   ← Groq LLM client + rate limits
    │       └── ai/                     ← Prompt builder + orchestrator
    ├── .env.example                    ← Env template (safe to commit)
    ├── .env.local                      ← Real keys (DO NOT commit)
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    └── README.md
```

---

## 5. File-by-File Reference

### 5.1 Configuration (root of `datasense/`)

| File | What it does |
|------|----------------|
| `package.json` | Dependencies and scripts: `npm run dev`, `build`, `start`, `lint` |
| `package-lock.json` | Locked dependency versions |
| `tsconfig.json` | TypeScript settings; `@/` maps to `src/` |
| `next.config.ts` | Next.js configuration |
| `postcss.config.mjs` | Tailwind/PostCSS setup |
| `eslint.config.mjs` | Lint rules |
| `.env.example` | Documents all environment variables |
| `.env.local` | **Your API keys** (gitignored) |
| `README.md` | Developer quick start |

### 5.2 `src/app/` — Pages and API

| File | What it does |
|------|----------------|
| `layout.tsx` | HTML shell, Geist fonts, wraps app in `AppProviders` |
| `page.tsx` | Renders the main `DataSenseApp` component |
| `globals.css` | Tailwind + global theme styles |
| `api/chat/route.ts` | **Core backend:** validates request, runs chat pipeline, streams response |
| `api/datasets/route.ts` | GET list of datasets (labels only, no secrets) |

### 5.3 `src/components/datasense/` — User interface

| File | What it does |
|------|----------------|
| `DataSenseApp.tsx` | Main screen: sidebar + chat + mobile menu; holds selected `datasetId` |
| `Sidebar.tsx` | Navigation, collapse, profile menu, dataset picker, theme toggle |
| `WelcomeHero.tsx` | Welcome screen when chat is empty |
| `MessageList.tsx` | Scrollable message list |
| `MessageBubble.tsx` | One message (user/assistant, loading, errors) |
| `MarkdownMessage.tsx` | Renders AI Markdown (tables, code, etc.) |
| `ChatInput.tsx` | Input box, send, active dataset label |
| `SearchChatsDialog.tsx` | Search demo chat titles (Ctrl+K) |
| `BackgroundBlobs.tsx` | Background decoration |
| `ui/Skeleton.tsx` | Loading skeleton while AI thinks |

### 5.4 `src/components/providers/`

| File | What it does |
|------|----------------|
| `AppProviders.tsx` | Theme provider + toast container |
| `ThemeProvider.tsx` | Dark/light mode (localStorage) |

### 5.5 `src/hooks/`

| File | What it does |
|------|----------------|
| `useChat.ts` | Messages state, `sendMessage`, streaming from `/api/chat`, errors/toasts |

### 5.6 `src/lib/` — Server and shared logic

| File | What it does |
|------|----------------|
| `env.ts` | **Server only.** Validates env vars with Zod |
| `errors.ts` | `AppError` with HTTP status codes |
| `utils.ts` | `cn()` for Tailwind classes |
| `chatThreads.ts` | Static demo titles in sidebar “Recents” |
| `types/chat.ts` | Request/response TypeScript types |
| `datasets/types.ts` | `DatasetId`, `DatasetConfig` types |
| `datasets/registry.ts` | Maps sidebar keys → Census 2011 resource UUIDs |
| `datasets/constants.ts` | Labels shown in UI (client-safe) |
| `data-gov-in/client.ts` | Fetches JSON from data.gov.in (with fallback URL) |
| `data-gov-in/types.ts` | Types for government API responses |
| `groq/client.ts` | Groq streaming chat + rate-limit retries |
| `groq/errors.ts` | Rate-limit messages and retry timing |
| `ai/prompts.ts` | Builds system prompt with dataset + JSON data |
| `ai/chat-service.ts` | Orchestrates: fetch data → prompt → Groq |

### 5.7 `scripts/`

| File | What it does |
|------|----------------|
| `find-census-resource.mjs` | Finds working resource UUIDs on data.gov.in for new datasets |

---

## 6. Datasets (2011 Census)

| Sidebar key | User-facing name | data.gov.in resource ID |
|-------------|------------------|-------------------------|
| `sales` (default) | Census 2011 — Primary Abstract (India) | `0764657f-00ec-4c6b-9ece-2d7b8a7401fa` |
| `crm` | Census 2011 — Population by Age & Sex | `3fac8061-9b36-418d-a5d5-7cedd300c942` |
| `ops` | Census 2011 — Literacy & Workers | `0764657f-00ec-4c6b-9ece-2d7b8a7401fa` |

Configured in `src/lib/datasets/registry.ts`. Override in `.env.local` with `DATA_GOV_RESOURCE_SALES`, etc.

---

## 7. Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATA_GOV_IN_API_KEY` | data.gov.in API key (required) |
| `DATA_GOV_IN_BASE_URL` | Primary API base URL |
| `DATA_GOV_IN_FALLBACK_URL` | Backup API if primary fails |
| `DATA_GOV_IN_FETCH_LIMIT` | Rows fetched per question (default 50) |
| `DATA_GOV_IN_TIMEOUT_MS` | Timeout for government API |
| `DATA_GOV_RESOURCE_SALES` / `_CRM` / `_OPS` | Optional UUID overrides |
| `GROQ_API_KEY` | Groq API key (required) |
| `GROQ_MODEL` | LLM model name |
| `GROQ_MAX_COMPLETION_TOKENS` | Max length of AI reply |
| `GROQ_TEMPERATURE` | Creativity (lower = more factual) |
| `GROQ_RATE_LIMIT_MAX_RETRIES` | Retries when Groq returns 429 |
| `CHAT_MAX_CONTEXT_CHARS` | Max JSON size in prompt |

---

## 8. Security

- Secrets only in `.env.local` on the server.
- Browser calls `/api/chat` only—never sees API keys.
- Do not commit `.env.local` or share keys in chat/email.

---

## 9. How to Run (for a demo)

```bash
cd datasense
npm install
cp .env.example .env.local    # or copy on Windows
# Edit .env.local with DATA_GOV_IN_API_KEY and GROQ_API_KEY
npm run dev
```

Open http://localhost:3000 → pick dataset from profile menu → ask a Census question.

---

## 10. Limitations (be honest with your senior)

- Chat history is **not saved** to a database (lost on refresh).
- Sidebar “Recents” is **demo data**, not real saved chats.
- Only a **subset of rows** is sent to the AI each time.
- Groq **rate limits** can occur on free tiers.
- Some menu items (Settings, Logout, Attach, Voice) are UI placeholders.

---

## 11. Possible next steps

- PostgreSQL / Supabase for chat history
- User authentication
- More datasets via registry + env
- Export answers to PDF/Excel
- Deploy on Vercel with environment secrets

---

*Generated for DataSense — Chat Layer for Government Data.*
