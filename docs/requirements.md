# Requirements — Soar AI

## 1. Background

Soar AI (起飞AI) is an AI transformation OS for professionals. The core insight: most people know AI tools exist but haven't integrated them into their actual workflow. Soar AI solves this through daily micro-tasks, accountability groups, and progress tracking — not tutorials or tool lists.

Target users: product managers, designers, analysts, consultants — knowledge workers who want to stay relevant as AI reshapes their roles.

## 2. Core Features

### 2.1 Daily Task System

- One task per day, completable in 5–10 minutes
- Tasks are role-specific (PM, designer, analyst, etc.)
- Each task includes: title, tags, estimated time, required tools, step-by-step instructions
- Mark complete → updates streak counter and total task count
- Monthly calendar view showing completed / today / future days

### 2.2 AI Readiness Score

- Baseline score from onboarding assessment
- Score updates as tasks are completed
- Ring chart visualization with score history
- Comparison against peers in same industry/role

### 2.3 Growth Profile

- 4-stage transformation timeline: Observer → Daily User → Collaborator → AI-Enhanced Expert
- Unlockable skill tags (e.g. "Prompt Design", "Meeting Notes", "Data Analysis")
- Joined days counter, streak records

### 2.4 Group System

- 5-person accountability groups
- Weekly leaderboard by streak length
- Activity feed: achievements, warnings for inactive members
- Weekly dot grid showing each member's 5-day completion

### 2.5 Quarterly Report

- Summary: tasks completed, score gain, percentile vs peers
- Shareable report (future: PDF export, shareable link)

### 2.6 AI Evolution Path (Knowledge Graph)

- Visual map of AI concepts from foundational to cutting-edge
- Node maturity labels: Foundational / Mainstream / Emerging / Speculative
- Lineage relationships (e.g. Prompt Engineering → Context Engineering → Harness Engineering)
- "2026 New" highlight with breathing animation for latest concepts
- Role-based filtering (developer / architect / PM)

### 2.7 OS Desktop UI

- Icon-based desktop with draggable windows
- Double-click icon to open window
- Multiple windows open simultaneously, stackable by z-index
- Window controls: close / minimize / maximize (double-click titlebar)
- Minimized windows in bottom taskbar
- Draggable icons

### 2.8 Settings & Personalization

- Language: English / 中文
- Theme: Light / Dark
- View mode: OS / Web
- Settings panel: Windows Start-menu style, bottom-left

### 2.9 Authentication

- Google OAuth via Supabase
- Session persisted server-side (Next.js middleware)
- Logged-in users get OS mode by default
- Guest users can browse desktop but can't access personal data

## 3. Non-Functional Requirements

| Requirement | Target |
|---|---|
| First load | < 2s on broadband |
| Auth redirect | < 3s round-trip |
| Animation | 60fps drag interactions |
| Accessibility | Keyboard navigable windows |
| Security | `.env.local` never committed; Supabase RLS for user data |
| Deployment | Single `docker-compose up` for full stack |

## 4. Out of Scope (v1)

- Mobile / responsive layout (desktop-first)
- Real-time group chat
- PDF report export
- AI-generated personalized tasks
- Payment / subscription
