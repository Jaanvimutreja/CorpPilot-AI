import unittest

from app.services.rag import get_groq_client, MODEL_NAME
from app.services.intent_router import route_intent
from app.services.language import detect_language


class RouterTests(unittest.TestCase):

    def check_intent(self, message, expected, history=None):
        result = route_intent(
            message,
            history or [],
            get_groq_client(),
            MODEL_NAME
        )

        print(
            f"\n{message} | "
            f"{result['intent']} | "
            f"{result['method']}"
        )

        self.assertEqual(result["intent"], expected)

    def test_farewell_followup(self):
        self.check_intent(
            "u too",
            "conversation",
            [
                {"role": "user", "content": "bye"},
                {"role": "assistant", "content": "Take care!"}
            ]
        )

    def test_emoji(self):
        self.check_intent(
            "\U0001F602\U0001F602",
            "conversation"
        )

    def test_small_talk(self):
        self.check_intent("How are you?", "conversation")

    def test_compliment(self):
        self.check_intent("You are really funny", "conversation")

    def test_workplace(self):
        self.check_intent("What is a PIP?", "workplace")

    def test_hinglish_workplace(self):
        self.check_intent(
            "Manager se feedback kaise maangu?",
            "workplace"
        )

    def test_project_recreation(self):
        self.check_intent(
            "Can I create the same project if you help?",
            "out_of_scope"
        )

    def test_coding(self):
        self.check_intent(
            "Build a chatbot like you",
            "out_of_scope"
        )

    def test_unrelated_followup(self):
        self.check_intent(
            "ache se batao detail me",
            "out_of_scope",
            [
                {
                    "role": "user",
                    "content": "Can I create the same project?"
                },
                {
                    "role": "assistant",
                    "content": "That is outside my scope."
                }
            ]
        )

    def test_workplace_followup(self):
        self.check_intent(
            "ache se batao detail me",
            "workplace",
            [
                {"role": "user", "content": "What is a PIP?"},
                {
                    "role": "assistant",
                    "content": "Performance Improvement Plan."
                }
            ]
        )

    def test_technical_workplace(self):
        self.check_intent(
            "How do I ask my manager for GitHub access?",
            "workplace"
        )

    def test_language(self):
        self.assertEqual(
            detect_language("ache se batao detail me"),
            "Hinglish"
        )


if __name__ == "__main__":
    unittest.main()
