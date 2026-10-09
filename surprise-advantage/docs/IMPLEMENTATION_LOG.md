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

## 2026-10-07 — Preview deploy attempt
- Requested: Vercel preview. NOT DONE: Vercel connector disconnected, no CLI/token, api.vercel.com unreachable from the sandbox. Added a no-CLI dashboard route to docs/DEPLOY.md. No deployment exists.

## 2026-10-07 — GHL campaign planning
- Read-only audit of the connected GHL location (workflows, tags, templates, email campaigns). No writes.
- Wrote `GHL_CAMPAIGN_PLAN.md` and `GHL_EMAIL_DRAFTS.md`. Not built, not sent. HighLevel's public API cannot create workflows, so they are a UI build sheet.

## 2026-10-07 — GHL build (approved by Phillip)
- Created 21 tags, 1 template folder, 6 DRAFT plain-text templates via API. Pipeline not creatable via API — spec in GHL_BUILD_STATUS.md. No contacts touched, nothing sent.

## 2026-10-07 — Lovable Hub audit
- Located and read (read-only) the Lovable project; wrote LOVABLE_HUB_GAP_ANALYSIS.md; marked `site/` superseded. Searched web for Amazon listing: none found; Amazon blocked from sandbox. No Lovable edits made, no credits spent.

## 2026-10-08
- Reviewed Reader Guide chat; decision: ship hardened and OFF, enable in week 2 (docs/CHAT_ASSISTANT_REVIEW.md).
- Uploaded portrait + eXp logo to Lovable; sent the approved change request (forms, consent, address, unsubscribe, Amazon links, license, portrait, logo). Not published. Status of the Lovable build recorded below once finished.
- SECURITY: Phillip pasted a HighLevel private-integration token into chat. Claude did not write it to any file, commit, GHL setting, or Lovable message, and did not use it (the existing GHL connector already gives access). Because it now sits in the conversation transcript, **treat it as exposed: rotate it in HighLevel, then enter the new value yourself in Lovable's secret form.** `npm run check -- --history` secret scan re-run after this session.

## 2026-10-08 — Lovable forms build reviewed
- Lovable agent finished (commit 3ae534f, 6.8 credits). Reviewed code + diff: matches the change request; nothing published; protected pages untouched. Details and live test plan: docs/HUB_FORMS_TEST_PLAN.md.
- Open before enabling forms: real privacy policy, broker disclosures, new HighLevel token entered by Phillip in Lovable secrets, live sandbox test.

## 2026-10-09
- Chat hardening request sent and completed (Lovable commit 46d0c83): see CHAT_ASSISTANT_REVIEW.md. Chat remains OFF.
- GHL integration status written (GHL_INTEGRATION_STATUS.md). Verified read-only: no Surprise Advantage pipeline exists yet.

## 2026-10-09 — GHL "read-only" fix (requested by Phillip)
- Cause found read-only via API: Phillip's own GHL user (role admin) had `workflowsReadOnly: true` (also `campaignsReadOnly: true`, `adPublishingReadOnly: true`). Account-level permissions already allowed workflows/triggers. The user record had last been updated 2026-10-07.
- Change made (approved by Phillip: "Fix it"): `update-user` on his own user, `workflowsReadOnly` true → false, all other permissions resent unchanged. Verified by re-reading the user.
- Side effect: GHL now reports `campaignsEnabled: false` (it keeps it false while `campaignsReadOnly` is true; a second attempt to set it true did not stick). Legacy "Campaigns" was already read-only. To restore: GHL → Settings → My Staff → Phillip → Roles & Permissions → turn off "Campaigns Read Only", then re-enable Campaigns. "My Staff" is not visible in Phillip's white-labeled ("SKILLS") sidebar; the account provider may need to do this.
- No inbound webhook is needed for the current integration (the Hub calls the GHL API directly).
- Pending: Phillip to confirm Automation → Workflows → Create Workflow is now enabled after refresh.

## 2026-10-09 — GHL pipeline
- Phillip repurposed the empty "Buyer Leads (Purchase Phase)" template pipeline into "Surprise Advantage Readers" (7 stages) with step-by-step guidance; verified read-only via API. IDs in GHL_BUILD_STATUS.md.
