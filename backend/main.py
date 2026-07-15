from fastapi import FastAPI
from pydantic import BaseModel

from languagetool import check_text

app = FastAPI()


class GrammarRequest(BaseModel):
    text: str
    language: str = "en-US"


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/grammar/check")
def grammar_check(request: GrammarRequest):
    matches = check_text(request.text, request.language)
    return {"matches": matches}
