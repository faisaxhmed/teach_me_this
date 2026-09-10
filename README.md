# TeachMeThis

A study tool that actually reads your course material before it teaches you.

**Live:** [teach-me-this-two.vercel.app](https://teach-me-this-two.vercel.app) (password-gated, see Access below)

## What this is

You upload your own lecture PDFs or textbook chapters. TeachMeThis reads them, explains the concepts in plain language, quizzes you on them, and when you get something wrong, explains why using your own material and immediately follows up with a targeted question on that exact weak spot.

**The analogy:** a tutor who's actually read your specific lecture slides before the session — not a generic chatbot you paste a PDF into.

**What this explicitly is not:** "upload a PDF, ask it anything." That's ChatGPT with an attachment, and it's not differentiated. The value here is the loop: **material → learn → test → identify weakness → targeted practice.**

## MVP scope

This is deliberately small. Three features, nothing else:

1. **Upload + analyze** — upload a PDF, parse it, identify the major topics/concepts, show them to the student.
2. **Learn** — student picks a topic, gets a grounded explanation based on their material (not general knowledge), can ask follow-up questions.
3. **Quiz → feedback → targeted practice** — generate a quiz from the material, evaluate answers, explain wrong answers using the source material, track which concepts the student struggled with, serve one follow-up question targeting that specific weakness.

**Explicitly Phase 2, not being built now:** spaced repetition, mastery modeling, multiple courses, voice input, adaptive difficulty curves, agents. 

All three shipped, plus the full feedback loop: quiz grading happens server-side, wrong answers get a grounded explanation, and the student gets one targeted follow-up question they can actually answer and get graded on, not just read.

## Key decisions

**No user accounts.** Progress is tracked per session/browser, not behind login. A deliberate simplicity choice, not an oversight — building auth well is its own project, and it isn't needed to prove the core loop works.

**Full document context, not RAG.** Lecture PDFs are small enough to pass in full; chunking/embeddings/retrieval add a failure mode (did we retrieve the right chunk?) without a clear benefit at this scale. This was evaluated deliberately, the same way full-context vs. RAG was compared in an earlier project, rather than assumed. RAG is the natural next step if this ever needs to handle textbook-length uploads.

**In-memory session storage** Learn and quiz sessions live in the backend process's memory, keyed by a cryptographically random ID. Known, accepted limitation: a server restart or redeploy loses in-flight sessions. Chosen deliberately for this stage (single instance, no persistent-account promise to users) over adding infrastructure the app doesn't need yet.

**Multiple choice, not free-text quizzing.** Keeps grading a simple, reliable index match server-side rather than needing a second LLM call just to judge free-text answers. Traded some richness of assessment for a simpler, cheaper, more predictable core loop.

**A shared access password, not signup.** This is a portfolio demo, not a public product. Requiring an account would add friction for a recruiter trying the live link for two minutes. A password (shared via CV/portfolio) plus per-IP rate limiting caps cost exposure without that friction — a soft gate against casual and automated traffic, not a hard security boundary, and treated as such.

## Architecture

- **Backend:** FastAPI, deployed on Railway
- **Frontend:** React (Vite), deployed on Vercel
- **PDF parsing:** PyMuPDF (reused from an earlier project, the Legal Document Explainer)
- **LLM:** Claude API (Sonnet) — explanations and quiz content are grounded in the uploaded material, with the system instructed to avoid unsupported claims. Instructions live only in the system prompt; uploaded document text is always treated as data, never as commands, which is also the app's prompt-injection defense.
- **Retrieval:** not used. Evaluated and deliberately skipped, see Key decisions above.
- **Answer evaluation:** exact index match, server-side. The quiz sent to the client never includes the correct answers; grading happens only against the stored answer key on the backend.

## Security

This is public-facing and costs real API money per request, so these were built in from the start, not added later:

- Password-gated access, checked with a constant-time comparison, short-lived server-issued token required on every API call
- Rate limiting per IP on every Claude-calling endpoint, with a stricter limit on the password check itself
- File upload validation: size cap, and real content-type checking (not just trusting the `.pdf` extension)
- Field-level input validation (length limits, range checks) on every request body, not just file uploads
- No secrets in the frontend or repo — API keys, the access password, and the admin key all live server-side as environment variables; `.env.example` documents what's required without exposing real values
- CORS restricted to the app's actual frontend origin(s), configurable via environment variable, never wildcarded
- Errors return short, generic messages to the client; full details are logged server-side only
- A hard monthly spend cap set on the Anthropic account, as the final backstop regardless of what the above catches

## Status

Built, deployed, and live. Backend and frontend both currently deployed on free/trial-tier hosting, so cold starts and a modest latency are expected on the first request after idle time.
