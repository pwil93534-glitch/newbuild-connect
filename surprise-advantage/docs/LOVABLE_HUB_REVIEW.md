# Review: Lovable "Surprise Strategy Hub" (project 90a4e264…, unpublished)
Reviewed read-only on 2026-10-15: components/site.tsx (forms + footer), components/reader-guide.tsx, lib/forms.server.ts, lib/reader-chat.server.ts, api/chat, api/request-copy, api/unsubscribe, roadmap.md.
NOT reviewed: api/contact, api/market-update, page copy, privacy/terms/accessibility/fair-housing pages, .env (read was blocked; no secrets seen).

## Forms — mostly sound
- Same model as docs: gated by FORM_ENABLED, exact-origin check, honeypot, tags source:/submitted:, consent-email / consent-sms only when ticked, unsubscribe = dnd:true + suppression tag.
- Copy form: shipping consent required; email and text boxes optional and unticked. Contact form: SMS box appears only after a phone number is typed; "inquiry is not consent to marketing" note present.
- Gaps: (1) rate limit is an in-memory Map, so it resets per server instance and is weak on serverless; (2) no record of which consent wording/version was shown; (3) SMS checkbox lacks full A2P wording (sender, frequency) — texts stay off anyway; (4) HighLevel upsert payload (dnd, tags) still unverified against the live account; (5) unsubscribe is unauthenticated (acceptable, low harm).

## Chat (Reader Guide) — good guardrails, one blocking gap
- Good: disabled unless CHAT_ENABLED=true; fails closed; origin check; 800-char cap; only last 4 user messages sent; no market figures; fair-housing rules; refuses personal info; history saved only in the visitor's browser; server stores only salted-hash IP usage counters.
- BLOCKING: nowhere does the UI say the guide is AI. eXp requires AI-chat disclosure wording (confirm exact text with az.adreview / C.A.R.L.O.).
- Privacy policy must add: questions are processed by a third-party AI model via Lovable's AI gateway; salted-hash IP counters kept for rate limits; transcript stays in browser storage.
- "Approved source material" in the system prompt was summarized from the book; Phillip should confirm it matches the book before launch.
- No Privacy link near the chat; no "talk to Phillip" button.

## Footer — close
- Has: license SA657637000 (linked to azre.gov), brokerage "eXp Realty, LLC" LC634213000, designated broker line, Fair Housing link, © line, Privacy/Unsubscribe/Terms/Accessibility.
- Missing vs decisions: "REALTOR®" after Phillip's name; visible Equal Housing logo (text only). Phillip to confirm brokerage/designated-broker license numbers are exactly as eXp lists them.
- Team name line "Phillip Williams Real Estate Group | Brokered by eXp Realty" relies on the broker-approved name.
- Confirm /privacy, /terms, /accessibility, /unsubscribe exist and match the reconciled privacy/terms drafts.
