# Risk & Approval Register
## Approvals required before action (none granted yet)
| Action | Approved? |
|---|---|
| Spend money (domain, hosting, ads, tools) | No |
| Deploy publicly | No |
| Send any email/SMS | No |
| Submit any form as a real person / create real CRM contacts | No |
| Publish any content | No |
| Use eXp / personal photo / logo assets publicly | No |

## Approval flags live in `OWNER_APPROVALS.json` (all false).

## Risks
| Risk | Impact | Mitigation |
|---|---|---|
| Phase 0 confirmations late; Phase 1 target (Oct 4) can't be fully met | schedule | Gated draft built; list of 14 items sent |
| Amazon review delays | launch date | Honest "coming soon" status; no dependency assumed |
| Missing/incorrect legal disclosures | compliance | Broker review; launch gate script |
| Consent misuse (interest treated as marketing opt-in) | legal (CAN-SPAM/TCPA) | Separate unticked consent checkboxes per channel; documented in DECISION_LOG |
| Credential leakage | security | Server-side only; `.env` ignored; secret scan before each push |
| Fabricated claims/statistics | trust | Rule 1; no statistics on site; Phase 4 requires cited, dated sources |
| Confusion with NewBuild Connect app/domain | brand | Separate folder and domain decision |
