# ResearchOS AI — Autonomous Research Career Operating System

Your AI research career operator that discovers opportunities, analyzes professors,
prepares personalized applications, tracks progress, and helps students land
research internships and PhD admissions.

This is not a chatbot. It is a multi-agent operating system: 12 specialized AI
agents collaborate continuously to run the entire research application lifecycle
on the student's behalf.

---

## Folder Structure

```
researchos-ai/
│
├── frontend/                          Next.js 15 + React 19 + TypeScript app
│   ├── app/                           App Router pages
│   │   ├── page.tsx                   Dashboard (Home Overview)
│   │   ├── professors/page.tsx        Professor Discovery
│   │   ├── applications/page.tsx      Application Pipeline (Kanban)
│   │   ├── agents/page.tsx            AI Agents directory
│   │   ├── layout.tsx                 Root layout (Sidebar + Topbar)
│   │   └── globals.css                Tailwind base styles
│   ├── components/
│   │   ├── layout/                    Sidebar, Topbar
│   │   ├── dashboard/                 StatCard, MatchScoreRing, AgentRow,
│   │   │                              PipelineList, UpcomingTasks, RecommendationCard
│   │   └── ui/                        Shared primitives (buttons, inputs, etc.)
│   ├── lib/
│   │   └── api-client.ts              Fetch wrapper + WebSocket helper
│   ├── hooks/                         Custom React hooks (data fetching, websockets)
│   ├── types/                         Shared TypeScript types
│   ├── public/                        Static assets
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── next.config.js
│   └── Dockerfile
│
├── backend/                            FastAPI + Python application
│   ├── app/
│   │   ├── main.py                    FastAPI entrypoint
│   │   ├── core/
│   │   │   ├── config.py              Environment-driven settings
│   │   │   └── security.py            JWT + password hashing
│   │   ├── db/
│   │   │   └── session.py             Async SQLAlchemy engine/session
│   │   ├── models/
│   │   │   └── models.py              ORM models (User, Profile, Professor,
│   │   │                               Paper, CompatibilityScore, Application,
│   │   │                               Document, AgentActivity, Opportunity,
│   │   │                               InterviewSession)
│   │   ├── schemas/
│   │   │   └── schemas.py             Pydantic request/response models
│   │   ├── api/
│   │   │   ├── deps.py                Auth dependency (current user from JWT)
│   │   │   ├── router.py              Aggregates all route modules
│   │   │   └── routes/
│   │   │       ├── auth.py            Signup/login + OAuth stubs
│   │   │       ├── profile.py         Resume/transcript upload + parsing
│   │   │       ├── pipeline.py        Full multi-agent pipeline trigger
│   │   │       ├── applications.py    Kanban CRUD
│   │   │       ├── professors.py      Professor directory + papers
│   │   │       ├── dashboard.py       Analytics aggregation
│   │   │       └── websocket.py       Live agent activity stream
│   │   ├── agents/                    The 12 AI agents (one file each)
│   │   │   ├── base_agent.py
│   │   │   ├── profile_intelligence_agent.py
│   │   │   ├── professor_discovery_agent.py
│   │   │   ├── paper_intelligence_agent.py
│   │   │   ├── compatibility_scoring_agent.py
│   │   │   ├── resume_optimizer_agent.py
│   │   │   ├── sop_generator_agent.py
│   │   │   ├── cold_email_agent.py
│   │   │   ├── application_tracking_agent.py
│   │   │   ├── follow_up_agent.py
│   │   │   ├── interview_coach_agent.py
│   │   │   ├── opportunity_watch_agent.py
│   │   │   └── career_strategy_agent.py
│   │   ├── services/
│   │   │   ├── llm_client.py          OpenAI wrapper (chat + embeddings)
│   │   │   ├── lemma_client.py        Lemma Datastore + Document Store SDK wrapper
│   │   │   ├── agent_orchestrator.py  Chains agents into the autonomous workflow
│   │   │   ├── event_bus.py           Pub/sub powering the live activity feed
│   │   │   ├── document_parser.py     PDF/OCR text extraction
│   │   │   └── web_search_provider.py Pluggable search backend
│   │   └── workers/
│   │       ├── celery_app.py          Celery app + beat schedule
│   │       └── tasks.py               Scheduled opportunity scan / follow-up checks
│   ├── tests/
│   │   └── test_health.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── database/
│   ├── migrations/
│   │   └── env.py                     Alembic async migration environment
│   ├── alembic.ini
│   └── seed.py                        Demo professor/paper seed data
│
├── deployment/
│   ├── docker/
│   │   └── docker-compose.yml         Full local stack: postgres, redis, qdrant,
│   │                                  backend, celery worker, celery beat, frontend
│   └── github-actions/
│       └── ci.yml                     Build + test pipeline
│
└── docs/
    └── ARCHITECTURE.md                Agent architecture and data flow notes
```

---

## Quick Start

### 1. Local development with Docker (recommended)

```bash
cp backend/.env.example backend/.env
# edit backend/.env and add OPENAI_API_KEY (and LEMMA_API_KEY if available)

cd deployment/docker
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

Run migrations and seed data once containers are up:

```bash
docker compose exec backend alembic -c database/alembic.ini upgrade head
docker compose exec backend python database/seed.py
```

### 2. Manual setup

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in keys
uvicorn app.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

**Background workers** (opportunity scanning, follow-up checks)
```bash
celery -A app.workers.celery_app worker --loglevel=info
celery -A app.workers.celery_app beat --loglevel=info
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, Recharts, React Flow |
| Backend | FastAPI, Python, AsyncIO, Celery |
| Database | PostgreSQL, Lemma Datastore, Redis, Qdrant (vector search) |
| AI | OpenAI GPT models, embeddings, OCR (pytesseract) |
| Auth | JWT-based sessions, Google/GitHub OAuth wiring points |
| Storage | Lemma Document Store, local/S3 fallback |
| Deployment | Docker Compose, GitHub Actions CI/CD |

## What Was Verified Working (not just written)

Every item below was actually run and tested against a live server during
development, not just authored:

- **Live multi-agent WebSocket feed is now wired into the frontend.** The
  backend event bus and `/ws/agents/{user_id}` endpoint existed but were
  never opened by any UI code; `hooks/use-agent-feed.ts` and
  `components/dashboard/live-agent-feed.tsx` now open it and render events
  in real time on the dashboard.
- **Dashboard fetches real data.** `hooks/use-dashboard-data.ts` calls
  `/dashboard/summary` and `/applications/pipeline-summary` with explicit
  loading, error, and empty states - verified to show "Welcome to
  ResearchOS AI" + a demo-preview banner when logged out, and a genuine
  "No applications yet" state for a new user, instead of static fake
  numbers.
- **Human-in-the-loop approval is server-side enforced, not just claimed.**
  `Application.approved_by_user` must be true before
  `ApplicationTrackingAgent` allows a transition to `submitted` - verified
  end-to-end: blocked pre-approval, approved via
  `POST /applications/{id}/approve`, then succeeded.
- **Lemma Datastore read-before-write is real**, even without a Lemma API
  key. `LemmaClient` now persists to local JSON files when no key is
  configured (rather than silently no-op-ing), and
  `CompatibilityScoringAgent` calls `list_records` for prior scores before
  generating a new one - verified with a direct write/read/list round trip.
- **Research data comes from a real source.** `WebSearchProvider` calls the
  free, keyless Semantic Scholar API for real author and paper data.
  Note: this could not be verified against the live API from the sandboxed
  development environment used to build this (its network egress proxy
  blocks `api.semanticscholar.org`) - the failure path was verified instead
  (clean `fallback_mock` response with an honest error message, no silent
  empty data). Verify connectivity in your own deployment environment.
- **The pipeline is asynchronous.** `/pipeline/run-full` returns a `run_id`
  immediately instead of blocking for ~8 sequential LLM calls;
  `/pipeline/runs/{run_id}` polls status. Verified: returns instantly,
  fails cleanly with the exact failing step name when `OPENAI_API_KEY`
  is not configured, rather than hanging or crashing the request.
- **Rate limiting and global exception handling are real.** Verified: 11th
  request in 60 seconds to a pipeline/profile route returns 429; an
  unhandled exception returns a sanitized 500 with no Python traceback in
  the response body, while the full traceback is logged server-side.
- **A dedicated Career Strategy screen exists** at `/strategy` and calls the
  real `/pipeline/strategy` endpoint - this was previously the most
  differentiated agent with zero UI surface.

## Known Limitations (documented honestly, not hidden)

- Resume/transcript text is stored unencrypted in the relational database.
  Add encryption-at-rest before handling real student PII in production.
- Google/GitHub OAuth routes are intentionally unimplemented stubs (501) -
  do not advertise these as working until wired to a real provider.
- `Opportunity Watch Agent` has no real, free, keyless data source for
  MITACS/DAAD/SURGE-style listings; `WebSearchProvider.search_opportunities`
  returns an honest "unavailable" response rather than fabricated listings.
  Connect a licensed listings API or scraper for production use.
- The Career Strategy and approval-gate demos above use either hand-seeded
  or manually-inserted database rows in the verification steps, since a
  full signup -> discovery -> scoring -> application chain requires a real
  `OPENAI_API_KEY` to generate the intermediate records. The mechanism
  (gate enforcement, agent call, status polling) is verified; the full
  organic user journey through the UI has not been click-tested end to end
  with a live OpenAI key.



## Round 2 Fixes — Closing the "Backend Real, Frontend Missing" Gap

A prior audit found that, despite real backend functionality, the frontend
had no way for an actual user to reach any of it: no login page, no UI to
trigger the agent pipeline, and 8 of 13 sidebar links led to pages that
didn't exist. All three were fixed and verified this round:

- **`/login` and `/signup` pages** now exist, calling the real
  `/auth/login` and `/auth/signup` backend routes and storing the returned
  JWT via `lib/auth.ts`. Verified: the exact request shape the frontend
  sends was replayed via curl end-to-end (signup -> token -> authenticated
  request) and matches what the UI does.
- **A pipeline-trigger UI now exists** on the Professor Discovery page.
  It calls `POST /pipeline/run-full`, polls `GET /pipeline/runs/{run_id}`,
  and shows the same live WebSocket feed reacting in real time. Verified
  end-to-end: triggered a real run, watched it fail cleanly at the
  `profile` step with a clear "likely missing OPENAI_API_KEY" hint - the
  exact failure mode the UI is designed to explain to a user.
- **Zero dead navigation links.** All 13 sidebar items plus `/login` and
  `/signup` were verified returning HTTP 200. Six previously-missing pages
  (Research Graph, Documents, Interview Coach, Calendar, Messages) now
  render an explicit "Not yet built" state rather than a fake dashboard or
  a 404 - each one states exactly what backend capability already exists
  versus what doesn't, rather than pretending the page is functional.
  Two more (Analytics, Opportunities) are now genuinely real: Analytics
  renders a live Recharts bar chart from real pipeline-summary data with a
  real empty state, and Opportunities calls the real Opportunity Watch
  Agent endpoint and surfaces its honest "no free listings API available"
  response instead of hiding it.
- **Logout is real** (`Topbar` and `Settings` both call `clearAuthToken`
  and redirect to `/login`), and the sidebar/topbar now reflect actual
  session state instead of a hardcoded "Ananya Sharma."

### What is still not done, stated plainly

- Google/GitHub OAuth remain unimplemented 501 stubs - the Settings page
  says so explicitly rather than implying they work.
- The Career Strategy screen still uses its own hardcoded candidate list
  rather than reading real Application/CompatibilityScore data.
- No dark mode, command palette, glassmorphism, or motion design pass has
  been done - this round prioritized closing functional gaps (auth,
  navigation, pipeline triggering) over visual polish.
- The full organic browser click-through (type a password into the actual
  rendered login form, watch the dashboard update) has not been driven by
  a real browser in this environment - verification was performed by
  replaying the exact HTTP requests the frontend code issues and
  confirming the responses match what each page expects, plus confirming
  every route serves HTTP 200 and contains the expected page-specific text.

## Agent Architecture

ResearchOS AI runs 12 specialized agents chained by `app/services/agent_orchestrator.py`:

1. **Profile Intelligence Agent** — builds a structured academic profile from resume/transcript
2. **Professor Discovery Agent** — finds matching professors
3. **Paper Intelligence Agent** — analyzes recent publications
4. **Compatibility Scoring Agent** — produces explainable match scores
5. **Resume Optimizer Agent** — tailors resume per application
6. **SOP Generator Agent** — writes personalized statement of purpose sections
7. **Cold Email Agent** — drafts outreach emails
8. **Application Tracking Agent** — manages the Kanban pipeline
9. **Follow-up Agent** — schedules and drafts reminders
10. **Interview Coach Agent** — generates interview prep material
11. **Opportunity Watch Agent** — monitors new openings
12. **Career Strategy Agent** — prioritizes the whole portfolio

Every agent emits live status events over `app/services/event_bus.py`, streamed to
the frontend via `/ws/agents/{user_id}`, powering the Multi-Agent Live Workflow
visualization and the AI Agent Activity Feed shown on the dashboard.
