import uuid

from sqlalchemy import select, update, func
from sqlalchemy.orm import Session

from app.models import User, Conversation, Message, MessageCitation


def get_or_create_user(db: Session, email: str):
    user = db.scalar(select(User).where(User.email == email))

    if user:
        return user

    user = User(email=email)
    db.add(user)
    db.flush()
    return user


def create_conversation(db: Session, user_id: uuid.UUID, title="New Chat"):
    conversation = Conversation(user_id=user_id, title=title)
    db.add(conversation)
    db.flush()
    return conversation


def get_conversation(db: Session, conversation_id: uuid.UUID, user_id: uuid.UUID):
    return db.scalar(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id
        )
    )


def list_conversations(db: Session, user_id: uuid.UUID, limit=50):
    return db.scalars(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc(), Conversation.id.desc())
        .limit(limit)
    ).all()


def save_message(
    db: Session,
    conversation_id: uuid.UUID,
    role: str,
    content: str,
    sources=None
):
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content
    )

    db.add(message)
    db.flush()

    if sources:
        for source in dict.fromkeys(sources):
            db.add(
                MessageCitation(
                    message_id=message.id,
                    source_filename=source
                )
            )

    db.execute(
        update(Conversation)
        .where(Conversation.id == conversation_id)
        .values(updated_at=func.now())
    )

    return message


def get_messages(db: Session, conversation_id: uuid.UUID, limit=100):
    messages = db.scalars(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc(), Message.id.desc())
        .limit(limit)
    ).all()

    return list(reversed(messages))


def rename_conversation(db: Session, conversation: Conversation, title: str):
    conversation.title = title
    db.flush()
    return conversation


def delete_conversation(db: Session, conversation: Conversation):
    db.delete(conversation)
    db.flush()
