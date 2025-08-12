## React + Express + Supabase Template

A reusable full‑stack template with a React (Vite + TypeScript) frontend, an Express (TypeScript) backend, and Supabase for authentication. Designed for simple local development with a proxy from the frontend to the backend.

### Features
- **Monorepo layout**: `apps/web` (Vite React TS) and `apps/server` (Express TS)
- **Supabase wiring** on both client and server
- **Dev proxy**: frontend `\/api` → backend
- **Root scripts** to develop and build both apps

### Project Structure
```text
.
├─ apps/
│  ├─ web/                 # Vite React + TypeScript app
│  │  ├─ src/
│  │  │  ├─ lib/supabaseClient.ts
│  │  │  └─ App.tsx
│  │  └─ vite.config.ts    # Proxies /api → http://localhost:5174
│  └─ server/              # Express + TypeScript API
│     ├─ src/
│     │  ├─ index.ts       # Express app, routes, CORS, JSON
│     │  └─ supabase.ts    # Server Supabase client
│     └─ tsconfig.json
└─ package.json            # Root scripts (dev/build/start)
```

### Prerequisites
- **Node**: >= 20.19 or >= 22.12 (tested with Node `v22.18.0`)
- **npm**: compatible with your Node version

### Environment Variables
Create these files before running locally.

- `apps/web/.env`
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

- `apps/server/.env`
```env
PORT=5174
CORS_ORIGIN=http://localhost:5173
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

### Scripts (run from repo root)
- **Install** (once):
```bash
npm i
```

- **Develop** (runs web and server concurrently):
```bash
npm run dev
```
  - Web: `http://localhost:5173`
  - API Health: `http://localhost:5174/api/health`

- **Build** (server then web):
```bash
npm run build
```

- **Start built API**:
```bash
npm run start
```

### Backend API
- `GET /api/health`: Returns a basic health payload.
- `GET /api/profile`: Protected route. Expects `Authorization: Bearer <supabase_access_token>`; verifies via `supabase.auth.getUser(token)`.

### Auth Testing Flow
1. In the web app, enter an email/password for an existing Supabase user and click "Sign In".
2. Click "Call /api/profile". The frontend sends the Supabase access token as a Bearer token to the backend.
3. The backend verifies the token and returns the user id/email or `401`.

### Configuration Notes
- **CORS**: Configure via `CORS_ORIGIN` in `apps/server/.env`.
- **Ports**: Default server port is `5174`; Vite dev server is `5173`.
- **Proxy**: `apps/web/vite.config.ts` proxies `\/api` to `http://localhost:5174` during development.

### What’s Included
- **Root scripts** in `package.json`:
  - `dev`: concurrently runs `web` and `server`
  - `dev:web`: `npm --prefix apps/web run dev`
  - `dev:server`: `npm --prefix apps/server run dev`
  - `build`: builds server then web
  - `start`: runs built server

- **Dependencies**
  - Web: Vite React TS stack + `@supabase/supabase-js`
  - Server: `express`, `cors`, `dotenv`, `@supabase/supabase-js`, `typescript`, `ts-node-dev`, `@types/node`, `@types/express`, `@types/cors`

### Troubleshooting
- Ensure your Node version meets the requirement (Vite requires >= 20.19 or >= 22.12).
- If the server crashes on startup, verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set.
- TypeScript error for CORS types? `@types/cors` is already included; reinstall if needed: `npm i`.

### Reusing This Template
- Copy the repo and update both `.env` files with your Supabase keys.
- Adjust `CORS_ORIGIN`, ports, and proxy target if needed.
- Optionally rename packages in `apps/*/package.json`.

### Verification Performed
- API `GET /api/health` returned `{ ok: true, service: 'server', env: 'development' }`.
- Vite responded with HTTP 200 on `http://localhost:5173`.
- Full build succeeded (server TypeScript build and web Vite build).


