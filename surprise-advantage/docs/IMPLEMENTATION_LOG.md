# Implementation Log
## 2026-10-04 — Session 1
- Inspected repo: live Expo app (NewBuild Connect, App Store build). No existing Surprise Advantage site found. Chose isolated `surprise-advantage/` folder.
- Wrote Phase 0 docs, `.env.example`, readiness script.
- Built Phase 1 static site (5 pages). Pending items carry `data-pending` markers so the gate fails until owner supplies them.
- Fixed generator bug where an initial run produced no pages yet the readiness script passed on an empty site (note: script should also assert pages exist — see below).
- QA run (headless Chromium, 375/768/1280px, 5 pages): no horizontal overflow; internal link check: 0 broken of all root-relative links; empty-form submit shows "not accepting requests" (no network call). Tap targets: brand + footer links raised to 44px; inline paragraph links exempt.
- NOT yet done: screen-reader pass, contrast audit with a tool, keyboard walkthrough on real device, screenshots reviewed by owner.

## 2026-10-05 — Session 2 ("make it deployable")
- Added `lib/core.mjs` + `api/{request-copy,market-update,unsubscribe,q}.mjs`: validation, origin check, honeypot, rate limit, consent tagging, server-side HighLevel upsert, disabled-by-default.
- 13 unit tests (`npm test`): all pass. Covers consent rules, suppression, honeypot, origin, rate limit, CRM failure.
- Secret scan incl. git history: clean.
- Added /reader + 4 printable resources, /market-update, /unsubscribe, `vercel.json` security headers, QR redirect map, `docs/DEPLOY.md`.
- Browser checks (Playwright, mocked API): no overflow at 375/768/1280 on 9 pages; empty submit shows 4 errors and sends nothing; valid submit sends expected payload and shows server message; consent required on market-update; 503 message surfaced.
- NOT verified: live HighLevel behaviour (no credentials), real-device mobile, screen reader, contrast tool, Vercel deploy.
