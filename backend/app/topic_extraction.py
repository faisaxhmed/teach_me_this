"""Extracts major topics/concepts from cleaned document text using the Claude API."""

import os
import json
import anthropic

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are analyzing course material to identify its major topics or concepts, \
so a student can choose one to study.

Rules:
- Base topics ONLY on the provided text. Do not invent topics that aren't actually covered.
- Return between 3 and 8 topics, depending on how much the material actually covers. \
Do not pad to reach a number.
- Each topic needs a short, clear name (a few words), not a full sentence.
- Return ONLY valid JSON, no other text, no markdown code fences, matching this exact shape:
{"topics": [{"id": "t1", "name": "Topic Name"}, {"id": "t2", "name": "Topic Name"}]}
"""


def extract_topics(document_text):
    """Sends document text to Claude and returns a list of topic dicts with id and name."""
    response = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1000,
        system=SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": document_text}
        ]
    )

    raw_output = response.content[0].text.strip()

    # Strip markdown code fences if the model wrapped the JSON in them, despite instructions not to
    if raw_output.startswith("```"):
        raw_output = raw_output.split("```")[1]
        if raw_output.startswith("json"):
            raw_output = raw_output[4:]
        raw_output = raw_output.strip()


    try:
        parsed = json.loads(raw_output)
        return parsed["topics"]
    except (json.JSONDecodeError, KeyError, IndexError) as e:
        raise ValueError(f"Failed to parse topic extraction response: {e}\nRaw output: {raw_output}")