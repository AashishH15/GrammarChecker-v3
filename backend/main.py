from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from fastapi.responses import JSONResponse

from inference import get_backend
from languagetool import check_text, warm_up
from model_manager import download_model, model_state


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-launch the LanguageTool JVM on boot so the first user request
    # doesn't pay the multi-second cold-start cost. A failure here (e.g. the
    # JVM isn't installed) shouldn't crash the server; the first real request
    # will attempt to warm up again.
    warm_up()
    # Probe for a local inference backend: prefer a detected Ollama
    # server, else fall back to the bundled backend. Swallowed so a missing
    # backend never blocks startup; it re-resolves lazily on first use.
    try:
        get_backend()
    except Exception:
        pass
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class GrammarRequest(BaseModel):
    text: str
    language: str = "en-US"
    ignore: list[str] = []


class ModelDownloadRequest(BaseModel):
    model_key: str = "2b"


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/grammar/check")
def grammar_check(request: GrammarRequest):
    matches = check_text(request.text, request.language, request.ignore)
    return {"matches": matches}


@app.get("/model/status")
def model_status():
    """Current bundled-model download/ready state."""
    return model_state()


@app.post("/model/download")
def model_download(request: ModelDownloadRequest):
    """Trigger a bundled-model download. Runs synchronously; the frontend will
    poll /model/status for progress and the backend will load the file once 'ready'."""
    try:
        status = download_model(request.model_key)
    except ValueError as exc:
        return JSONResponse(status_code=400, content={"error": str(exc)})
    except RuntimeError as exc:
        return JSONResponse(status_code=500, content={"error": str(exc)})
    return status
