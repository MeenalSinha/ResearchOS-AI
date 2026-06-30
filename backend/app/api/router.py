from fastapi import APIRouter

from app.api.routes import auth, profile, pipeline, applications, professors, dashboard, websocket, documents, interviews, calendar, graph, messages

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(profile.router)
api_router.include_router(pipeline.router)
api_router.include_router(applications.router)
api_router.include_router(professors.router)
api_router.include_router(dashboard.router)
api_router.include_router(websocket.router)
api_router.include_router(documents.router)
api_router.include_router(interviews.router)
api_router.include_router(calendar.router)
api_router.include_router(graph.router)
api_router.include_router(messages.router)
