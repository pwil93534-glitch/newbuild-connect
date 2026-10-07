# GHL Build Status (2026-10-07) — approved by Phillip, executed by Claude via the HighLevel API

## Created in GHL (location s457BGtmM6BeOMTvQQEj) — each call returned HTTP 201
**Tags (21):** book-reader · complimentary-copy-request · market-update-subscriber · unsubscribe-request · suppressed · consent-email · consent-sms · buyer-interest · seller-interest · relocation-interest · investor-interest · sa:copy-shipped · sa:copy-delivered · sa:consult-requested · sa:consult-held · sa:feedback-received · source:qr-reader · source:qr-listing · source:qr-buyer · source:qr-relocation · source:direct
(`source:<other>` and `submitted:<date>` tags are created automatically by the site's server function when a form arrives.)

**Template folder:** `Surprise Advantage (DRAFTS)` — id 6ac6cac29ed784b5df1107c7
**Plain-text templates (all named `SA DRAFT - …`, no sender email set, not attached to any workflow, contain `[BRACKETS]` and an "ADD UNSUBSCRIBE + ADDRESS" line):**
T1 Copy request confirmation · T2 Copy shipped · R1 Reader day 0 · R2 Reader day 7 checklist · R3 Reader day 21 questions · M1 Monthly market briefing

## NOT created (API has no operation for it — build in the GHL screens)
**Pipeline "Surprise Advantage Readers"** (Opportunities → Pipelines → Create). Stages in order:
1. Requested copy  2. Copy shipped  3. Copy delivered  4. Engaged (replied/clicked)  5. Conversation requested  6. Conversation held  7. Long-term (no action)
Keep "Lost" out; use stage 7 so no one is marked as a failure. The existing "RE Snapshot" pipelines are untouched.
**Workflows SA-01…SA-07:** UI only (see GHL_CAMPAIGN_PLAN.md §4).

## Nothing was sent, enrolled, or changed on any contact. No existing workflow, tag, template, or pipeline was modified.

## Before any template is used
Set a verified sender, add GHL's unsubscribe link + your mailing address, replace every `[BRACKET]`, get your approval and broker review, then remove "DRAFT" from the name.
