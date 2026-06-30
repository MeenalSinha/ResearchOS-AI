# ResearchOS AI — Architecture Notes

## Data Flow (Full Pipeline Run)

1. Student signs in (JWT issued by `app/api/routes/auth.py`).
2. Student uploads resume/transcript -> `app/api/routes/profile.py` ->
   `services/document_parser.py` extracts text -> `agents/profile_intelligence_agent.py`
   builds the structured `AcademicProfile` row and a Lemma Datastore record.
3. Student selects a research field -> `agents/professor_discovery_agent.py`
   calls `services/web_search_provider.py` and returns candidate professors,
   persisted as `Professor` rows.
4. Student selects a professor -> `agents/paper_intelligence_agent.py` reads
   recent publications, producing a focus summary stored as `Paper` rows with
   vector embeddings in Qdrant for future semantic search.
5. `agents/compatibility_scoring_agent.py` compares the student profile against
   the professor focus -> `CompatibilityScore` row with match %, strengths,
   weaknesses, missing skills, and a plain-language recommendation.
6. In parallel, `agents/resume_optimizer_agent.py`, `agents/sop_generator_agent.py`,
   and `agents/cold_email_agent.py` produce tailored application materials.
7. `agents/application_tracking_agent.py` creates/updates the `Application` row
   and moves it through the Kanban pipeline (`ApplicationStatus` enum).
8. `agents/follow_up_agent.py` schedules reminders based on submission date.
9. `agents/interview_coach_agent.py` generates prep material once status reaches
   `interview`.
10. `agents/opportunity_watch_agent.py` runs on a Celery beat schedule (see
    `workers/celery_app.py`) to surface new openings independent of any single
    application.
11. `agents/career_strategy_agent.py` looks across all `CompatibilityScore` and
    `Application` rows to recommend prioritization — this is the "brain" exposed
    via `POST /api/v1/pipeline/strategy`.

Every agent step publishes an event through `services/event_bus.py`. The
`/ws/agents/{user_id}` WebSocket endpoint streams these events so the frontend's
Multi-Agent Live Workflow graph and Activity Feed update in real time without
polling.

## Why Lemma SDK matters here

- **Lemma Datastore** stores every agent's structured output (compatibility
  scores, SOP drafts, email drafts) as versioned records, independent of the
  relational database. This makes every AI decision explainable and replayable
  for judges or auditors — you can always answer "why did the agent recommend
  this professor first."
- **Lemma Document Store** holds the source-of-truth files (uploaded resumes,
  transcripts, generated tailored resumes/SOPs as PDFs) with signed retrieval
  URLs, decoupling file storage from the application database.

`app/services/lemma_client.py` wraps both with a local-fallback mode so the
app runs fully offline during development without a Lemma API key.

## Explainability principle

Every agent that produces a recommendation (compatibility score, career
strategy, follow-up timing) returns a `recommendation` / `reason` field in its
JSON output. The frontend always surfaces this text next to the AI-generated
artifact so the student sees *why*, not just *what*.
