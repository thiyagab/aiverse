<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1V0rn7pwslaxnFRTYfBazPPHU4RVq-Jr8

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set your API keys in `.env` (see [.env.example](.env.example)). Use the **server** for AI (keys never go to the frontend):
   - `npm run server` — starts the AI API on port 3001
   - `npm run dev` — starts the Vite app on port 3000 (proxies `/api` to the server)
3. Run the app:
   `npm run dev` (in another terminal: `npm run server`)

## Deploy on Vercel

On Vercel, the **middleware** is implemented as **serverless functions**, not a long-lived Express server:

- Each file under **`api/`** becomes a separate serverless endpoint:
  - `api/plot-details.ts` → `POST /api/plot-details`
  - `api/refine-plot.ts` → `POST /api/refine-plot`
  - `api/characters.ts` → `POST /api/characters`
  - `api/next-episode.ts` → `POST /api/next-episode`
- The frontend (Vite build in `dist/`) is served as static files. The **`vercel.json`** rewrites all non-`/api` routes to `index.html` for client-side routing.
- **Environment variables** (e.g. `OPENROUTER_API_KEY`, `AI_PROVIDER`) must be set in the Vercel project: **Settings → Environment Variables**. They are only available in the serverless functions, so API keys never reach the browser.
- Deploy with the Vercel CLI (`vercel`) or by connecting your repo in the Vercel dashboard. No need to run the Express `server/` on Vercel; the `api/` routes replace it.
