# The Surprise Advantage — 90-Day Authority Launch

Technical infrastructure for the book-led authority campaign of Phillip Williams Real Estate Group | eXp Realty (Surprise & the West Valley, AZ). Campaign start: 2026-09-26.

**Positioning:** Read the Book. Understand the Market. Make Your Move Strategically.
**Success standard:** reader trust and usefulness — not aggressive lead capture.

> This folder is deliberately separate from the NewBuild Connect Expo app that lives at the repo root. Nothing here touches the app, and nothing in the app depends on this folder.

## Layout
| Path | Purpose |
|---|---|
| `site/` | Static, dependency-free, mobile-first website (Phase 1) |
| `scripts/check-launch-readiness.mjs` | Fails while any unapproved/pending content remains. The public-launch gate. |
| `docs/` | Roadmap, asset inventory, dependency register, acceptance criteria, risk & approval register, implementation + decision logs, Amazon owner checklist, open questions |
| `.env.example` | Server-side-only variable template |

## Preview locally
```
cd surprise-advantage/site && python3 -m http.server 8080
node ../scripts/check-launch-readiness.mjs
```

## Status
See `docs/IMPLEMENTATION_LOG.md` (what exists) and `docs/ACCEPTANCE_CRITERIA.md` (what is actually *done*). A file existing is not completion.
**Not deployed. Not public. The API returns 503 until the owner enables it. No emails/SMS sent.**

`npm test` · `npm run check` · deploy steps: `docs/DEPLOY.md` · approvals: `OWNER_APPROVALS.json`
