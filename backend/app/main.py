from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
import os
import uuid

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import User
from app.services.rag import ChatRequest, answer_question
from app.services import conversation_service as cs
class CreateConversationRequest(BaseModel):
    title: str = Field(default="New Chat", min_length=1, max_length=255)


class RenameConversationRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)


class SendMessageRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)


DEV_EMAIL = "local-dev@corppilot.test"


@asynccontextmanager
async def lifespan(app: FastAPI):
    if os.getenv("CORPPILOT_LOCAL_DEV") != "1":
        raise RuntimeError(
            "Chat history API requires authentication before deployment. "
            "Set CORPPILOT_LOCAL_DEV=1 only for local development."
        )
    yield


app = FastAPI(
    title="CorpPilot AI",
    version="0.2.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_dev_user(db: Session = Depends(get_db)):
    user = cs.get_or_create_user(db, DEV_EMAIL)
    db.commit()
    db.refresh(user)
    return user


def require_conversation(
    conversation_id: uuid.UUID,
    db: Session,
    user: User
):
    conversation = cs.get_conversation(db, conversation_id, user.id)

    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return conversation


def serialize_conversation(conversation):
    return {
        "id": str(conversation.id),
        "title": conversation.title,
        "created_at": conversation.created_at,
        "updated_at": conversation.updated_at
    }


@app.get("/api/v1/health")
def health():
    return {"status": "ok", "service": "CorpPilot AI"}


@app.post("/api/v1/chat")
def chat(request: ChatRequest):
    return answer_question(request.message)


@app.post("/api/v1/conversations")
def create_conversation(
    request: CreateConversationRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_dev_user)
):
    conversation = cs.create_conversation(db, user.id, request.title)
    db.commit()
    db.refresh(conversation)
    return serialize_conversation(conversation)


@app.get("/api/v1/conversations")
def list_conversations(
    db: Session = Depends(get_db),
    user: User = Depends(get_dev_user)
):
    conversations = cs.list_conversations(db, user.id)
    return [serialize_conversation(c) for c in conversations]


@app.get("/api/v1/conversations/{conversation_id}/messages")
def get_messages(
    conversation_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_dev_user)
):
    require_conversation(conversation_id, db, user)
    messages = cs.get_messages(db, conversation_id)

    return [
        {
            "id": str(message.id),
            "role": message.role,
            "content": message.content,
            "created_at": message.created_at
        }
        for message in messages
    ]


@app.post("/api/v1/conversations/{conversation_id}/messages")
def send_message(
    conversation_id: uuid.UUID,
    request: SendMessageRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_dev_user)
):
    conversation = require_conversation(conversation_id, db, user)

    previous_messages = cs.get_messages(db, conversation.id, limit=10)

    history = [
        {"role": msg.role, "content": msg.content}
        for msg in previous_messages
        if msg.role in ("user", "assistant")
    ]
    
    result = answer_question(request.message, history=history)

    cs.save_message(db, conversation.id, "user", request.message)
    cs.save_message(
        db,
        conversation.id,
        "assistant",
        result["answer"],
        result["sources"]
    )

    if conversation.title == "New Chat":
        conversation.title = request.message[:80]

    db.commit()

    return {
        "conversation_id": str(conversation.id),
        "answer": result["answer"],
        "sources": result["sources"]
    }


@app.patch("/api/v1/conversations/{conversation_id}")
def rename_conversation(
    conversation_id: uuid.UUID,
    request: RenameConversationRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_dev_user)
):
    conversation = require_conversation(conversation_id, db, user)
    cs.rename_conversation(db, conversation, request.title)
    db.commit()
    db.refresh(conversation)
    return serialize_conversation(conversation)


@app.delete("/api/v1/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_dev_user)
):
    conversation = require_conversation(conversation_id, db, user)
    cs.delete_conversation(db, conversation)
    db.commit()
    return {"deleted": True}


from app.services.transcription import router as transcription_router
app.include_router(transcription_router)


from app.scenario import router as scenario_router
app.include_router(scenario_router)
