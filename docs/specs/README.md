# AI Workspace — Specs Index

This folder is the single source of truth for what the product is and how it's built, split into short, audience-targeted pages. Maximum 10 pages, on purpose — fold new material into an existing page before adding a new one.

| # | Page | Primary audience |
|---|---|---|
| 00 | [Agent Rules](./00-agent-rules.md) | AI coding agents (Claude, Copilot) |
| 01 | [Product Vision](./01-product-vision.md) | Business Owner / Product Owner |
| 02 | [Features & Changelog](./02-features-and-changelog.md) | Everyone |
| 03 | [User Guide](./03-user-guide.md) | Final users (anybody) |
| 04 | [Architecture](./04-architecture.md) | Architect |
| 05 | [Developer Guide](./05-developer-guide.md) | Developer |
| 06 | [Security](./06-security.md) | Architect, Developer, DevOps |
| 07 | [DevOps & Release](./07-devops-release.md) | DevOps |

## Where this came from

These specs formalize an initial product brainstorm (kept locally as `.spec`, git-ignored, not part of the repo history). If that source and these pages ever disagree, these pages win — the brainstorm was the seed, not the contract.

## Relationship to the engineering rules

[`CLAUDE.md`](../../CLAUDE.md) and [`.github/copilot-instructions.md`](../../.github/copilot-instructions.md) govern *how agents write code* in this repo (security rules, stack, style). This folder governs *what the product is*. Engineering rules and product specs should never contradict each other — if they seem to, treat it as a bug in the docs and flag it rather than silently picking one.
