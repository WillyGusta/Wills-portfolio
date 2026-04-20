# Will's Portfolio (Next.js + AI Assistant)

This project is a complete starter portfolio website using **Next.js** with an API-integrated AI assistant.

## Features
- Responsive single-page portfolio (hero, skills, projects, contact)
- Server-side API route at `POST /api/chat`
- AI assistant grounded on local profile data (`data/profile.js`)
- Easy environment-based key setup with `.env.local`

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create env file:
   ```bash
   cp .env.example .env.local
   ```
3. Add your key to `.env.local`:
   ```env
   GEMINI_API_KEY=your_key_here
   GEMINI_MODEL=gemini-1.5-flash
   # Optional fallback
   OPENAI_API_KEY=your_openai_key_here
   OPENAI_MODEL=gpt-4o-mini
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## API integration flow
1. Frontend widget sends user question to `/api/chat`.
2. API route builds a grounded system prompt from `data/profile.js`.
3. API route calls Gemini API (or OpenAI fallback if Gemini key is not provided).
4. API route returns concise answer to the widget.

## Notes
- Replace placeholder profile/contact data in `data/profile.js` with your real details.
- If the assistant returns an API key error, verify `GEMINI_API_KEY` (or `OPENAI_API_KEY`) exists and restart the dev server.


## Troubleshooting
- **`npm run dev` says `Missing script: "dev"`**: make sure you run commands in the project root (the folder that contains `package.json` with `dev`, `build`, `start` scripts).
- **`/api/chat` returns an error**: confirm `.env.local` has a valid `GEMINI_API_KEY` (or `OPENAI_API_KEY`) and restart the Next.js server after editing env vars.
- **Assistant not answering**: check your terminal for API errors and verify your internet connection.

- **401 / invalid key errors**: ensure your key matches the provider (`GEMINI_API_KEY` for Gemini, `OPENAI_API_KEY` for OpenAI), remove extra quotes/spaces, and restart the server after updating `.env.local`.

- **Gemini key errors**: create a valid Gemini API key from Google AI Studio, place it in `GEMINI_API_KEY`, and restart the dev server.


## Deploy to Vercel
1. Push this repo to GitHub.
2. In Vercel, click **Add New Project** and import this repository.
3. Framework preset should be **Next.js** (already configured by `vercel.json`).
4. Add environment variables in Vercel Project Settings → Environment Variables:
   - `GEMINI_API_KEY` (recommended)
   - `GEMINI_MODEL` (optional, default `gemini-1.5-flash`)
   - `OPENAI_API_KEY` (optional fallback)
   - `OPENAI_MODEL` (optional, default `gpt-4o-mini`)
5. Deploy.

### Vercel deployment notes
- API route is configured for Node.js runtime and dynamic execution to avoid cache-related issues in serverless deployments.
- After changing environment variables, trigger a **Redeploy** so the new values are picked up.