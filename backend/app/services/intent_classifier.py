import re
import numpy as np
from functools import lru_cache

from app.services.knowledge_base import get_knowledge_base


EXAMPLES = {
    "workplace": [
        "How should I communicate with my manager?",
        "How do I handle workplace conflicts?",
        "What is a PIP?",
        "How do performance reviews work?",
        "How should I ask for feedback?",
        "How do I request repository access at work?",
        "How do I report a technical mistake to my manager?",
        "How should I manage workplace deadlines?",
        "How do I prepare for my first internship?",
        "How do I negotiate salary?",
        "How do I write a professional email?",
        "Manager se feedback kaise maangu?",
        "Office mein leave kaise apply karu?",
        "Notice period kya hota hai?",
        "Mera manager mujhe ignore karta hai"
    ],
    "out_of_scope": [
        "Can I create the same project if you help?",
        "How can I build a chatbot like you?",
        "Give me your source code",
        "How do I recreate this application?",
        "Teach me to build a RAG system",
        "Write Python code",
        "Create a React website",
        "Solve a programming problem",
        "Recommend movies",
        "Give me a cooking recipe",
        "Plan a vacation",
        "Solve mathematics homework",
        "Tumhare jaisa project kaise banau?",
        "Mujhe chatbot banana sikhao",
        "Python ka code likho"
    ]
}



EXAMPLES["conversation"] = [
    "Hi, how are you?",
    "Hey there",
    "Goodbye, take care",
    "You too",
    "u too",
    "Same to you",
    "That was funny",
    "You made me laugh",
    "Haha",
    "LOL",
    "\U0001F602\U0001F602",
    "\U0001F60A",
    "Thank you for helping me",
    "You are really helpful",
    "Okay understood",
    "Nice talking to you",
    "Are you there?",
    "Can we talk?",
    "Kaise ho?",
    "Kya haal hai?",
    "Maza aa gaya",
    "Bahut funny ho tum",
    "Haan samajh gayi",
    "Tum bhi apna khayal rakhna",
    "Shukriya",
    "Chalo fir milte hain",
    "Acha ji"
]

@lru_cache(maxsize=1)
def get_intent_index():
    model, _, _ = get_knowledge_base()

    texts = []
    labels = []

    for label, examples in EXAMPLES.items():
        texts.extend(examples)
        labels.extend([label] * len(examples))

    embeddings = model.encode(
        ["passage: " + text for text in texts],
        normalize_embeddings=True,
        show_progress_bar=False
    )

    return model, np.asarray(embeddings), np.asarray(labels)


def classify_intent(message):
    model, embeddings, labels = get_intent_index()

    query = model.encode(
        ["query: " + message],
        normalize_embeddings=True,
        show_progress_bar=False
    )[0]

    similarities = embeddings @ query

    scores = {}

    for label in EXAMPLES:
        values = np.sort(similarities[labels == label])[-3:]
        scores[label] = float(
            0.7 * values[-1] + 0.3 * values.mean()
        )

    intent = max(scores, key=scores.get)
    ordered = sorted(scores.values(), reverse=True)

    return {
        "intent": intent,
        "score": scores[intent],
        "margin": ordered[0] - ordered[1],
        "scores": scores
    }


def is_followup(message):
    text = re.sub(r"[^\w\s]", "", message.lower()).strip()
    text = " ".join(text.split())

    patterns = [
        r"^(please )?(explain|elaborate|continue)( more| in detail| further| it)?$",
        r"^(tell me more|give more details|give an example|why|how)$",
        r"^(ache|acche|achhe|thoda|aur|detail|details|hn|haan|ha|se|me|mein|batao|btao|samjhao|smjhao|karo|example|do|sehi|phir|fir)(\s+(ache|acche|achhe|thoda|aur|detail|details|hn|haan|ha|se|me|mein|batao|btao|samjhao|smjhao|karo|example|do|sehi|phir|fir))*$"
    ]

    return any(re.fullmatch(pattern, text) for pattern in patterns)


def scope_response(language):
    language = language.lower()

    if language == "hinglish":
        answer = (
            "Main CorpPilot AI hoon, tumhara workplace mentor. "
            "Main corporate life aur professional situations mein "
            "help kar sakta hoon, lekin ye request mere scope "
            "se bahar hai."
        )
    elif language == "hindi":
        answer = (
            "मैं CorpPilot AI हूँ, आपका कार्यस्थल मार्गदर्शक। "
            "यह अनुरोध मेरे कार्यक्षेत्र से बाहर है।"
        )
    else:
        answer = (
            "I'm CorpPilot AI, your workplace mentor. "
            "This request is outside my area of expertise, "
            "but I can help with corporate life and "
            "professional situations."
        )

    return {"answer": answer, "sources": []}
