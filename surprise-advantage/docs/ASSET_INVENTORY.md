# Asset Inventory
| Asset | Status | Source / note |
|---|---|---|
| Navy-and-gold cover | **MISSING** | Request from owner. Site uses no cover image until supplied. |
| Author photography | **MISSING for this site** | `assets/agent-photo.png` exists in the app; owner must confirm approved for use. |
| Foundation Edition manuscript | **MISSING** | |
| Book metadata / ISBN | **MISSING** | Not invented. |
| Amazon Kindle URL | **MISSING / unverified** | |
| Amazon paperback URL / status | **MISSING / unverified** | |
| Author bio, book description | **MISSING** | |
| PW Real Estate Group logo | Present (`assets/phillip-williams-logo.png`) | Approval for this site to be confirmed |
| eXp "brokered by" logo | Present (`assets/brokered-by-exp-logo.png`) | eXp brand rules to be confirmed |
| Palette | Known from app design system: navy `#003366`, gold `#C8960C` | Owner to confirm exact cover palette |
| Phone / email | Present in app (`src/constants/agent.ts`) | Confirm for this site |
| Disclosures / license # | **MISSING** | Broker/compliance to supply |

## Search of connected storage (2026-10-07, read-only, metadata + snippets only)
- Google Drive: found `TRANSFORMATION_PLAN.md` (Google Doc, created 2026-06-20) — a plan to expand "The Surprise Advantage" from ~7,810 words to 28,000–30,000 words across 17 chapters. **No manuscript, cover, KDP/KPF file, author bio or website master prompt found.**
- Dropbox: only unrelated Knolly listing-toolkit PDFs/docs matched "Surprise Advantage".
- Searches were keyword-based; files with other names or in other places (Gmail attachments, local disk, a design tool) were not checked.
- **Open question raised:** the plan describes a ~7.8k-word current draft heading to ~28k words. Is that draft the "Foundation Edition", or is the expanded book the one being published now? Rule 9 (don't imply the Foundation Edition is incomplete) depends on the answer.

## Update 2026-10-07 (from Phillip + Lovable audit)
- Phillip states the book is live on Amazon (Kindle and paperback). **URLs not yet supplied**; my web search found no listing and this environment cannot reach Amazon. Rule 1: no URL is used until Phillip pastes it and confirms it is the live product page.
- Lovable Hub contains: cover image (`src/assets/surprise-advantage-book.jpg` — approval to be confirmed), 5 PDF resources, book title/subtitle/"Volume I · Foundation Edition" wording. **Answers earlier question: Foundation Edition = Volume I.**
- Still missing in the Hub: author portrait, contact details, disclosures/license, Amazon URLs.

## Update 2026-10-08 (supplied by Phillip in chat)
- **Amazon Kindle:** https://www.amazon.com/Surprise-Advantage-Insiders-Selling-Investing-ebook/dp/B0GZX9H323 — supplied by owner as live. Not independently checked (Amazon is blocked from this environment).
- **Amazon paperback:** https://www.amazon.com/dp/B0HL875GDP — supplied by owner as live. Not independently checked. Phillip: please open both and confirm they are the correct product pages, then set `amazon_kindle_url_verified` in `OWNER_APPROVALS.json` yourself.
- **Arizona license:** SA657637000 (as given; confirm the exact required wording with your broker).
- **Author portrait** (navy blazer/black turtleneck) and **eXp Realty logo** supplied; uploaded to the Lovable project. eXp brand-use rules still to be confirmed with the brokerage.
- **Cover:** Phillip confirms the cover image in the Hub is the real cover. Lovable history shows he replaced it with the full KDP wrap on 2026-10-07.
- **Credentials:** a HighLevel token was pasted into chat. It was **not** stored anywhere by Claude. See SECURITY note in IMPLEMENTATION_LOG.
