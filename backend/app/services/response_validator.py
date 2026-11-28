
import re


def validate_response(answer: str, documents: list) -> dict:
    answer = answer.strip()

    answer = re.sub(
        r"【(\d+)】",
        r"[\1]",
        answer
    )

    valid_ids = set(range(1, len(documents) + 1))

    def clean_citation(match):
        citation_id = int(match.group(1))
        return match.group(0) if citation_id in valid_ids else ""

    answer = re.sub(
        r"\[(\d+)\]",
        clean_citation,
        answer
    )

    cited_ids = {
        int(number)
        for number in re.findall(r"\[(\d+)\]", answer)
    }

    sources = list(dict.fromkeys(
        documents[i - 1]["source"]
        for i in sorted(cited_ids)
    ))

    return {
        "answer": answer,
        "sources": sources
    }
