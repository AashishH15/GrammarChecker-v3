"""Local inference abstraction layer.

A single interface the rest of the app calls, with two implementations behind
it:

- OllamaBackend: talks to a user's already-running Ollama server,
  auto-detected on startup and preferred when present.
- BundledBackend: a stub around llama.cpp (llama-cpp-python) that will
  serve one packaged quantized model when no Ollama server is found. The model
  download/load pipeline lands later, so for now it reports itself
  unavailable and raises a clear error if called.

Mirrors the "optional remote, local by default" shape of the LanguageTool
client (languagetool.py): env-overridable server URL, lazy resolution, and a
failure that never crashes the app.

No HTTP endpoint is exposed here; that arrives with /transform at C20.
"""

import os

import requests

OLLAMA_SERVER = os.environ.get("OLLAMA_SERVER", "http://localhost:11434")
# Optional hard override of auto-detection: "ollama" or "bundled".
FORCE_BACKEND = os.environ.get("LEXICON_INFERENCE", "").strip().lower()

# Probe timeout: a warm local Ollama answers near-instantly, but a cold server
# can take a beat on its first request, so 1s risks misclassifying a real
# Ollama as absent. 2.5s tolerates a cold first hit without meaningfully
# stalling startup (and startup swallows failures and re-probes lazily anyway).
PROBE_TIMEOUT = 2.5
GENERATE_TIMEOUT = 120


class InferenceUnavailable(RuntimeError):
    """Raised when an inference backend is asked to run but can't."""


class InferenceBackend:
    """The single interface the rest of the app calls."""

    name = "base"

    def available(self) -> bool:
        raise NotImplementedError

    def complete(self, prompt: str, **opts) -> str:
        """Run a completion and return the generated text."""
        raise NotImplementedError


class OllamaBackend(InferenceBackend):
    """Uses a user's existing Ollama server."""

    name = "ollama"

    def __init__(self, base_url: str = OLLAMA_SERVER, model: str = "llama3.2"):
        self.base_url = base_url.rstrip("/")
        self.model = model

    def available(self) -> bool:
        """Probe the server. True only if it responds to the tags endpoint."""
        try:
            response = requests.get(
                f"{self.base_url}/api/tags", timeout=PROBE_TIMEOUT
            )
            return response.ok
        except requests.RequestException:
            return False

    def complete(self, prompt: str, **opts) -> str:
        model = opts.pop("model", self.model)
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    **opts,
                },
                timeout=GENERATE_TIMEOUT,
            )
            response.raise_for_status()
        except requests.RequestException as exc:
            raise InferenceUnavailable(
                f"Ollama request to {self.base_url} failed: {exc}"
            ) from exc
        return response.json().get("response", "")


class BundledBackend(InferenceBackend):
    """Bundled llama.cpp model.

    llama-cpp-python is a heavy native build and there's no packaged model yet,
    so it is intentionally NOT in requirements.txt. It is imported lazily and
    guarded here; until the model download/load pipeline lands this
    backend reports itself unavailable and calling it raises a clear error.
    """

    name = "bundled"

    def available(self) -> bool:
        # No packaged model / loader wired up yet.
        return False

    def complete(self, prompt: str, **opts) -> str:
        raise InferenceUnavailable(
            "The bundled local model isn't set up yet. Model download and "
            "loading arrive in a later step."
        )


_backend = None


def get_backend(force_refresh: bool = False) -> InferenceBackend:
    """Pick a backend once and cache it.

    Startup probe: use Ollama when reachable (a user who already runs it),
    otherwise fall back to the bundled backend. `LEXICON_INFERENCE` forces a
    specific backend and skips detection.
    """
    global _backend
    if _backend is not None and not force_refresh:
        return _backend

    if FORCE_BACKEND == "ollama":
        _backend = OllamaBackend()
    elif FORCE_BACKEND == "bundled":
        _backend = BundledBackend()
    else:
        ollama = OllamaBackend()
        _backend = ollama if ollama.available() else BundledBackend()
    return _backend


if __name__ == "__main__":
    # Quick manual check: which backend gets selected and is it usable?
    backend = get_backend()
    print(f"Selected backend: {backend.name}")
    print(f"Available: {backend.available()}")
