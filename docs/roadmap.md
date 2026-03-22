# Roadmap — Soar AI

## Current State (v0.1 — March 2026)

### Done
- [x] Next.js 14 App Router frontend
- [x] Supabase Google OAuth login (Google provider)
- [x] OS-style desktop: draggable icons, stackable windows, maximize/minimize
- [x] Window titlebar: double-click to maximize, traffic-light controls
- [x] Bottom taskbar for minimized windows
- [x] Light / Dark theme (CSS custom properties, `data-theme` on `<html>`)
- [x] EN / ZH language switching (dropdown, click-outside to close)
- [x] OS ↔ Web mode toggle (via AppContext)
- [x] Settings panel: Windows Start-menu style, fixed bottom-left, click-outside to dismiss
- [x] `home.mdx` auto-opens on desktop load (product landing page)
- [x] "Get Started" / "立即开始" login button in top-right nav
- [x] "Soar AI" logo in Playfair Display italic (EN), Noto Serif SC (ZH)
- [x] AppShell web layout (sidebar + main content)
- [x] Mock data: profile, tasks, group, stats
- [x] Python FastAPI backend skeleton (mock data, port 8000)
- [x] Go Gin backend skeleton (knowledge graph, port 8080)
- [x] Docker Compose 4-service setup (db / api / pathway / frontend)
- [x] PostgreSQL schema with pgvector + seed data (8 AI evolution nodes)

### Known gaps
- [ ] `completeTask` still calls real backend — will 500 if Python not running
- [ ] All data is mock — no real DB reads/writes
- [ ] No user-specific data (everyone sees same mock profile)

---

## v0.2 — Real Data Layer (Q2 2026)

- [ ] Connect Python backend to Supabase PostgreSQL
- [ ] User-specific profile stored in DB (linked to Supabase auth UID)
- [ ] Tasks stored and served from DB
- [ ] Task completion persisted per user
- [ ] Group membership and leaderboard from DB
- [ ] Replace mock `completeTask` with real API call

---

## v0.3 — Knowledge Graph (Q2–Q3 2026)

- [ ] Go backend: seed initial AI pathway nodes (Prompt → Context → Harness Engineering)
- [ ] Frontend: interactive pathway visualization (SVG or canvas)
- [ ] Tech Radar view (circular, distance = maturity)
- [ ] Role-based node filtering
- [ ] Admin panel: add new nodes, define lineage relationships
- [ ] pgvector: embed node descriptions for semantic search

---

## v0.4 — Mobile & PWA (Q3 2026)

- [ ] Responsive layout for mobile (Web mode only on small screens)
- [ ] PWA manifest + service worker for offline task viewing
- [ ] Push notifications for daily task reminder

---

## v0.5 — AI Integration (Q3–Q4 2026)

- [ ] LLM-powered task feedback evaluation
- [ ] Personalized task generation based on user profile + history
- [ ] In-window AI assistant (floating chat within task window)
- [ ] Auto-generate quarterly report narrative with LLM

---

## v1.0 — Social & Enterprise (Q4 2026)

- [ ] Group chat within accountability groups
- [ ] Achievement badges with unlock animations
- [ ] Shareable quarterly report (public URL + PDF)
- [ ] Enterprise dashboard: team-level AI readiness view
- [ ] Subscription / payment integration

---

## Infrastructure Scaling Triggers

Add these when the 3-service setup (frontend + api + db) is no longer enough:

| When | Add |
|---|---|
| Task generation is async / slow | Celery worker + Redis queue |
| Static assets need CDN | Nginx reverse proxy, frontend as build artifact |
| Session/rate-limit caching | Redis cache layer |
| High-volume event tracking | Message queue (RabbitMQ / Kafka) |
| Vector search at scale | Dedicated pgvector replica or Qdrant |
