import re

HINGLISH_WORDS = {
    "mujhe", "mera", "meri", "mere", "kya", "kaise",
    "karu", "karun", "kare", "karen", "hai", "hain",
    "nahi", "nhi", "nai", "batao", "btao", "batana",
    "samjhao", "smjhao", "samjha", "smjha",
    "chahiye", "chaiye", "agar", "toh", "ab",
    "mila", "raha", "rahi", "rha", "rhi", "rhe",
    "karo", "mein", "mai", "mujhse", "usne",
    "mujhko", "chutti", "chhutti", "bolu", "puchu",
    "ache", "acche", "achhe", "acha", "accha",
    "achha", "achaa", "achaaa", "thoda", "thodi",
    "bahut", "bohot", "zyada", "jyada", "kam",
    "wala", "wali", "wale", "kyu", "kyun",
    "kyunki", "lekin", "matlab", "mtlb",
    "tum", "tumhe", "tumhara", "aap", "aapko",
    "kisne", "konsa", "konse", "kaunsa",
    "banaya", "banana", "banau", "karna",
    "karne", "karunga", "karungi", "karoge",
    "sakta", "sakti", "sakte", "hoga", "hogi",
    "honge", "kaam", "pata", "pta", "sirf",
    "sab", "aur", "phir", "fir", "haan", "hn",
    "haanji", "dekho", "dikhao", "likho",
    "doonga", "dunga", "dungi", "yaar", "bhai",
    "isme", "usme", "iska", "uska", "isse",
    "usse", "itna", "utna", "pehle", "baad"
}

WEAK_WORDS = {
    "h", "kr", "kar", "ka", "ki", "ke",
    "se", "me", "main", "ho", "ye", "wo"
}


def detect_language(text: str) -> str:
    text = text.strip()

    if re.search(r"[\u0904-\u0939\u0958-\u0961]", text):
        return "Hindi"

    words = set(re.findall(r"[a-z]+", text.lower()))

    strong = words & HINGLISH_WORDS
    weak = words & WEAK_WORDS

    if len(strong) >= 2:
        return "Hinglish"

    if strong and weak:
        return "Hinglish"

    if strong and len(words) <= 5:
        return "Hinglish"

    if len(weak) >= 2:
        return "Hinglish"

    return "English"


def language_instruction(language: str) -> str:
    instructions = {
        "Hindi": (
            "Respond in natural Hindi using Devanagari script. "
            "Common workplace terminology may remain in English."
        ),
        "Hinglish": (
            "MANDATORY: Respond in conversational Roman-script Hinglish. "
            "Write Hindi words using English alphabet only. "
            "Never use Devanagari characters. "
            "Example: Manager se politely feedback maango. "
            "Match the user's casual or professional tone. "
            "Do not translate Roman Hindi into Devanagari."
        ),
        "English": (
            "Respond in clear, natural English."
        )
    }

    return instructions.get(language, instructions["English"])


def output_language_valid(answer, language):
    if language in {"Hinglish", "English"}:
        return not bool(
            re.search(r"[\u0900-\u097F]", answer)
        )

    return True
