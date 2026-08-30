"""Generates multiple-choice quiz questions grounded in document text, for a given topic."""

import os
import json
import anthropic

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are generating a multiple-choice quiz question set to test a student''s \
understanding of one topic from their course material.

Rules:
- Base every question and every answer option ONLY on the provided document text. Do not \
invent facts not supported by the material.
- Generate between 3 and 5 questions, depending on how much the material actually supports \
for this specific topic. Do not pad to reach a number.
- Each question needs exactly 4 answer options, with exactly one correct answer.
- Wrong options should be plausible, not obviously wrong, so the question actually tests \
understanding.
- Return ONLY valid JSON, no other text, no markdown code fences, matching this exact shape:
{"questions": [{"id": "q1", "question": "...", "options": ["...", "...", "...", "..."], "correct_index": 0}]}
"""


def generate_quiz(topic_name, document_text):
    """Generates a multiple-choice quiz for a topic, grounded in the document text."""
    user_message = f"Document:\n{document_text}\n\nGenerate a quiz for the topic: {topic_name}"

    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1500,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}]
    )

    raw_output = response.content[0].text.strip()

    if raw_output.startswith("```"):
        raw_output = raw_output.split("```")[1]
        if raw_output.startswith("json"):
            raw_output = raw_output[4:]
        raw_output = raw_output.strip()

    try:
        parsed = json.loads(raw_output)
        return parsed["questions"]
    except (json.JSONDecodeError, KeyError, IndexError) as e:
        raise ValueError(f"Failed to parse quiz generation response: {e}\nRaw output: {raw_output}")
