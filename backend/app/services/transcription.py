import os

from fastapi import APIRouter, UploadFile, File, HTTPException
from groq import Groq

router = APIRouter()

MAX_AUDIO_SIZE = 10 * 1024 * 1024


@router.post("/api/v1/transcribe")
def transcribe_audio(file: UploadFile = File(...)):
    audio = file.file.read(MAX_AUDIO_SIZE + 1)

    if not audio:
        raise HTTPException(400, "Empty audio recording")

    if len(audio) > MAX_AUDIO_SIZE:
        raise HTTPException(413, "Audio recording is too large")

    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise HTTPException(500, "Groq API configuration missing")

    try:
        client = Groq(
            api_key=api_key,
            timeout=30.0,
            max_retries=1
        )

        result = client.audio.transcriptions.create(
            file=(file.filename or "recording.webm", audio),
            model="whisper-large-v3-turbo",
            response_format="json",
            temperature=0.0
        )

        return {"text": result.text.strip()}

    except Exception:
        raise HTTPException(
            502,
            "Audio transcription failed. Please try again."
        )
