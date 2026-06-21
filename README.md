# DataSense

Chat interface for Indian **Census 2011** open data on [data.gov.in](https://data.gov.in). Sign in with Google, ask in plain language, and revisit saved conversations stored in **MongoDB**.

## Architecture

```
/                     Landing page + Google sign-in (NextAuth)
/chat                 New conversation (auth required)
/chat/[id]            Saved conversation with history

POST /api/chat        Stream answer + persist messages to MongoDB
GET  /api/conversations        List user's recent chats
GET  /api/conversations/[id]   Load messages for a thread
```

| Layer | Technology |
|-------|------------|
| Auth | NextAuth v5 + Google OAuth + `@auth/mongodb-adapter` |
| Database | MongoDB Atlas (`DATABASE_URL` + `MONGODB_DB_NAME`) |
| LLM | Groq (`GROQ_API_KEY`) |
| Data | data.gov.in (`DATA_GOV_IN_API_KEY`) — one key, all datasets |

## Setup

1. **Install**

   ```bash
   npm install
   ```

2. **Configure `.env.local`** (copy from `.env.example`)

   | Variable | Purpose |
   |----------|---------|
   | `DATA_GOV_IN_API_KEY` | data.gov.in API key |
   | `GROQ_API_KEY` | Groq API key |
   | `AUTH_SECRET` | `openssl rand -base64 32` |
   | `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth |
   | `AUTH_URL` | `http://localhost:3000` |
   | `DATABASE_URL` | MongoDB connection string |
   | `MONGODB_DB_NAME` | Database name (default: `datasense`) |

   Google OAuth redirect URI: `http://localhost:3000/api/auth/callback/google`

3. **Initialize MongoDB indexes**

   ```bash
   npm run db:init
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   - Home: http://localhost:3000  
   - Chat (after sign-in): http://localhost:3000/chat  

## Features

- **No manual dataset pick required** — auto-detects the best Census table from your question (override in profile menu).
- **Saved chats** — sidebar “Recent chats” updates as you talk.
- **Live profile** — name, email, and Google photo from your session.
- **One data.gov.in key** — shared across all Census datasets.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:init` | Create MongoDB indexes |
| `npm run verify:datasets` | Test data.gov.in key against all datasets |

## Security

- Never commit `.env.local`.
- Rotate any key that was shared publicly.
- API keys stay server-side only — never sent to the browser.
