# Surprise Strategy Hub (Lovable) — Audit and Plan
Project: "Surprise Strategy Hub", Lovable project 90a4e264-5cd2-4d46-997a-e200b29ee03c (workspace "Phillip's Lovable"), TanStack Start + Supabase, created 2026-09-21, last edited 2026-09-23, **not published**. Audited read-only on 2026-10-07 (read source files; did not open `.env`; changed nothing).

## Decision
**The Hub is the website.** The static site in `site/` duplicated it, which the project rules forbid, so `site/` is **superseded** (kept for reference, not to be deployed). What carries over: the server-side consent/CRM logic in `lib/` + its 13 tests, the HighLevel tag scheme (already created in GHL), the reader resources' structure, and the QA/launch gate.

## What the Hub already has (verified in code)
Home, /book (cover image, "Volume I · Foundation Edition", subtitle "The Insider's Guide to Buying, Selling, and Investing in Surprise, Arizona"), buyers/sellers/relocation/investors, strategy pages, /reader with 5 PDFs (seller, buyer, relocation, new-construction questions, investor), /market-brief, /insights, /about, /contact, /complimentary-copy, privacy/terms/accessibility, metadata per page, a browser-saved book Q&A chat. Voice and positioning match the campaign brief ("Read the book. Understand the market. Make your move strategically.").

## Gaps against the non-negotiable rules (all verified in `site.tsx`, `$page.tsx`, `book.tsx`)
| # | Gap | Rule | Fix |
|---|---|---|---|
| 1 | **Forms don't submit anywhere.** `SimpleForm` just flips to "Request noted… does not send submissions yet." | 2, 10 | Wire to server routes (see Lovable prompt) → HighLevel; secrets only server-side |
| 2 | **No consent checkboxes** on any form; no source/UTM capture; no honeypot | 10 | Add unticked fulfilment / email / SMS boxes; capture `?src=` |
| 3 | Complimentary-copy form has **no mailing address** (can't ship a book) | — | Add address field |
| 4 | Amazon button points to `/contact?interest=amazon`; text says link "will be activated when provided" | 1, 3 | Needs 2 owner-verified URLs (Kindle, paperback) |
| 5 | Privacy page is a placeholder sentence; no eXp/Arizona disclosures or license number in footer (only "Equal Housing Opportunity") | 8 | Owner/broker text |
| 6 | /market-brief and /insights show placeholder cards ("Awaiting the first verified monthly update", "will be published here") | 6, "no placeholder content on public pages" | Hide from nav and noindex until real, sourced, as-of-dated content exists |
| 7 | Author portrait and contact details missing (Hub's own roadmap lists this as blocked) | 1 | Owner supplies |
| 8 | Cover image alt text is just "The Surprise Advantage book" | 7 | Descriptive alt; confirm this is the approved navy-and-gold cover |
| 9 | No /unsubscribe page | 10 | Add (calls the unsubscribe server route) |
| 10 | Book Q&A chat uses an AI gateway route (`src/routes/api/chat.ts`) — **not reviewed** | 3 (spend), 1 | Review cost limits, abuse protection, disclaimer; owner decides whether it ships at launch |
| 11 | PDFs in `public/downloads` — **content not reviewed** by me | 1, 6 | Owner reviews for claims before launch |
| 12 | No analytics (dashboard needs visits/downloads) | Phase 5 | Owner decision; privacy notice must match |

## Status update 2026-10-08
Gaps 1, 2, 3, 4, 7 (portrait only), 8, 9 were addressed by the approved change request (commit 3ae534f) — see HUB_FORMS_TEST_PLAN.md. Still open: 5 (privacy + disclosures), 6, 7 (contact details), 10, 11, 12.

## Original change request (SENT 2026-10-08, approved by Phillip)
Sending it edits the live project and consumes Lovable credits, so it waits for Phillip's OK.
> "Wire the three forms (contact, complimentary copy, market-brief signup) to server routes under src/routes/api/ that forward to HighLevel contacts/upsert using HIGHLEVEL_API_KEY and HIGHLEVEL_LOCATION_ID stored as server-only secrets. Add: unticked consent checkboxes (required: fulfilment on the copy form; optional: email, SMS); a mailing-address field on the copy form; a hidden honeypot field; capture ?src= and submission date; server returns 503 unless FORM_ENABLED=true and the request Origin matches FORM_ALLOWED_ORIGIN. Tag contacts exactly: book-reader, complimentary-copy-request, market-update-subscriber, buyer-interest/seller-interest/relocation-interest/investor-interest, consent-email, consent-sms, source:<src>, submitted:<YYYY-MM-DD>. Interest selections must never imply marketing consent. Add /unsubscribe that sets DND and tags unsubscribe-request + suppressed. Do not publish."
The reference implementation and tests are `surprise-advantage/lib/core.mjs` and `test/core.test.mjs`.

## Launch gate (unchanged intent)
Publish only when: forms verified end-to-end with a sandbox contact; Amazon URLs verified; disclosures + privacy approved; placeholder pages hidden; PDFs and chat approved; owner approval flags set. Publishing the Lovable site is Phillip's action or needs his explicit go-ahead.
