# ai-summarizer-app — Server proxy for CORS and API key security

This repo includes an optional Node/Express proxy (server.js) that forwards requests to:
- NCBI E-utilities (esearch, efetch, esummary)
- NCBI PMC efetch (for full text)
- NIH iCite API
- Google Gemini (Generative Language) — server keeps GEMINI_API_KEY secret.

Why
- Browsers are blocked by CORS when calling NCBI/NIH/Google directly.
- Public CORS proxies are unreliable or don't forward POST bodies/headers.
- Server-side proxy avoids browser CORS and secures API keys.

How to run locally
1. Add files to repository root (server.js, package.json).
2. Install dependencies:
   npm install
3. Set environment variables:
   - GEMINI_API_KEY (required if you use Gemini)
   - GEMINI_MODEL (optional; default: gemini-2.5-flash-preview-09-2025)
4. Run:
   npm start
5. Serve the client (index.html) from the same origin as the proxy (recommended) OR set SERVER_API_ROOT in index.html to point to the server host.

Deploying
- Vercel / Render / Heroku:
  - Deploy this Node app and set GEMINI_API_KEY in environment.
  - If serving client and server from same host, no additional config needed.
  - Alternatively, deploy server separately and update SERVER_API_ROOT in the client.

Notes & Security
- Keep GEMINI_API_KEY secret (server env var).
- Respect rate limits for NCBI and Google APIs.
- Consider server-side caching for heavy usage.
