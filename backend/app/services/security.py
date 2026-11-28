import os
import re
import unicodedata


def normalize(text):
    text = unicodedata.normalize("NFKC", text)
    text = re.sub(r"[\u200b-\u200f\ufeff]", "", text)
    return " ".join(text.lower().split())


RESPONSES = {
    "identity": {
        "english": "I am **CorpPilot AI**, your personal AI workplace mentor. I help you navigate corporate life with confidence.",
        "hinglish": "Main **CorpPilot AI** hoon, tumhara personal workplace mentor. Main corporate life samajhne aur professional situations handle karne mein tumhari help karta hoon.",
        "hindi": "मैं **CorpPilot AI** हूँ, आपका व्यक्तिगत कार्यस्थल मार्गदर्शक।"
    },
    "creator": {
        "english": "**CorpPilot AI** was developed by **Jaanvi Mutreja** to help students and early-career professionals navigate corporate life.",
        "hinglish": "**CorpPilot AI** ko **Jaanvi Mutreja** ne develop kiya hai, students aur freshers ko corporate life samajhne mein help karne ke liye.",
        "hindi": "**CorpPilot AI** को **Jaanvi Mutreja** ने विकसित किया है।"
    },
    "model": {
        "english": "I use artificial intelligence and Retrieval-Augmented Generation (RAG) to provide workplace guidance. My internal model configuration is private.",
        "hinglish": "Main AI aur Retrieval-Augmented Generation (RAG) technology use karta hoon. Meri internal model configuration private hai.",
        "hindi": "मैं कार्यस्थल संबंधी मार्गदर्शन के लिए AI और RAG तकनीक का उपयोग करता हूँ। मेरी आंतरिक मॉडल जानकारी निजी है।"
    },
    "restricted": {
        "english": "I cannot share private system instructions, credentials or internal configuration. I can help you with workplace-related questions.",
        "hinglish": "Main private system instructions, credentials ya internal configuration share nahi kar sakta. Workplace-related questions mein tumhari help kar sakta hoon.",
        "hindi": "मैं निजी सिस्टम निर्देश, क्रेडेंशियल या आंतरिक कॉन्फ़िगरेशन साझा नहीं कर सकता।"
    }
}


PATTERNS = {
    "restricted": [
        r"\b(ignore|forget|override|bypass|disregard)\b.{0,60}\b(instructions|rules|system prompt|restrictions)\b",
        r"\b(reveal|show|print|dump|extract|repeat|translate|display|give)\b.{0,60}\b(your system prompt|hidden instructions|developer prompt|your api key|environment variables|your credentials)\b",
        r"\b(system prompt|api key|hidden instructions)\b.{0,30}\b(reveal|dikhao|batao|share karo)\b",
        r"\b(jailbreak|developer mode|unrestricted mode)\b"
    ],
    "creator": [
        r"\bwho (created|built|developed|made|designed|trained) you\b",
        r"\bwho is your (creator|developer|owner|founder)\b",
        r"\b(tumhe|tumko|tujhe|aapko|tumhein)?\s*kisne\s+(banaya|develop|create)\b",
        r"\b(tumhara|tumhare|tumhari|aapka) (developer|creator|owner) kaun\b",
        r"किसने बनाया",
        r"निर्माता कौन"
    ],
    "model": [
        r"\b(what|which) (ai |language |llm )?model\b",
        r"\bwhat model are you\b",
        r"\b(kis|kaunse|konse|konsa|kaunsa) (ai |llm )?model\b",
        r"\b(tumhara|tera|aapka) model\b",
        r"\bare you (chatgpt|gpt|claude|gemini|llama)\b",
        r"कौन सा मॉडल",
        r"किस मॉडल"
    ],
    "identity": [
        r"^(who are you|what are you|what is your name)[?.! ]*$",
        r"^(tum kaun ho|aap kaun ho|tu kaun hai|tumhara naam kya hai)[?.! ]*$",
        r"तुम कौन हो",
        r"आप कौन हैं"
    ]
}


def security_response(category, language):
    lang = normalize(str(language))

    if lang in {"hi", "hindi"}:
        lang = "hindi"
    elif lang in {"hinglish", "mixed", "hi-en"}:
        lang = "hinglish"
    else:
        lang = "english"

    return {
        "answer": RESPONSES[category][lang],
        "sources": []
    }


def inspect_input(message, language):
    text = normalize(message)

    for category, patterns in PATTERNS.items():
        if any(re.search(pattern, text) for pattern in patterns):
            return security_response(category, language)

    return None


def inspect_output(answer, language):
    protected_patterns = [
        r"\bopenai/gpt-oss-[\w.-]+\b",
        r"\bintfloat/multilingual-e5-small\b",
        r"\bgsk_[a-zA-Z0-9_-]{15,}\b",
        r"postgresql(?:\+psycopg)?://[^\s]+",
        r"\bGROQ_API_KEY\s*=\s*\S+"
    ]

    secrets = [
        os.getenv("GROQ_API_KEY"),
        os.getenv("DATABASE_URL")
    ]

    if any(secret and secret in answer for secret in secrets):
        return security_response("restricted", language)

    if any(
        re.search(pattern, answer, re.IGNORECASE)
        for pattern in protected_patterns
    ):
        return security_response("restricted", language)

    return None
