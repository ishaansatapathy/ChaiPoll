# ChaiPoll v2.0

Full-stack polling app with realtime updates (**Socket.io**), JWT + OAuth auth, and analytics UI (**React Flow**, **Recharts**). Styled as a dark “mission control” dashboard.

## Realtime

- Live poll updates pushed to everyone in a poll room.
- JWT sessions with HTTP-only cookies; optional Google OAuth.

## Data integrity

- **Vote + tallies**: On a **replica set** (e.g. MongoDB Atlas), vote insert and poll tally update run in a **single transaction**. On a standalone `mongod`, the code detects unsupported transactions and falls back to insert + one atomic `$inc` update, rolling back the vote document if the update fails.
- **Per-document tallies**: All question/option increments plus `totalParticipants` still use **one** `findOneAndUpdate` with `arrayFilters` so partial per-field corruption cannot happen mid-request.
- **Validation**: Express-validator on API payloads; responses are checked against real question/option ids (no duplicate questions, no mismatched options).
- **Duplicate votes**: Unique partial indexes on `(pollId, voterId)` and `(pollId, voterIp)` for anonymous flows.

## Security & ops

- Helmet, CORS, and rate limiting on `/api/*`.
- **CORS + Socket.io origins** come from `ALLOWED_ORIGINS` (comma-separated) or, if unset, `CLIENT_URL` plus `http://localhost:5173`. Set `ALLOWED_ORIGINS` in production for every frontend URL you use.

## Tech stack

- **Frontend**: React (Vite), Tailwind, Framer Motion, React Flow, Recharts, Socket.io client.
- **Backend**: Node.js, Express, Socket.io, MongoDB, Mongoose, Passport.

## Scripts

```bash
# Frontend (repo root)
npm run dev
npm run build

# API (server/)
cd server && npm run dev

# All tests (server unit + in-memory MongoDB integration + client smoke tests)
npm test

# Only server (includes MongoMemoryReplSet — first run downloads MongoDB binaries)
npm run test:server

# Only client (Vitest + Testing Library)
npm run test:client
```

CI (GitHub Actions) runs `server` and `client` jobs in parallel (see `.github/workflows/ci.yml`).

## Environment variables

```env
# Server — see server/.env.example
PORT=5000
MONGODB_URI=...
JWT_SECRET=...
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app

# Client
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Roadmap ideas

- Playwright/Cypress against a running stack.
- Broader React component coverage and MSW for API mocking.

---

Built for builders who like polls and sharp UIs.
