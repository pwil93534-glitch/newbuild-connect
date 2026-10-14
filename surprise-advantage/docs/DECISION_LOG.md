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
| 15 | 2026-10-07 | Website = existing Lovable "Surprise Strategy Hub"; `site/` superseded; `lib/`, tests, GHL tags carry over | Rule: do not duplicate an existing website. Phillip confirmed the book is on Amazon and the Hub exists. |

## 2026-10-14: Phillip reports broker/eXp approval (not yet documented)
Phillip told Claude he has been approved on everything, including the business name "Phillip Williams Real Estate Group", by his broker. Claude has NOT seen the written approval. Action: Phillip to paste or forward the written approval so it can be filed with the launch records (the P&P requires written State Broker approval of a team/business name). Until then: nothing is published, activated or sent; the eight OWNER_APPROVALS.json flags remain Phillip's alone to set; each go-live step (privacy policy, Hub publish, booking domain forward, calendar activation, workflow publish, any send) still needs his explicit go at the moment of action.

## 2026-10-14: Phillip's decision on privacy/terms approval
Phillip's position: the privacy policy and terms (including the SMS terms) are based on policies provided during GHL A2P registration, which he says were approved, and that privacy/terms are federal matters (TCPA, CTIA) not needing fresh eXp approval; he will notify eXp but not wait. His site, emails, signature and business name were cleared in C.A.R.L.O. and approved by his broker (written copy not yet filed). Claude's note for the record: eXp's P&P says custom-created website content goes through eXp review before publication, so the cover note is framed as notice (FYI), not a request. Privacy/terms also involve state law and the book site's own data practices, so counsel review remains advisable. Indemnification clause: left OFF the book-site terms for now; a narrow version is available if Phillip wants it. Open: published phone number, effective date, retention period, hosting provider, copy-offer policy.
