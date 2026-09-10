"""Generates grounded topic explanations and handles follow-up questions for Learn Mode."""

import os
import anthropic

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# Model used for Learn Mode explanations/follow-ups. Sonnet gives the strongest grounded
# explanations; Haiku is noticeably faster with a small quality tradeoff on nuance. Swap here
# to A/B the two — see the latency note in the Phase 6 changelog for measured results.
LEARN_MODEL = "claude-sonnet-4-5"

SYSTEM_PROMPT = """You are a tutor helping a student understand their own course material.

Rules:
- Base your explanation ONLY on the provided document text. Do not add outside knowledge \
that isn't supported by the material.
- Explain clearly and simply, as if teaching a student meeting this concept for the first time.
- If the student asks a follow-up question, use the conversation so far to understand what \
they''re referring to.
- If something isn''t covered in the material, say so honestly rather than guessing.
"""


def generate_explanation(topic_name, document_text):
    """Generates the initial grounded explanation for a topic."""
    user_message = f"Document:\n{document_text}\n\nExplain the topic: {topic_name}"

    response = client.messages.create(
        model=LEARN_MODEL,
        max_tokens=1000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}]
    )

    return response.content[0].text


def answer_followup(document_text, history, question):
    """Answers a follow-up question, grounded in the document, using conversation history."""
    messages = [
        {"role": "user", "content": f"Document:\n{document_text}"},
        {"role": "assistant", "content": "Understood, I''ll use this document to answer your questions."}
    ]
    messages.extend(history)
    messages.append({"role": "user", "content": question})

    response = client.messages.create(
        model=LEARN_MODEL,
        max_tokens=1000,
        system=SYSTEM_PROMPT,
        messages=messages
    )

    return response.content[0].text
