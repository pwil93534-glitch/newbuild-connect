# Delivery Roadmap
Today is 2026-10-04 (campaign day 9). Dates are the owner's targets; status is honest.

| Phase | Target | Status |
|---|---|---|
| 0 Discovery & setup | Sep 26–28 | **Docs done; 14 confirmations outstanding** (OPEN_QUESTIONS.md). Behind target. |
| 1 MVP website | Sep 29–Oct 4 | **Built locally as gated draft. Not complete** — see ACCEPTANCE_CRITERIA.md (cover, photo, bio, disclosures, Amazon status missing). |
| 2 Reader portal & CRM | Oct 5–11 | **Code built and unit-tested; unverified against live HighLevel.** Resources are drafts awaiting content approval. |
| 3 Public launch | Oct 12–18 | Blocked on QA, owner approval, verified Amazon URLs, deploy approval. |
| 4 Educational campaign | Oct 19–Nov 30 | Not started. Drafts only; market claims need cited sources. |
| 5 Analysis & Expanded Edition | December | Not started. |

Amazon track runs in parallel: `OWNER_ACTIONS_AMAZON.md`. External review times are not controllable; the launch must not assume them.

**Schedule risk:** the Phase 3 date (Oct 12–18) depends on a live, owner-verified Kindle URL. If that slips, the site can launch with an honest "coming soon" status rather than slip trust.

## Catch-up plan (set 2026-10-07 — campaign day 12)
| By | What | Owner | Depends on |
|---|---|---|---|
| Oct 8 | Answer the 5 blocking questions below; supply manuscript + cover + bio | Phillip | — |
| Oct 8 | Vercel preview from dashboard (docs/DEPLOY.md) | Phillip | — |
| Oct 9 | Sandbox test of 3 forms against HighLevel; fill real copy into the site; Claude runs QA on the preview | Claude | token + preview URL + assets |
| Oct 10 | Phillip reviews copy, resources, privacy; flips approval flags he agrees with | Phillip | — |
| Oct 11 | Accessibility pass; fix list; Phase 2 acceptance checked with evidence | Claude | — |
| Oct 12–14 | Disclosures from broker; domain connected; QR images generated | Phillip + Claude | domain, disclosures |
| Oct 15–18 | Phase 3 launch **only if** Kindle URL verified live and every `OWNER_APPROVALS.json` flag is true; otherwise launch with honest "coming soon" Kindle status or move the date | Phillip | Amazon review |

**Five blocking questions:** (1) Is the 7.8k-word draft the Foundation Edition, or is the expanded book what ships? (2) Domain? (3) Where are the manuscript, cover and bio? (4) Will you create the HighLevel token? (5) Is the Kindle submission already in, and when?
