# Decision Log
| # | Date | Decision | Reason |
|---|---|---|---|
| 1 | 2026-10-04 | Separate `surprise-advantage/` folder inside this repo | Rule: don't overwrite/duplicate an active project; app is live. Owner may prefer a new repo — easy to move. |
| 2 | 2026-10-04 | Static HTML/CSS/vanilla JS, zero runtime deps | Fast, accessible, no supply-chain risk; hosting-agnostic |
| 3 | 2026-10-04 | CRM calls only from a future serverless function | Rule 2 |
| 4 | 2026-10-04 | Complimentary-copy form disabled until an endpoint is configured | Rule 3: no submissions on behalf of people before approval |
| 5 | 2026-10-04 | Separate, unticked consent boxes: copy fulfilment (required) vs. email updates (optional) vs. text (optional) | Rule 10 |
| 6 | 2026-10-04 | No cover image, photo, bio, price, ISBN, stats or testimonials on pages | Rule 1; assets not supplied |
| 7 | 2026-10-04 | Site copy says "Foundation Edition" only as an edition name, no "incomplete"/"first draft" language | Rule 9 |
| 4a | 2026-10-05 | Supersedes #4: form is live-in-code but server returns 503 until `FORM_ENABLED=true` + CRM credentials exist | Same safety, testable end to end |
| 8 | 2026-10-05 | Recommend Vercel (static + functions); core is host-neutral | Matches available tooling; **needs owner approval, none deployed** |
| 9 | 2026-10-05 | Approvals tracked in `OWNER_APPROVALS.json`; Claude never flips them | Rule 3 made machine-checkable |
| 10 | 2026-10-05 | Marketing eligibility = explicit `consent-*` tags only; interests are segmentation; unsubscribe sets DND + suppression tag | Rule 10 |
| 11 | 2026-10-05 | Upsert does not touch DND on non-consent | Avoids silently suppressing someone who opted in earlier |
| 12 | 2026-10-05 | Resources are printable HTML (print/save-as-PDF), generic process checklists, no statistics | Rule 1/6; PDFs can follow after content approval |
| 13 | 2026-10-07 | GHL campaign designed as drafts only; legacy contacts excluded until Phillip decides (D3) | Rule 3 and 10; legacy consent basis unknown |
| 14 | 2026-10-07 | Monthly briefing sent manually, not automated | Rule 6: market content needs verified sources and dates |
