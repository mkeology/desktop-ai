# Rules for Agents

**Audience:** any AI agent (Claude, Copilot, or otherwise) working on this repo or these specs.

## What these specs are for

`docs/specs/` is the canonical description of the *product* — what it does, for whom, and how it's built — split across at most 10 pages, one primary audience each (Business Owner, End User, Architect, Developer, DevOps). Read the page for the audience closest to your current task before writing code or docs; don't infer product decisions from the codebase alone while it's still young.

## Precedence

1. Explicit instructions from the user in the current conversation.
2. These specs (`docs/specs/*`) — product intent and architecture.
3. [`CLAUDE.md`](../../CLAUDE.md) / [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md) — engineering conventions and security rules.
4. Whatever the code currently does, if it disagrees with the above — that's drift, not truth. Flag it.

## Non-negotiable product decisions

These came out of deliberate architecture discussion, not a default — don't re-litigate them without the user explicitly asking:

- The product is a **desktop app** (Electron), not a pure PWA. Isolated multi-account sessions need real cookie/storage partitioning, which a normal browser PWA cannot provide.
- Account isolation is done with **Electron session partitions** (`session.fromPartition`), one partition per account. Never share a partition across two accounts of the same or different providers.
- Third-party provider sites (ChatGPT, Claude, Gemini, ...) are embedded via **Electron `WebContentsView`**, never `<iframe>` — many of them block iframe embedding outright, and a real browsing context is what makes "log in once, stay logged in" work.
- **Never inject scripts into a provider's page to manipulate its UI** unless a user explicitly asks for a specific, scoped exception. Treat every provider site as an ordinary, unmodified website. This is what keeps the product working when providers change their frontend.
- The **Session** (Web / API / Terminal) is the core abstraction — see [Architecture](./04-architecture.md). New capabilities (files, notebooks, browser automation, MCP tools, remote machines, agents) should extend this abstraction, not bypass it.
- **Terminal sessions are never given to an AI/API session by default.** Any AI-driven access to a terminal must be an explicit, per-session, revocable permission, and destructive commands must be confirmed. See [Security](./06-security.md).
- Install and update must both be **trivially easy** for a non-technical user — no manual config, no separate download steps to get updates. See [User Guide](./03-user-guide.md) and [DevOps & Release](./07-devops-release.md).

## Format rules for these pages

- One topic per page, named `NN-topic.md`. Keep the numbering stable; if a page is removed, don't renumber the rest.
- Prefer **Mermaid** diagrams (` ```mermaid ` fences) over ASCII art — they render and stay legible as they grow.
- Keep pages skimmable: headings, tables, short paragraphs. A page that's becoming a wall of text should be split conceptually within itself (subheadings), not spawn a new file, unless it's genuinely a new audience.
- Stay at or under **10 pages total** including this one and the README index. If a task seems to need an 11th page, fold the content into the closest existing page, or ask the user before adding one.

## Update discipline

When you ship a user-visible change (new feature, removed feature, behavior change):

1. Update [`02-features-and-changelog.md`](./02-features-and-changelog.md) — both the feature table and the changelog.
2. Update whichever audience page(s) describe that feature (usually [User Guide](./03-user-guide.md), sometimes [Architecture](./04-architecture.md) or [Developer Guide](./05-developer-guide.md)).
3. Do this in the same change/PR as the code — don't defer doc updates to "later."

## When specs don't cover something

Specs are intentionally not exhaustive yet (see [Product Vision](./01-product-vision.md) for what's still open). If a task requires a product decision these pages don't answer, ask the user rather than inventing one — especially anything touching account isolation, terminal access, or data leaving the device.
