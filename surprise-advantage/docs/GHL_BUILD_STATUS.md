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

## Update 2026-10-09 — pipeline created (by Phillip in the GHL screens, verified by Claude via API)
GHL has no "Create pipeline" button for this account (white-label), so an unused, empty template pipeline ("RE Snapshot: Buyer Leads (Purchase Phase)", 0 opportunities) was **repurposed**: renamed and its stages replaced.
- Pipeline: **Surprise Advantage Readers**, id `MjtJwvdKvzWu3F6xKOUn`
- Stages (position → id): 0 Requested copy `6f62afc0-a774-44a5-8c76-8f2a07a5ec6e` · 1 Copy Shipped `a8affa44-60f4-4e36-a103-f5a51246f7bc` · 2 Copy Delivered `ab696a8c-2e80-4646-94ef-a6bbb5865f8a` · 3 Engaged `907c8d35-8c5a-4b40-a249-77e8167336c8` · 4 Conversation Requested `6e060425-67d8-4a04-8f7d-1c029d4732ee` · 5 Conversation Held `35a44e53-c938-46a9-b596-e4de18e2ef56` · 6 Long-Term `3bd0af29-21e0-4ec2-b079-0fea5f0f4a6b`
- To undo: rename back and restore stages Purchase & Sale, Loan Application, In Underwriting, Title & Deed Review, Loan Approval, CLEAR TO CLOSE.
- Next: workflows SA-01…07 (GHL screens); then a small Lovable change so copy requests create an opportunity in stage "Requested copy" (needs the ids above; uses credits; needs Phillip's OK).

## SA-01 Copy request intake — built in GHL UI (2026-10-09), DRAFT / NOT PUBLISHED
- Trigger: Contact Tag added = `complimentary-copy-request`
- Action 1: Create Opportunity — pipeline "Surprise Advantage Readers", stage "Requested copy", name `{{contact.name}} - Book copy request`, duplicates disabled
- Action 2: Add Task — "Ship book to {{contact.name}}", due in 2 days at 9:00 AM (America/Phoenix), skip weekends ON, assigned to Phillip Williams
- Action 3: Send Email — template "SA DRAFT - T1" (subject: "We received your request for The Surprise Advantage"); From is a PLACEHOLDER (pwil93534@gmail.com)
- Status: Draft. Must NOT be published until the items below are done.

### Blockers before SA-01 can be published
1. Replace the placeholder From with an address on a domain Phillip owns, authenticated in GHL (SPF/DKIM/DMARC). Gmail as sender risks DMARC rejection/spam.
2. Fill all [BRACKETS] in T1; add unsubscribe link and physical mailing address.
3. Confirm T1 is a transactional confirmation (no marketing content) or require `consent-email` tag.
4. Phillip approval (and broker review of eXp/Arizona wording).
5. Test with Phillip's own email only.

## SA-02 Shipped — built in GHL UI (2026-10-09), DRAFT / NOT PUBLISHED
- Trigger: Contact Tag added = `sa:copy-shipped` (Phillip adds this tag by hand after mailing the book)
- Action 1: Find opportunity — most recently created, Pipeline is "Surprise Advantage Readers"
- Action 2 (Opportunity Found branch): Update opportunity — Pipeline = Surprise Advantage Readers, Stage = Copy Shipped
- Action 3: Send Email — template "SA DRAFT - T2" (subject: "Your copy of The Surprise Advantage is on its way"); From is a PLACEHOLDER (pwil93534@gmail.com); click tracking, UTM and auto-tagging OFF
- Not built yet: consent-sms text (plan section 5) — needs A2P 10DLC decision and broker review
- Note: a tag-triggered workflow has no opportunity in context, so Update opportunity needs a preceding Find opportunity (otherwise it does nothing)
- Status: Draft. Same publish blockers as SA-01 (real sender domain, fill [BRACKETS], unsubscribe/address, Phillip approval, test with own email).
