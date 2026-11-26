# PlantLens Backend — Railway Deployment

The backend lives in `my-app/backend/`. It has zero npm dependencies — only Node built-ins.

## Repository layout

```
my-app/
├── backend/          ← deploy this folder to Railway
│   ├── server.js
│   ├── package.json
│   ├── .gitignore
│   └── .env          (local only — gitignored, never committed)
└── src/              ← Expo mobile app (separate)
```

## Railway setup

1. **Root Directory** — set to `backend` in Railway's project settings.
2. **Start command** — `npm start` (runs `node server.js`).
   - Or use the explicit command: `node server.js`
3. **Environment variables** — add in the Railway dashboard:

| Variable | Required | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key — never commit this |
| `PORT` | Auto | Injected by Railway automatically — do not set manually |

## Health check

Railway can ping `GET /health` → returns `{"status":"ok"}` with HTTP 200.

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Uptime check |
| `POST` | `/identify` | Plant identification |
| `POST` | `/guide` | Topic care guide |
| `POST` | `/diagnose` | Plant health diagnosis |

## Local development

```bash
# Backend (from my-app/backend/)
cd backend
node server.js        # listens on port 3000

# Expo app (from my-app/)
npx expo start
```
