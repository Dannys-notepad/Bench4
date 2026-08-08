You are a Senior Software Engineer mentoring me, a Junior Backend Engineer.
I am working on this project and I like when you give me code, but I want you 
to teach me while giving the code, not just provide solutions.

How You Should Respond

1. Understand My Request
   - Briefly restate what I'm trying to do
   - Point out any assumptions or missing details if necessary

2. Explain Before Code
   - Explain the approach and logic first
   - Tell me why you are choosing this method
   - Keep it simple and practical

3. Provide the Code
   - Write clean, well-structured, production-style code
   - Follow best practices (readable, modular, maintainable)

4. Explain the Code Clearly
   - Break the code down step-by-step
   - Explain important lines and blocks
   - Focus on why things are done, not just what they do

5. Highlight Key Concepts
   - Mention important backend concepts used (e.g., async/await, middleware, 
     validation, database queries, etc.)
   - Explain them briefly in context

6. Improve My Thinking
   - Point out any bad practices or weak logic in my approach
   - Suggest better or more scalable alternatives if needed

7. Give Me a Small Challenge
   - Ask me a question OR give me a small task based on what you just explained

Rules
- Do NOT just dump code without explanation
- Do NOT skip the reasoning
- Keep explanations clear and beginner-friendly
- If I don't understand, simplify further
- Be direct and honest like a real senior engineer
- Do not write code for me instead, review my code, point out errors and nudge me in the right direction, also, ask me technical questions on each implementation and reason behind each code decision, if can't answer, give me a structural explanation
- You are a Senior software engineer, guiding and mentoring a junior backend software

Context
I am learning backend development (Node.js, APIs, databases, etc.) and I want to:
- Understand code deeply
- Write clean and maintainable code
- Think like a real software engineer

Start by asking what I'm currently building and where I'm stuck.

# Bench 4

Bench 4 is a personal AI agent project that turns handwritten laboratory notes into structured, reviewed, finalized research reports — via two complementary pipelines rather than one auto-switching system.

## The problem it solves

Academic research generates a huge volume of raw, handwritten bench notes — shorthand, mid-experiment corrections, values scribbled in margins. Turning that into a properly formatted lab report is tedious, repetitive work that still has to be done carefully, since it feeds into real research records. Bench 4 automates the tedious part (structuring, formatting) while deliberately keeping a human in the loop for anything the agent isn't confident about — and, for researchers who haven't finished writing their notes yet, offers a guided path to build the report instead of just digitizing one.

## Two pipelines, one workflow

Rather than one pipeline that silently decides per-field whether to transcribe or generate, Bench 4 runs two separate, independently reliable pipelines, presented as a single seamless workflow at the frontend entry point ("do you have a complete written report, or just raw data?").

### Pipeline 1 — Digitization

For a researcher who has already filled out their notes by hand and just wants them turned into a clean digital report.

1. **Upload** — the researcher photographs a notebook page as-is, no retyping, no special note-taking format required. A report title and template (titration, spectroscopy, synthesis, etc.) are selected alongside it.
2. **Transcription** — Gemini reads the handwriting from the photo and produces a raw text transcript. Anything ambiguous (an unclear digit, a smudged word) is flagged with a confidence marker rather than silently guessed at, and shown side-by-side with the source photo for the researcher to confirm or correct.
3. **Structured draft** — the confirmed transcript is mapped into the chosen report template's sections. Any missing required field is explicitly flagged (e.g. `MISSING: concentration`) instead of being fabricated. The section structure itself is read from the note — whatever headers and order actually appear on the page — rather than forced into a rigid layout; a fixed fallback schema applies only when the note has no discernible structure.
4. **Finalized** — once the researcher reviews and approves the draft, it's locked, stamped as verified, and exported as a PDF. Every report keeps its original photo, raw transcript, and edit history linked for a full audit trail.

### Pipeline 2 — AI-guided reporting

For a researcher who only has raw data and a manual, not a finished write-up.

1. **Setup** — the researcher uploads the lab manual and raw results (measurements, apparatus, observations), and specifies the section structure they want for the final report.
2. **Gap resolution (chat-driven)** — Bench 4 identifies what's missing and resolves each gap one of two ways:
   - **Lookup-able gaps** (precautions, hazard data, standard reference values) are resolved by querying verified sources (MSDS/PubChem-style databases) and presented back to the researcher for confirmation — never auto-inserted silently.
   - **Researcher-specific gaps** (actual observations, discussion, conclusion) are asked directly in chat, since these must reflect what the researcher actually found, not an AI's guess.
3. **Structured draft** — once all gaps are resolved and confirmed, the same structuring logic used in Pipeline 1 assembles the final typed-section content.
4. **Finalized** — same review, approval, and export flow as Pipeline 1.

Both pipelines converge on the same output contract (see below) and the same finalize/export step, so downstream code never needs to know which pipeline produced a report.

## Shared quick tools

Deterministic, non-generative modules usable standalone or invoked mid-chat by Pipeline 2:

- **Sample preparation calculator** — dilution, molarity, stoichiometry; researcher supplies target values (desired concentration, volume, etc.), tool computes the prep via formula, not model inference
- **Unit converter** — moles↔grams, volume, temperature, common chem conversions
- **Verified-source lookup** — hazard/precaution data and reference constants, with the source cited alongside any value it supplies

## Core design principles

- **Never fabricate silently** — gaps and low-confidence reads are always surfaced, never filled by guesswork; this applies to both AI transcription confidence and gap-filling in Pipeline 2
- **Human approval required at every stage** — no report reaches "finalized" without explicit review
- **Full reproducibility** — raw inputs are never discarded once processed; they stay linked to every downstream version, including which verified sources contributed to any AI-guided content
- **The model decides content, not markup** — AI output is a dynamic but structured list of typed sections (text, table, list, Q&A), not raw HTML. Bench 4's own renderer turns that into HTML consistently across every report and template, so formatting never depends on the model's HTML-authoring reliability. This keeps the "dynamic structure" flexibility from both pipelines without inheriting inconsistent styling or malformed markup.

## Tech stack

- **Backend**: Express, PostgreSQL with Drizzle ORM, nodejs in queue system for async pipeline stages, Zod for validation
- **AI**: Gemini 2.5 Flash — vision calls for transcription, text calls for structuring and chat-guided gap resolution
- **Auth**: Google OAuth
- **PDF export**: Puppeteer-core + `@sparticuz/chromium` (avoids bundling a full Chromium binary), rendering Bench 4's own HTML templates rather than model-generated markup
- **Frontend**: Astro, with interactive app screens as component islands
- **Architecture**: feature-module structure (routes/service/schema grouped per feature — auth, templates, reports) rather than layered MVC, with shared infra (Gemini client, PDF generation, Redis, logging, quick-tools modules) in a top-level `lib/`