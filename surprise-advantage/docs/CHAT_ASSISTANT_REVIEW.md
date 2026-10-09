# Reader Guide chat (Lovable Hub) — cost, abuse and risk review
Reviewed read-only 2026-10-08: `src/routes/api/chat.ts`, `src/lib/ai-gateway.server.ts`, `src/components/reader-guide.tsx`. Pricing figures are not in the code and were not looked up, so **no dollar estimate is given**.

## How it works
Public page → `POST /api/chat` → Lovable AI Gateway (`LOVABLE_API_KEY`, billed to the workspace's Lovable AI credits) → model `openai/gpt-6-astra`, reasoning forced on (effort "low"), reasoning summaries streamed to the visitor. System prompt holds the approved book framework, a strong "never invent" policy and an educational-not-advice disclaimer. Conversation is kept in the visitor's browser (localStorage).

## Findings
| # | Finding | Risk |
|---|---|---|
| 1 | **No rate limit, no per-IP/daily cap, no budget kill switch** | Anyone (or a bot) can drain AI credits; the code already handles HTTP 402 "credits unavailable", which means it can happen |
| 2 | **No limit on request size**: whole `messages` array from the browser is forwarded. History grows with each turn and is re-sent every time | Cost per request grows; a crafted 1 MB payload is accepted |
| 3 | **Client-supplied history is trusted** (including fake "assistant" turns) | Prompt-injection / jailbreak of the guardrails; could make the bot say things in Phillip's name |
| 4 | **No maxOutputTokens** | Unbounded replies |
| 5 | `sendReasoning: true` | Streams model reasoning summaries to the public — unneeded, adds tokens, and exposes internals |
| 6 | No Origin check, no bot challenge | Easy to call from scripts |
| 7 | No input moderation; visitors may type personal details or financial/legal specifics | Privacy-notice mismatch; the bot should say "don't enter personal information" |
| 8 | `systemPrompt` is solid on claims (no stats, no guarantees) | Good — keep |
| 9 | Disclaimer is shown on page | Good |

## Decision (made as delegated by Phillip, 2026-10-08)
**Do not enable the chat at launch.** Ship it hardened and switched off, then turn it on in week 2 after Phillip sets a monthly credit ceiling and sees the first numbers.
Required hardening before enabling (one Lovable change request, needs Phillip's OK because it uses credits):
1. `CHAT_ENABLED` flag, default `false`; when off, hide the section and return 503.
2. Server-side caps: last 6 turns only, user message ≤ 800 characters, request body ≤ 8 KB, **drop any client "assistant" messages and rebuild history server-side or sign it**, `maxOutputTokens` ≈ 500.
3. Rate limits: per-IP (e.g. 15/hour) and a global daily cap, stored durably (Supabase table), returning 429 with a friendly message; a `CHAT_DAILY_LIMIT` env value as a kill switch.
4. `sendReasoning: false`; Origin check; optional Turnstile if abuse appears.
5. Visible note: "Please don't enter personal or financial details." Privacy page to mention the feature.
6. Phillip sets a credit alert/ceiling in Lovable and checks usage weekly for the first month.
Acceptance: with `CHAT_ENABLED=false` the endpoint returns 503; with it on, the 16th request in an hour returns 429; an oversize payload returns 413/400; a forged assistant message is ignored.

## Hardening build — result (2026-10-09, Lovable commit 46d0c83, 5.4 credits)
Reviewed from the agent's report and the code it wrote (chat.ts as quoted in its tool log). Chat is **OFF by default**; project still unpublished.
| Item | Status |
|---|---|
| `CHAT_ENABLED` must equal "true" else 503 before anything runs; `/reader` hides the section via a server check | ✅ agent tested 503 and hidden section live |
| Origin check (`FORM_ALLOWED_ORIGIN`), 8 KB cap (declared + actual), user-text-only, last 4, 800 chars | ✅ in code; not run live |
| `maxOutputTokens: 500`; `sendReasoning: false`; reasoning UI removed | ✅ in code |
| Usage limits: salted SHA-256 IP hash, per-IP per-hour bucket (15) + global daily (300) via `chat_usage` + RPC `increment_chat_usage`, RLS on, service_role only, fail-closed 503, 30-day cleanup | ✅ in code; not run live |
| Prompt additions (no personal info, not Phillip, fair housing, no advice/figures, stay on topic) | ✅ appended |
| UI note "Please don't enter personal or financial details."; friendly 429/503; 44px buttons | ✅ |
| Forms, book, about, footer, legal text, PDFs untouched | ✅ per agent report (file list: chat.ts, reader-guide.tsx, $page.tsx, one migration) |
Watch: the agent also added `drizzle/migrations/0000_chat_usage.sql` besides applying the migration through Lovable's tool — harmless duplicate, but confirm the table exists once in Lovable Cloud before enabling. Items marked "not run live" need a test with the chat switched on: 16th request → 429, oversize → 413, forged assistant turn ignored.
**Still required before enabling:** `CHAT_IP_SALT` set by Phillip, a Lovable credit ceiling, broker review of the chat, and a Fair Housing read of the system prompt.
