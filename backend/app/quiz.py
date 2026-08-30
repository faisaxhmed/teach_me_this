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


def explain_missed_questions(missed_questions, document_text):
    """Generates a grounded explanation for each missed question, plus one targeted follow-up
    question on the most-missed concept, using the document as the source of truth."""
    missed_summary = "\n".join(
        f"- Question: {q['question']}\n  Correct answer: {q['options'][q['correct_index']]}"
        for q in missed_questions
    )

    system_prompt = """You are a tutor helping a student understand what they got wrong on a quiz.

Rules:
- Base explanations ONLY on the provided document text.
- For each missed question, explain clearly why the correct answer is correct, in a way that \
addresses the likely misunderstanding.
- After explaining all missed questions, generate ONE new multiple-choice follow-up question \
that targets the single concept the student seems weakest on, based on the pattern of what \
they missed.
- Return ONLY valid JSON, no other text, no markdown code fences, matching this exact shape:
{"explanations": [{"question": "...", "explanation": "..."}], "followup_question": {"id": "f1", "question": "...", "options": ["...", "...", "...", "..."], "correct_index": 0}}
"""

    user_message = f"Document:\n{document_text}\n\nMissed questions:\n{missed_summary}"

    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1500,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}]
    )

    raw_output = response.content[0].text.strip()

    if raw_output.startswith("```"):
        raw_output = raw_output.split("```")[1]
        if raw_output.startswith("json"):
            raw_output = raw_output[4:]
        raw_output = raw_output.strip()

    try:
        return json.loads(raw_output)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse explanation response: {e}\nRaw output: {raw_output}")
