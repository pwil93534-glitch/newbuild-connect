# Deploy Runbook (nothing here has been executed)

The code is **deploy-ready**; the *launch* is gated on Phillip. Deploying publicly requires his explicit approval (`OWNER_APPROVALS.json` → `public_deploy_approved`), as does any spend.

## Recommended target (pending approval — Decision #8)
Vercel: static `site/` + serverless `api/*.mjs`, configured by `vercel.json` (CSP, HSTS, nosniff, clean URLs, `/q/:slug` QR redirects). Any host that can run Node 18+ functions works; `lib/core.mjs` is platform-neutral.

## Steps for Phillip (or Claude, once approved)
1. Supply the missing items (docs/OPEN_QUESTIONS.md) and replace every `PENDING-OWNER` block with approved text/assets.
2. Review pages; set each flag in `OWNER_APPROVALS.json` to `true` yourself.
3. Create a HighLevel private-integration token (contacts write). In HighLevel, build workflows that send marketing **only** to contacts tagged `consent-email` / `consent-sms` and **not** DND or `suppressed`. Interest tags (`buyer-interest`, etc.) must never trigger marketing by themselves.
4. In the host dashboard set env vars: `HIGHLEVEL_API_KEY`, `HIGHLEVEL_LOCATION_ID`, `FORM_ALLOWED_ORIGIN` (exact production origin), `FORM_RATE_LIMIT_PER_HOUR`, `SUPPRESSION_LIST_TAG`. Keep `FORM_ENABLED` unset/false.
5. Deploy to a **preview** URL. Set `FORM_ALLOWED_ORIGIN` to it and `FORM_ENABLED=true` on preview only.
6. Sandbox test with a contact you own: copy request, market update, unsubscribe. Confirm in HighLevel: tags `source:*` and `submitted:*` present; no `consent-*` tag unless ticked; unsubscribe sets DND + `suppressed`. **The HighLevel payload shape (contacts/upsert, `dnd`, tags) is written from API knowledge and unverified against a live account — this step is the verification.**
7. Remove `<meta name="robots" content="noindex">` from the pages, point the production domain, set production env vars, `FORM_ENABLED=true`.
8. Run `npm test && npm run check -- --history` — must pass (secret scan + readiness gate).
9. Post-launch: verify Kindle link, QR codes, downloads, forms on a phone.

## QR codes
Print `https://<domain>/q/reader`, `/q/listing`, `/q/buyer`, `/q/relocation`. Retarget by editing `qr-destinations.json` and redeploying — printed codes never change. QR images are **not generated yet** because the domain is not chosen.

## Rollback
Revert the deploy in the host dashboard, or set `FORM_ENABLED=false` to stop all submissions instantly.
