from functools import lru_cache

import re

import numpy as np
from rank_bm25 import BM25Okapi

from app.services.knowledge_base import get_knowledge_base


def tokenize(text):
    return re.findall(r"[\w]+", text.lower())


class HybridRetriever:
    def __init__(self):
        self.model, self.documents, self.embeddings = get_knowledge_base()

        self.tokenized_corpus = [
            tokenize(doc["text"])
            for doc in self.documents
        ]

        self.bm25 = BM25Okapi(self.tokenized_corpus)

    def search(self, query, top_k=5):
        query = query.strip()

        if not query:
            return []

        query_embedding = self.model.encode(
            ["query: " + query],
            normalize_embeddings=True,
            show_progress_bar=False
        )[0]

        semantic_scores = np.dot(
            self.embeddings,
            query_embedding
        )

        bm25_scores = self.bm25.get_scores(tokenize(query))

        candidate_count = min(30, len(self.documents))

        semantic_rank = np.argsort(semantic_scores)[::-1][
            :candidate_count
        ]

        bm25_rank = np.argsort(bm25_scores)[::-1][
            :candidate_count
        ]

        rrf_scores = {}

        for ranking in (semantic_rank, bm25_rank):
            for position, index in enumerate(ranking, start=1):
                i = int(index)
                rrf_scores[i] = (
                    rrf_scores.get(i, 0.0)
                    + 1.0 / (60 + position)
                )

        candidates = sorted(
            rrf_scores,
            key=lambda i: rrf_scores[i],
            reverse=True
        )

        selected = []
        lambda_mmr = 0.75

        while candidates and len(selected) < top_k:
            best_index = None
            best_score = float("-inf")

            for i in candidates:
                relevance = rrf_scores[i]

                if selected:
                    redundancy = max(
                        float(np.dot(
                            self.embeddings[i],
                            self.embeddings[j]
                        ))
                        for j in selected
                    )
                else:
                    redundancy = 0.0

                score = (
                    lambda_mmr * relevance
                    - (1 - lambda_mmr) * redundancy * 0.03
                )

                if score > best_score:
                    best_score = score
                    best_index = i

            selected.append(best_index)
            candidates.remove(best_index)

        results = []

        for index in selected:
            doc = self.documents[index]

            results.append({
                "id": doc["id"],
                "source": doc["source"],
                "text": doc["text"],
                "semantic_score": round(
                    float(semantic_scores[index]), 4
                ),
                "bm25_score": round(
                    float(bm25_scores[index]), 4
                ),
                "rrf_score": round(
                    float(rrf_scores[index]), 6
                )
            })

        return results


@lru_cache(maxsize=1)
def get_retriever():
    return HybridRetriever()
