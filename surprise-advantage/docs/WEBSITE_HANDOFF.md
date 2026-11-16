# Website Work — Handoff for a New Session (2026-11-16)

Read first: `DECISION_LOG.md` (rows 20–29) and `GHL_BUILD_STATUS.md` (latest entries).
Branch: `surprise-advantage-launch`. Standing rules in the decision log still apply (no invented testimonials/stats/URLs; no secrets in code or chat; Phillip approves any publish, spend, or outgoing communication; market data needs source + as-of date; eXp rules below).

## The three sites (decision 29)
| Domain | What it is | Platform | Status |
|---|---|---|---|
| phillipwilliamsrealestatestrategist.com | Main brand site ("Strategy Engine") | Lovable project 092d1bc5 | Published 2026-11-12 (decision 24) |
| phillipwilliamsrealestate.com | Book site, The Surprise Advantage | Lovable project 90a4e264-5cd2-4d46-997a-e200b29ee03c | Published; book-request form LIVE (decision 28) |
| phillipknowsaz.com | eXp BoldTrail site with MLS home search | BoldTrail (eXp-provided) | Keep; do not rebuild |

DNS (checked 2026-11-14/16): both Lovable domains A → 185.158.133.1; strategist apex MX → Mailgun (HighLevel email; do not touch MX/SPF/DKIM).

## Goal for the website session
Make phillipwilliamsrealestatestrategist.com the strongest version of Phillip's main site and connect the three sites:
1. Add a clear "Search Homes" link/button to phillipknowsaz.com on both Lovable sites (header or nav + footer).
2. Add a "Get the Book" link from the strategist site to phillipwilliamsrealestate.com, and back.
3. Give Phillip steps to add a link on his BoldTrail site back to the strategist/book site (BoldTrail admin is his to change).
4. Review the strategist site content with Phillip (pages, buyer types: Veterans, First-Time, 55+, Relocation; Seller Equity Review booking).

## Do not break
- Book form: `src/lib/forms.server.ts` gating (FORM_ENABLED, HIGHLEVEL_API_KEY, HIGHLEVEL_LOCATION_ID, FORM_ALLOWED_ORIGIN = https://phillipwilliamsrealestate.com, exact match). saveLead never overwrites an existing contact. Lovable secrets can only be deleted and re-added.
- HighLevel workflows SA-01 (copy request), SA-02 (shipped), SA-07 (unsubscribe/DND) are Published and tested end to end.
- HighLevel calendar FK7blmfUiTpHLw0sXeyy (booking) — Mon–Fri 8–5 hours; an API update once wiped them.

## Compliance (eXp, decision 20 + Nicole Battin ruling)
- Never "Real Estate Group". Use "Phillip Williams", "Real Estate Strategist", brokered by eXp Realty. Brand casing "eXp".
- Current eXp logo only, at least as large as Phillip's personal mark. AZ license SA657637000; brokerage LC634213000.
- No lender/title/warranty/insurance/appraiser/inspector ads without RESPA review.

## Publishing
Preview first, show Phillip, publish only on his explicit "publish". The live domains are blocked from this sandbox's proxy, so confirm live changes with Phillip.

## Campaign context (not website work)
S1 opt-in batches 1 (46 sent 11/12, cutoff 11/26) and 2 (50 sent 11/16, cutoff 11/30) are tracked in the original session; replies arrive in HighLevel Conversations + Gmail forward.
