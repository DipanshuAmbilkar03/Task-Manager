# Daily Task Manager

A full-stack web application to manage daily tasks — add, view, edit, delete, track status (Pending / In Progress / Completed), and search or filter by status and priority. Single Next.js deployment serves both the frontend and the REST API, with MongoDB as the database.

## Tech stack

| Layer    | Choice |
|----------|--------|
| App      | Next.js (App Router) + TypeScript + React + Tailwind CSS |
| Backend  | Next.js Route Handlers (`app/api/tasks`) |
| Database | MongoDB Atlas via Mongoose (falls back to a temporary in-memory store when `MONGODB_URI` is not set) |
| Validation | Zod (shared client + server rules) |
| Animations | Framer Motion + Lucide icons |
| Deploy   | Vercel (one deploy covers frontend + backend) |

## Project structure

```
task_manager_/
  app/
    page.tsx                  # thin composer (~90 lines): Sidebar + Topbar + sections
    layout.tsx
    globals.css
    api/tasks/route.ts        # GET (list + search/filter) • POST (create)
    api/tasks/[id]/route.ts   # GET one • PUT update • DELETE
  components/
    task-types.ts             # Task / filter / form types, status meta, shared classes
    task-utils.ts             # validateForm, readError, timeAgo
    Sidebar.tsx               # desktop icon rail + mobile drawer
    Topbar.tsx                # sticky navbar with view title + New task
    Alerts.tsx                # error + success banners
    SearchBar.tsx             # search + collapsible status/priority filters
    TaskForm.tsx              # collapsible create/edit panel
    TaskCard.tsx              # one task row + expandable detail
    TaskList.tsx              # loading / empty / list states
    DeleteDialog.tsx          # delete confirmation modal
  hooks/
    useTasks.ts               # all task state, fetching, CRUD handlers
  lib/
    validation.ts             # Zod schemas (title 3–100, enums, query params)
    db.ts                     # cached Mongoose connection (+ SRV pre-resolve)
    store.ts                  # MongoDB ↔ in-memory fallback data layer
    api.ts                    # JSON response helpers
  models/Task.ts              # Mongoose schema (title, description, status, priority, timestamps)
  .env.example                # env template (no secrets committed)
```

## REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/tasks` | Create task `{ title*, description?, status?, priority? }` → 201 |
| GET    | `/api/tasks?search=&status=&priority=` | List + search/filter |
| GET    | `/api/tasks/:id` | Get single task |
| PUT    | `/api/tasks/:id` | Update (partial allowed: title/description/status/priority) |
| DELETE | `/api/tasks/:id` | Delete task |

Responses: `{ success: true, data }` / `{ success: false, message, errors? }` with 400 (validation/invalid id), 404 (not found), 500 (server error).

## Task fields

Task ID • Title • Description • Status (Pending / In Progress / Completed) • Priority (Low / Medium / High) • Created Date • Updated Date

## Run locally

```bash
npm install
cp .env.example .env.local   # then put your real Atlas URI in .env.local
npm run dev                  # http://localhost:3000
```

Without `MONGODB_URI` the app runs on a temporary in-memory store — fine for local demo, data resets on restart.

## Deploy (Vercel + Atlas, both free)

1. **Database:** create a free M0 cluster at https://cloud.mongodb.com → Database Access (user + password) → Network Access (allow `0.0.0.0/0` for Vercel) → Connect → copy the connection string.
2. **Vercel:** https://vercel.com/new → import this repo → add env var `MONGODB_URI=<your Atlas string>` → Deploy.
3. Verify: open the live URL, add/edit/complete/delete a task.

## Validation & error handling

- Client: required title, length limits, user-friendly inline errors.
- Server: Zod schemas + Mongoose validators; 400/404/500 JSON errors; invalid-id and invalid-JSON handling.
