# The Surprise Advantage — Updated Book Launch Campaign (HighLevel)
Status: **DRAFT for Phillip's approval. Nothing has been built, sent, or changed in HighLevel.**
Goal: reader trust and usefulness. Business conversations follow from permission, not pressure.

## 1. What already exists in your GHL (read-only audit, 2026-10-07)
| Found | Implication |
|---|---|
| Tag `requested free book` and workflow `Book Funnel Moving Forward` (2025 template) | Legacy book funnel. **Audit before reuse** — consent basis for those contacts is unknown. Do not enroll them in new sends. |
| Workflow `Remove: Unsubscribed/Bounced/Complained` (published) + tag `complained - unsubscribed` | Reuse as the global suppression backstop. |
| Workflows `New Build Buyer Shield`, `NewBuild Connect Waitlist`, many seller/buyer drips | Separate programs. Add an exclusion so book readers are not double-messaged. |
| 0 email campaigns; templates are NewBuild Connect (`NBC Launch…`) | Nothing for the book yet — start clean with `SA -` prefixed assets. |
| 272 tags; no `consent-*`, `sa:*`, or `source:*` tags | New tags needed (section 3). |
| The HighLevel public API **cannot create workflows** | Workflows are built by hand in the GHL UI from section 4. Claude can create tags/templates via API **after your approval**. |

## 2. Audiences and permission model
| Segment | Enters via | May receive |
|---|---|---|
| Copy requester | site form, `complimentary-copy-request` | One-time fulfilment messages only |
| Email subscriber | `consent-email` ticked | Reader series, monthly briefing |
| Text subscriber | `consent-sms` ticked | Delivery text only |
| Market-update subscriber | `/market-update` form | Monthly briefing only |
| Interest (buyer/seller/relocation/investor) | optional boxes | **Nothing extra.** Only picks which resource link appears in emails they already agreed to. |
| Legacy/sphere | existing GHL contacts | **Decision for Phillip (D3 below)** |

**Global guard on every marketing workflow:** enter only if `consent-email` AND NOT DND (email) AND NOT `suppressed`. Texts: `consent-sms` AND NOT DND (SMS). Texts also need your A2P 10DLC registration confirmed in GHL — **unverified**.

## 3. Tags (created by the site's server function unless marked *manual*)
`book-reader` · `complimentary-copy-request` · `market-update-subscriber` · `unsubscribe-request` · `suppressed` · `consent-email` · `consent-sms` · `buyer-interest` · `seller-interest` · `relocation-interest` · `investor-interest` · `source:<src>` · `submitted:<YYYY-MM-DD>`
*Manual/workflow:* `sa:copy-shipped` · `sa:copy-delivered` · `sa:consult-requested` · `sa:consult-held` · `sa:feedback-received`
Source values: `qr-reader`, `qr-listing`, `qr-buyer`, `qr-relocation`, `direct`, plus `email`, `social-video`, `social-post` for links you post.

## 4. Workflows to build (prefix `SA -`)
**SA-01 Copy request intake.** Trigger: tag `complimentary-copy-request`. Steps: create opportunity in pipeline *Surprise Advantage Readers* (stage Requested) → task to Phillip "Ship copy to {{contact.first_name}}" → send **T1** (one-time confirmation; allowed by the fulfilment consent). Stops there.
**SA-02 Shipped.** Trigger: tag `sa:copy-shipped` (you add it manually). Move stage → Shipped → send **T2**; if `consent-sms`, send the one text in section 5. 
**SA-03 Delivery check (human, not automated marketing).** 7 days after Shipped: **task** for Phillip to decide on a personal note. If `consent-email`, enter SA-04.
**SA-04 Reader series (consent-email only).** Day 0 after delivered: **R1** → +7d **R2** (branches by interest tag; no interest tag = generic) → +21d **R3**. Exit on any reply, `suppressed`, or `sa:consult-requested`. Wait steps use business hours.
**SA-05 Monthly market briefing.** Trigger: you add contacts to a smart list from `consent-email` + `market-update-subscriber`; you send **M1** manually each month after the source check in the template. (Manual send by design — market content needs cited, dated verification.)
**SA-06 Conversation requested.** Trigger: calendar booking or tag `sa:consult-requested`. Steps: task for Phillip, stage → Conversation requested, remove from SA-04. No auto-pitch.
**SA-07 Suppression.** Trigger: tag `unsubscribe-request` or `suppressed`. Steps: set DND all channels, remove from all `SA -` workflows, confirm via existing `Remove: Unsubscribed…` workflow. Also add NOT `suppressed` to the legacy `Book Funnel` and drip workflows.

## 5. Text (only `consent-sms`, one message per request)
"Hi {{contact.first_name}}, it's Phillip Williams. Your copy of The Surprise Advantage has shipped. Reply STOP to opt out." (Review with broker; TCPA/CTIA wording is your counsel's call.)

## 6. Calendar (aligned to the 90-day plan)
| Window | Campaign activity |
|---|---|
| Now–Oct 11 | Build tags/pipeline/templates (after approval); sandbox-test the three forms with your own contact |
| Oct 12–18 | Launch only after approvals + verified Kindle URL. Send nothing until then. |
| Oct 19–Nov 30 | Weekly video + companion post (links carry `?src=`); reader series runs per contact; first monthly briefing Nov (after source check) |
| December | Dashboard + content-gap report from R3 replies |

## 7. Measurement (what GHL can and cannot show)
Books distributed = count of `sa:copy-shipped`/`sa:copy-delivered`. Email opt-ins = `consent-email`. Consultations = calendar + `sa:consult-held`. Acquisition channel = `source:*`. Reader feedback = `sa:feedback-received` + replies to R3. **Website visits and resource downloads are not in GHL** — the site has no analytics (deliberately); adding any needs your approval and a privacy-notice update.

## 8. Decisions for Phillip
- **D1.** Approve creating the `sa:` tags, pipeline and `SA -` templates in GHL (Claude can do tags/templates; you/VA build workflows).
- **D2.** Approve the email/text drafts after editing (`GHL_EMAIL_DRAFTS.md`). Every `[BRACKET]` is a value only you can supply.
- **D3.** Legacy and sphere contacts: (a) send nothing, (b) one launch announcement to contacts already marked subscribed and not DND, with unsubscribe + mailing address, after broker review, or (c) a short "do you want this?" permission email. Claude recommends (c) or (a).
- **D4.** Is A2P 10DLC registered for texts? If not, skip SMS.
- **D5.** Who ships copies and how many per person?
