# Design & Architecture — Soar AI

## 1. System Architecture

```
Browser
  │
  ├── Next.js 14 (port 3000)
  │     ├── Server Components  →  Supabase session check
  │     ├── Client Components  →  OS Desktop / AppShell
  │     └── API Rewrites
  │           ├── /api/pathway, /api/nodes, /api/lineages  →  Go :8080
  │           └── /api/*                                   →  Python :8000
  │
  ├── Python FastAPI (port 8000)   — main app data
  └── Go Gin (port 8080)           — knowledge graph + pgvector
        └── PostgreSQL (Supabase)
```

## 2. Frontend Architecture

### Mode System

The app has two rendering modes managed by `AppContext`:

| Mode | Component | Description |
|---|---|---|
| `os` | `Desktop.tsx` | OS-style desktop, draggable windows, icon grid |
| `web` | `AppShell.tsx` | Traditional sidebar + main content layout |

Mode state lives in `PageClient.tsx` via `AppProvider`. Switching is instant with no page reload.

### Global State (`lib/appContext.tsx`)

```ts
interface AppCtx {
  lang: 'zh' | 'en'      // default: 'en'
  theme: 'light' | 'dark' // default: 'light'
  mode: 'os' | 'web'      // default: 'os'
}
```

Theme is applied via `data-theme` attribute on `<html>`, driven by CSS custom properties.

### Desktop OS UI

- Icons on the left column, draggable via `@use-gesture/react` + `@react-spring/web`
- Double-click icon → opens a draggable, stackable window
- Window titlebar: drag to move, double-click to maximize/restore
- Traffic-light buttons: red = close, yellow = minimize, green = maximize
- Minimized windows appear in a bottom taskbar
- Settings panel: fixed bottom-left (Windows Start style), click outside to dismiss
- Language dropdown: top-right, click outside to dismiss

### Auth Flow

```
User clicks "Get Started"
  → Supabase signInWithOAuth({ provider: 'google' })
  → Google OAuth consent
  → Redirect to /auth/callback
  → Supabase exchanges code for session
  → Redirect to /
  → page.tsx reads session server-side
  → Renders Desktop with user prop
```

## 3. Directory Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout, font imports
│   ├── page.tsx                # Server component, session gate
│   ├── globals.css             # All styles (no CSS modules, no Tailwind)
│   └── auth/callback/route.ts  # OAuth callback handler
├── components/
│   ├── PageClient.tsx          # AppProvider wrapper + mode router
│   ├── Desktop.tsx             # Full OS desktop implementation
│   ├── AppShell.tsx            # Web mode layout
│   └── DraggableCard.tsx       # Standalone draggable card (utility)
└── lib/
    ├── appContext.tsx           # React context: lang/theme/mode
    └── supabase/
        ├── client.ts           # Browser Supabase client
        └── server.ts           # Server-side Supabase client (cookies)
```

## 4. Backend Architecture

### Python FastAPI (`backend/python/`)

Handles all main application data. Currently mock data, designed for easy swap to real DB.

```
main.py
├── GET  /api/profile        → Profile model
├── GET  /api/tasks          → Task[] model
├── POST /api/tasks/{id}/complete
├── GET  /api/group          → GroupMember[] model
└── GET  /api/stats          → date/weekday/day_num
```

### Go Gin (`backend/go/`)

Handles the AI knowledge graph with pgvector support for future semantic search.

```
cmd/server/main.go
internal/
├── handler/pathway.go    → HTTP handlers
├── model/node.go         → Node, Lineage structs
└── repository/node_repo.go → pgx database queries
```

### Database Schema (`migrations/001_init.sql`)

Key tables:
- `nodes` — AI knowledge nodes (id, name, description, maturity, status)
- `lineages` — directed edges between nodes (parent → child)
- pgvector extension enabled for future embedding search

## 5. Styling System

No CSS framework. All styles in `globals.css` using CSS custom properties.

### Design Tokens

```css
--ink: #1a1a2e          /* primary text */
--teal: #048a81         /* brand accent */
--surface: #fdf8f0      /* desktop background (cream) */
--card: #ffffff
--border: #e8e8f0
```

Dark mode overrides via `[data-theme="dark"]` selector.

### Typography

| Usage | Font |
|---|---|
| Logo (EN) | Playfair Display, italic 800 |
| Logo (ZH) / headings | Noto Serif SC 600 |
| Body | DM Sans 300–500 |

### Window Chrome

Neo-brutalism style: `2px solid #1a1a2e` border + `6px 6px 0 #1a1a2e` offset shadow.

## 6. Deployment

### Docker Compose Services

| Service | Image | Port |
|---|---|---|
| `db` | pgvector/pgvector:pg16 | 5432 |
| `api` | backend/python | 8000 |
| `pathway` | backend/go | 8080 |
| `frontend` | frontend (standalone) | 3000 |

### Environment Variables

Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Go backend (`DATABASE_URL` env or `.env`):
```env
DATABASE_URL=postgres://user:password@host:5432/soarai
ALLOWED_ORIGIN=http://localhost:3000
```

### Production Notes

- Frontend uses `output: 'standalone'` for minimal Docker image
- Auth uses Supabase cloud — no local DB needed for login/session
- Local PostgreSQL (in `docker-compose.yml`) is for the Go knowledge graph service only
- `backend/python` is currently mock data; swap `main.py` routes to real DB queries when ready
- Set `ALLOWED_ORIGIN` in Go backend to your production domain before deploying
