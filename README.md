# TeachMeThis

A study tool that actually reads your course material before it teaches you.

## What this is

You upload your own lecture PDFs or textbook chapters. TeachMeThis reads them, explains the concepts in plain language, quizzes you on them, and when you get something wrong, explains why using your own material and immediately follows up with a targeted question on that exact weak spot.

**The analogy:** a tutor who's actually read your specific lecture slides before the session — not a generic chatbot you paste a PDF into.

**What this explicitly is not:** "upload a PDF, ask it anything." That's ChatGPT with an attachment, and it's not differentiated. The value here is the loop: **material → learn → test → identify weakness → targeted practice.**

## MVP scope

This is deliberately small. Three features, nothing else:

1. **Upload + analyze** — upload a PDF, parse it, identify the major topics/concepts, show them to the student.
2. **Learn** — student picks a topic, gets a grounded explanation based on their material (not general knowledge), can ask follow-up questions.
3. **Quiz → feedback → targeted practice** — generate a quiz from the material, evaluate answers, explain wrong answers using the source material, track which concepts the student struggled with, serve one follow-up question targeting that specific weakness.

**Explicitly Phase 2, not being built now:** spaced repetition, mastery modeling, multiple courses, voice input, adaptive difficulty curves, agents. These are only worth building later if real usage shows they're actually needed.

## Key decision: no user accounts for v1

Progress is tracked per session/browser, not behind login. This is a deliberate simplicity choice, not an oversight — building auth well is its own project, and it isn't needed to prove the core loop works.

## Architecture

- **Backend:** FastAPI
- **Frontend:** React
- **PDF parsing:** PyMuPDF (reused from an earlier project, the Legal Document Explainer)
- **LLM:** Claude API — explanations and quiz content are grounded in the uploaded material, with the system instructed to avoid unsupported claims
- **Retrieval (Chroma + embeddings):** not assumed. Whether this project needs RAG at all will be evaluated fresh for this use case, the same way full-context vs. RAG was evaluated in the Legal Document Explainer, rather than carried over by default.
- **Answer evaluation:** approach (exact match / keyword match / LLM-judged) to be decided explicitly and documented, not silently picked.

## Security (from day one, not added later)

This is public-facing and costs real API money per request:

- Rate limiting per session/IP
- File upload validation — size limits and real file-type checking, not just trusting the extension
- Prompt injection awareness — uploaded PDF content is untrusted; instructions live only in the system prompt, extracted text is never treated as a command
- No secrets in the frontend or repo — API keys stay server-side via environment variables
- Clear data handling — uploaded documents are not retained long-term, or have a defined deletion path, since course material may contain personal information

## Status

Early stage. Name and scope locked. Build not yet started.
