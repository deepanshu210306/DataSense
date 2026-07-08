# DataSense

AI chat for **any** open dataset on [data.gov.in](https://data.gov.in). Sign up with email, verify your address, pick a dataset, ask in plain language, and revisit saved conversations.

## Stack

Next.js · TypeScript · MongoDB (Mongoose) · Groq · Auth.js · Resend · Tailwind

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in keys (see below)
npm run db:init
npm run dev
```

Open http://localhost:3000

## Required env vars

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection string |
| `GROQ_API_KEY` | Groq LLM |
| `DATA_GOV_IN_API_KEY` | data.gov.in API |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `http://localhost:3000` |
| `RESEND_API_KEY` | Verification emails |
| `EMAIL_FROM` | Verified sender in Resend |

See `.env.example` for optional tuning (Groq limits, fetch limits, etc.).

## Auth flow

1. **Sign up** → 6-digit code emailed via Resend  
2. **Verify** → enter code on the landing page  
3. **Sign in** → JWT session, `/chat` protected by middleware  

> `onboarding@resend.dev` only delivers to your Resend account email until you verify a domain.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run db:init` | Indexes + seed starter datasets |
| `npm run verify:datasets` | Smoke-test data.gov.in key |

## Security

Never commit `.env.local`. API keys and LLM calls stay server-side only.
