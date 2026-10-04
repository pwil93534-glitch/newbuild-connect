# Acceptance Criteria
"Done" means every box is checked with evidence — not that a file exists.

## Phase 1
- [ ] Homepage, book, about, complimentary-copy, privacy pages exist and are linked from header/footer — *built; link check run, see IMPLEMENTATION_LOG*
- [ ] Book is the hero; services secondary
- [ ] Real approved cover shown with accurate alt text — **blocked (no cover)**
- [ ] Real author photo with alt text — **blocked**
- [ ] Approved bio + book description — **blocked**
- [ ] Kindle link live and owner-verified — **blocked**; until then page states status honestly
- [ ] Paperback status accurate — **blocked** (unknown)
- [ ] eXp/ADRE disclosures approved and present — **blocked**
- [ ] Privacy notice reviewed by owner/counsel — draft only
- [ ] Mobile/tablet/desktop checked (evidence: screenshots)
- [ ] Keyboard-only and screen-reader pass; contrast AA
- [ ] `check-launch-readiness.mjs` exits 0
- [ ] Owner written approval of copy

## Phase 2
- [x] Forms validate, show errors, capture explicit unticked consent, source, timestamp — *unit + browser tested (mock API)*
- [ ] Server-side HighLevel call verified against a live sandbox contact — *code + secret scan clean; live verification pending credentials*
- [ ] Interest ≠ marketing consent (tested in code); suppression honored; unsubscribe works — *live confirmation pending*
- [ ] All 5 resources downloadable and content-approved

## Phase 3 gate
All of: Phase 1+2 boxes, forms tested end-to-end in a sandbox contact, CRM attribution verified, Amazon URLs verified, owner approves deploy.
