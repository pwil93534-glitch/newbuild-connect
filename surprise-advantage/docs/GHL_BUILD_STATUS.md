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

## SA-03 Delivery check — built in GHL UI (2026-10-09), DRAFT / NOT PUBLISHED
- Trigger: Contact Tag added = `sa:copy-shipped` (same tag as SA-02)
- Action 1: Wait 7 days (time delay)
- Action 2: Add Task — "Check delivery for {{contact.name}}", due immediately at 9:00 AM, skip weekends ON, assigned to Phillip Williams. Description reminds Phillip to email only if `consent-email` is present and to add `sa:copy-delivered` once delivery is confirmed.
- No email is sent by this workflow (human follow-up by design).
- Hand-off to SA-04: handled by SA-04's own trigger (`sa:copy-delivered` + consent-email check), not by an action here.
- Status: Draft.

## SA-04 Reader series — built in GHL UI (2026-10-10), DRAFT / NOT PUBLISHED
- Trigger: Contact Tag added = `sa:copy-delivered` (the trigger filter UI cannot test a second tag, so consent is checked in the next step)
- Action 1: If/Else "Condition" — branch **Consented** = Tags includes `consent-email` AND Tags does not include `suppressed`; **None** branch left empty (no email without consent)
- Consented branch: Email R1 ("One way to use the book") → Wait 7 days → Email R2 ("A short checklist you can use") → Wait 21 days → Email R3 ("What questions did the book leave you with?")
- All three emails: template "SA DRAFT - R1/R2/R3", From = PLACEHOLDER (pwil93534@gmail.com), click tracking / UTM / auto-tagging OFF
- Status: Draft.

### SA-04 to-dos before publishing
1. R2 template holds one block per interest (buy/sell/relocate); plan calls for branching by interest tag. Currently a single R2 goes to everyone — trim to one block per contact or add interest branches.
2. Exit conditions from the plan not yet built: stop on reply, on `suppressed`, and on `sa:consult-requested`. Mid-sequence unsubscribes rely on DND plus SA-07; add a re-check (If/Else on `suppressed`) before R2 and R3, or a workflow goal/exit, and test it.
3. Same publish blockers as SA-01 (real sender domain, fill [BRACKETS], unsubscribe link + mailing address, Phillip approval and broker review, test with own email only).

## SA-06 Conversation requested — built in GHL UI (2026-10-10), DRAFT / NOT PUBLISHED
- Trigger: Contact Tag added = `sa:consult-requested`
- Actions: Add Task ("Reply to conversation request from {{contact.name}}", due immediately 9:00 AM, skip weekends, Phillip) → Remove from workflow SA-04 → Find opportunity (Surprise Advantage Readers, most recent) → [Found] Update opportunity (stage = Conversation Requested)
- NOT built: "Customer booked appointment" trigger. It fires on ANY calendar and would catch listing appointments. Add it later with a filter on the Reader Conversation calendar below.

## Reader Conversation calendar (created via API 2026-10-10) — DRAFT, no public link
- Calendar id `f11kOsBmbXyYpdP686lF`, name "Reader Conversation", slug `reader-conversation`, type personal, team member Phillip (`JxB5kGmJjBl3JewPmVD6`), 30 min, 30-min interval, 1 day notice, 60 days ahead, auto-confirm, `isActive=false`
- Availability: schedule `wJZWk5YxorTLijgbs0jf` Mon-Fri 09:00-17:00 America/Phoenix, associated ONLY with this calendar
- Domain Phillip supplied: bookastrategycallwithphillip.com (ownership/DNS not verified by Claude; nothing pointed at it yet)
- To do (Phillip, in GHL UI): connect Google Calendar to this calendar (sync + conflict check); set meeting location; review booking form
- To do (consent): GHL's default booking-form consent text is "I confirm that I want to receive content from this company using any contact information I provide." Replace/remove it — booking a conversation is NOT marketing consent. Default thank-you message also needs rewriting.
- To do: activate calendar only after approval; then forward the domain (GoDaddy forwarding) to the booking link; then add the booking trigger to SA-06 filtered to this calendar.

### Reader Conversation calendar — update (2026-10-10, verified via API read-back)
- Google Calendar already connected for Phillip: `pwil93534@gmail.com` (bookings added there; conflicts checked against that Gmail calendar only). OPEN: confirm the listing/showing appointments live on that account, else add the other account under Conflict calendars.
- Consent line replaced: "I agree to receive messages about this appointment, such as confirmation and reminders. This does not sign me up for marketing emails." Thank-you message replaced (auto-confirm wording). Slug `reader-conversation` confirmed. `isActive` still false.
- STILL OPEN: meeting location is blank (needs phone / Google Meet / Zoom); activation requires Phillip's approval; domain forward (bookastrategycallwithphillip.com -> booking link) not done; SA-06 booking trigger (filter on calendar `f11kOsBmbXyYpdP686lF`) not added; confirm booking never adds `consent-email`.

### Reader Conversation calendar — live test result (2026-10-10, Phillip approved activation for a test only)
- Locations now: Custom "Phone call. Phillip will call you at the number you provide when you book." (label "Phone call") + Google Meet. Verified by API read-back.
- Phone is REQUIRED on the booking form (Phillip tested without it).
- Two test bookings (Phillip's own addresses) landed as confirmed appointments on 2026-10-12 09:00 and 09:30 America/Phoenix; Google Meet link was generated; the phone booking shows the phone text. Contacts created with source "Reader Conversation" and NO tags (no `consent-email` added by booking) — confirmed.
- Calendar set back to inactive (`isActive=false`) after the test. Public booking page is off.
- Cleanup pending (needs Phillip's OK): the two test appointments (ids YipNezqcKlsGxlIGW2WR, QYxdtDJBqq7auBNUKOQq) and the two test contacts (g3HPZCp5UbAGJ1Nh61WK, JrcAOmzI9C73g4ghE7Mv).
- Not yet confirmed: whether the confirmation emails/notifications arrived and look right (Phillip to check his inboxes).
- Cleanup DONE (2026-10-10, Phillip approved): deleted test appointments YipNezqcKlsGxlIGW2WR and QYxdtDJBqq7auBNUKOQq and test contacts g3HPZCp5UbAGJ1Nh61WK and JrcAOmzI9C73g4ghE7Mv; calendar events list re-read and empty. Phillip's real contact record (Eusolk8gu7gxDWoo1Jzp) untouched.

## SA-07 Suppression / Unsubscribe — built in GHL UI (2026-10-10), DRAFT / NOT PUBLISHED
- Triggers (two, because the tag filter takes one tag per trigger): Contact Tag added = `suppressed`; Contact Tag added = `unsubscribe-request`
- Actions: Enable/disable DND (enable, all channels; outbound only — inbound replies still arrive) → Remove from Workflow (SA-04 at minimum; Phillip to confirm whether SA-01/02/03/06 were also selected)
- Intentionally does NOT add the `suppressed` tag from the `unsubscribe-request` path (would re-fire the other trigger).
- Status: Draft. Phillip confirmed canvas order and Draft state from a screenshot; the DND channel list and removal targets were set by Phillip and not independently read back by Claude.
- Legacy workflows (read-only listing 2026-10-10: ~70 workflows, ~55 published, mostly stock real-estate drip templates): GHL will not send email/SMS to a contact with DND on from ANY workflow, so SA-07's DND step (and the Hub unsubscribe form, which sets DND directly) is the cross-workflow backstop. No bulk edit of legacy workflows is planned.
- STILL OPEN: review the three legacy workflows aimed at the same audience — "Book Funnel Moving Forward", "NewBuild Connect Waitlist", "New Build Buyer Shield" — and add a tag exclusion (`suppressed`, `unsubscribe-request`) if they send marketing. Also Phillip's decision D3 (whether legacy contacts are ever marketed to) remains pending. Publish SA-07 before SA-04.

## SMS numbers — read-only check (2026-10-10)
- Both numbers Phillip named exist on the GHL location (Twilio origin; SMS, MMS and voice capable): +16232923737 "Phillip's number" (default, linked to Phillip, forwards calls to Phillip's mobile) and +14808410728 "Phillip's number 2" (inbound calls go to a Voice AI agent).
- NOT verifiable via API: A2P 10DLC brand/campaign registration status (no endpoint exposed). Phillip states both are registered; confirm "approved" in GHL Trust Center before any text is sent.
- The consent-sms text in SA-02 is still not built. Decide which number sends it; the Voice AI number should not be the sender of replies-expected texts unless intended.

## Email sending domain (2026-10-10)
- Existing GHL dedicated domain `phillip.phillipwilliamsrealestategroup.com` (added 2026-05-01, shared IP, SSL issued, warm-up stage 1 = 1,000 emails/day limit). Subdomain only; root domain and existing email untouched.
- Domain Configuration screen (read by Phillip): SPF (TXT), DKIM (k1._domainkey.phillip), tracking CNAME (email.phillip -> mailgun.org), MX x2 (mxa/mxb.mailgun.org), DMARC (`v=DMARC1;p=none;`) — all show Verified.
- Dedicated header ("Set Headers"): intended From name "Phillip Williams", From email `phillip@phillip.phillipwilliamsrealestategroup.com` — Phillip to confirm it saved.
- Follow-ups: tighten DMARC to `p=quarantine` after clean warm-up; send ONE test email to Phillip's own inbox from the new sender; confirm replies reach GHL Conversations; then replace the Gmail placeholder From in SA-01, SA-02 and SA-04 emails with the new sender. Privacy-policy URLs Phillip supplied are unreadable from this sandbox (network policy) — text must be pasted for review.
