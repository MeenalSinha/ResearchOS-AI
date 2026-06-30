"""
ResearchOS AI - FastAPI application entrypoint.
"""
import logging
import time
from collections import defaultdict

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.api.router import api_router

settings = get_settings()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("researchos")

app = FastAPI(title=settings.APP_NAME, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Rate limiting -----------------------------------------------------
# Simple in-memory sliding-window limiter keyed by client IP, applied only
# to the LLM-calling routes (everything under /pipeline and /profile/upload)
# since those are the routes that incur real OpenAI cost and are the most
# obvious abuse target. Production multi-instance deployments should back
# this with Redis instead of an in-process dict.
RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_REQUESTS = 10
_request_log: dict[str, list[float]] = defaultdict(list)
RATE_LIMITED_PREFIXES = (f"{settings.API_V1_PREFIX}/pipeline", f"{settings.API_V1_PREFIX}/profile")


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if request.url.path.startswith(RATE_LIMITED_PREFIXES):
        client_key = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - RATE_LIMIT_WINDOW_SECONDS
        recent = [t for t in _request_log[client_key] if t > window_start]
        if len(recent) >= RATE_LIMIT_MAX_REQUESTS:
            return JSONResponse(
                status_code=429,
                content={"error": "rate_limited", "message": "Too many AI-calling requests. Please wait a minute and try again."},
            )
        recent.append(now)
        _request_log[client_key] = recent
    return await call_next(request)


# --- Global exception handling -----------------------------------------
# No route should ever leak a raw Python traceback to a client. Anything
# not already turned into an HTTPException by route code lands here and
# is logged server-side with full detail, while the client gets a clean,
# generic error body.
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={"error": "internal_server_error", "message": "Something went wrong. Our team has been notified."},
    )


app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": settings.APP_NAME}
