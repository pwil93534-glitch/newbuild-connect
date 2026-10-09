# HighLevel integration — status (2026-10-09)
| Piece | State |
|---|---|
| Hub forms → HighLevel `contacts/upsert` (server-side, consent-aware, tags, notes, unsubscribe→DND) | **Built and reviewed.** Switched off (`FORM_ENABLED` unset). Not yet run against live HighLevel. |
| 21 tags, template folder, 6 DRAFT templates in GHL | **Created** (2026-10-07) |
| Secrets in Lovable (`HIGHLEVEL_API_KEY`, `HIGHLEVEL_LOCATION_ID`, `FORM_ALLOWED_ORIGIN`, `FORM_ENABLED`) | **Not set** — Phillip enters them. Rotate the token pasted in chat first. |
| Live sandbox test with Phillip's own email | **Not done** — plan in HUB_FORMS_TEST_PLAN.md |
| Pipeline "Surprise Advantage Readers" | **Does not exist** (verified: only the three "RE Snapshot" pipelines). API cannot create pipelines — build in GHL screens. |
| Opportunities created from forms | **Not built.** Needs the new pipeline's id + stage id. Small follow-up Lovable change once the pipeline exists. |
| Workflows SA-01…SA-07 | **Not built** (API cannot create workflows). Build sheet: GHL_CAMPAIGN_PLAN.md §4 |
| Calendar/booking link for R3 | **Missing** — Phillip supplies |
| Sender identity, unsubscribe link + mailing address in templates, A2P 10DLC | **Missing** — Phillip/GHL settings |
