# Hub forms — review result and live test plan
Lovable commit 3ae534f (message edt-a79557a9, 6.8 credits). Reviewed by reading the code and the diff on 2026-10-08. **Project is still unpublished (`is_published: false`).**

## Review against the change request
| Requirement | Result |
|---|---|
| 503 until `FORM_ENABLED=true` + key + location + origin set | ✅ `guard()` in `src/lib/forms.server.ts` |
| Origin check, POST only, per-IP rate limit, honeypot (silent success, stores nothing) | ✅ |
| Secrets server-only, never logged/returned | ✅ no secret appears in client code |
| Generic 502, no upstream detail | ✅ |
| Tags exact; interest ≠ consent; `consent-*` only when ticked; SMS tag only if phone present | ✅ |
| Unsubscribe: `dnd:true` + `unsubscribe-request` + suppression tag, no consent tag | ✅ |
| Consent boxes unticked; required one on copy + market forms; mailing address on copy form | ✅ |
| Source (`?src=`) kept in sessionStorage; `submitted:<date>` tag | ✅ |
| Amazon Kindle + Paperback buttons (new tab, noopener); placeholder line removed | ✅ |
| Cover alt text, portrait + alt, license line, eXp logo, /unsubscribe page + footer link | ✅ |
| Chat, market-brief, insights, privacy/terms text, PDFs untouched | ✅ diff shows only added `unsubscribe` route + `showPortrait` in `$page.tsx`; protected strings still present |
| Extra (not requested): "I am…" select added to contact form; `AGENTS.md` note | ⚠️ minor, acceptable |

## Known limitations / things to watch
1. **Privacy page is still a placeholder**, yet the consent text links to it. **Do not enable forms publicly until the real privacy policy is in.**
2. `FORM_ALLOWED_ORIGIN` accepts exactly one origin. Testing from the Lovable preview needs the preview origin; the live site needs its own domain (and a second value if both are used).
3. Rate limit is per server instance (not shared) and trusts `cf-connecting-ip`/`x-forwarded-for` — adequate as a speed bump, not a hard cap.
4. Contact form: if the note call fails after the contact is saved, the visitor sees an error and may resubmit (duplicate note).
5. Upsert treats a response with no `contact.id` as failure for the contact form only.
6. **Unverified against live HighLevel:** the `dnd:true` field on upsert and the notes endpoint. The test below confirms or exposes them.
7. Unsubscribe is open to anyone who knows an email address (low harm; industry-normal).

## Live test (Phillip + Claude, ~15 min)
1. In HighLevel create a **new** private-integration token; revoke the one pasted in chat.
2. Lovable → Project Settings → Secrets: `HIGHLEVEL_API_KEY`, `HIGHLEVEL_LOCATION_ID` (s457BGtmM6BeOMTvQQEj), `FORM_ALLOWED_ORIGIN` (the preview origin shown in Lovable), `FORM_ENABLED=true`. Phillip types these; nobody pastes them in chat.
3. Use **your own** test email (e.g. a plus-address). Submit: copy form (tick required only), then again with email + SMS ticked; market signup; contact form; unsubscribe.
4. In HighLevel confirm: tags match the table in GHL_CAMPAIGN_PLAN.md; no `consent-*` tag where unticked; address saved; contact note present; after unsubscribe the contact is DND and tagged `unsubscribe-request` + `suppressed`.
5. Negative checks: submit with the honeypot filled (nothing created); with `FORM_ENABLED=false` (503 message shows); wrong origin (403).
6. Delete the test contact. Set `FORM_ENABLED=false` again until launch.
Claude can read the GHL side of step 4 through the connected HighLevel account once you say the test is done.
