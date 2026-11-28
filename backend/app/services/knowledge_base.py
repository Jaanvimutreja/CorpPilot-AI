
import hashlib
import json
import re
from functools import lru_cache
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data" / "raw"
CACHE_DIR = BASE_DIR / "data" / "cache"
MODEL_NAME = "intfloat/multilingual-e5-small"

CACHE_DIR.mkdir(parents=True, exist_ok=True)


def clean_text(text):
    text = text.replace("\ufeff", "")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def chunk_text(text, max_words=180, overlap=35):
    sections = re.split(r"\n\s*\n", text)
    chunks = []

    for section in sections:
        words = section.split()

        if not words:
            continue

        if len(words) <= max_words:
            if len(words) >= 15:
                chunks.append(" ".join(words))
            continue

        step = max_words - overlap

        for start in range(0, len(words), step):
            chunk = " ".join(words[start:start + max_words])

            if len(chunk.split()) >= 15:
                chunks.append(chunk)

            if start + max_words >= len(words):
                break

    return chunks


def load_documents():
    documents = []
    seen = set()

    for file in sorted(DATA_DIR.glob("*.txt")):
        text = clean_text(file.read_text(encoding="utf-8-sig"))

        for index, chunk in enumerate(chunk_text(text)):
            normalized = re.sub(r"\s+", " ", chunk).lower()
            digest = hashlib.sha256(normalized.encode()).hexdigest()

            if digest in seen:
                continue

            seen.add(digest)

            documents.append({
                "id": f"{file.stem}_{index}",
                "source": file.name,
                "text": chunk
            })

    if not documents:
        raise RuntimeError("No usable TXT documents found in data/raw")

    return documents


def dataset_fingerprint():
    digest = hashlib.sha256()
    digest.update(MODEL_NAME.encode())

    for file in sorted(DATA_DIR.glob("*.txt")):
        digest.update(file.name.encode())
        digest.update(file.read_bytes())

    return digest.hexdigest()


@lru_cache(maxsize=1)
def get_knowledge_base():
    fingerprint = dataset_fingerprint()

    metadata_path = CACHE_DIR / "metadata.json"
    embeddings_path = CACHE_DIR / "embeddings.npy"

    if metadata_path.exists() and embeddings_path.exists():
        try:
            metadata = json.loads(
                metadata_path.read_text(encoding="utf-8")
            )

            if metadata.get("fingerprint") == fingerprint:
                embeddings = np.load(
                    embeddings_path,
                    allow_pickle=False
                )

                documents = metadata["documents"]

                if len(documents) == len(embeddings):
                    model = SentenceTransformer(MODEL_NAME)
                    return model, documents, embeddings

        except (OSError, ValueError, KeyError, json.JSONDecodeError):
            pass

    documents = load_documents()
    model = SentenceTransformer(MODEL_NAME)

    embeddings = model.encode(
        ["passage: " + doc["text"] for doc in documents],
        normalize_embeddings=True,
        batch_size=32,
        show_progress_bar=True
    )

    np.save(embeddings_path, embeddings)

    metadata_path.write_text(
        json.dumps(
            {
                "fingerprint": fingerprint,
                "documents": documents
            },
            ensure_ascii=False
        ),
        encoding="utf-8"
    )

    return model, documents, embeddings
