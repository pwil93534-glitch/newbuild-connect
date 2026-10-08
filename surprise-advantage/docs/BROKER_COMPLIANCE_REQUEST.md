# Broker / eXp compliance request — for Phillip to send
Decision (2026-10-08): the Surprise Strategy Hub stays an eXp-affiliated site (option 1). I'm not a lawyer; this list tells you what to ask, not what the rules say.

## Draft email (edit and send to your managing broker / eXp compliance)
Subject: Compliance review — my book website before launch

Hi [name],
I'm launching a website for my book, The Surprise Advantage (Kindle and paperback, independently published). The site also lets visitors request a copy of the book and start a conversation with me about buying, selling, relocating or investing in Surprise, AZ, so it is real estate advertising. It's currently unpublished: [PREVIEW LINK].
Please tell me:
1. What disclosure wording, brokerage name/license information and Equal Housing/Fair Housing statements are required on every page or in the footer? (Currently: "Arizona real estate license SA657637000", the eXp logo, "Phillip Williams Real Estate Group | eXp Realty", "Equal Housing Opportunity".)
2. eXp's rules for using the eXp logo and brand on an agent website (size, clear space, placement).
3. Is "Phillip Williams Real Estate Group" an approved team/DBA name under eXp, and how must it appear next to the brokerage name?
4. Does eXp provide a standard privacy policy and terms for agent websites that I should use?
5. Do the site's forms (book request, contact, market-update signup), email and text follow-ups need any additional consent or disclosure wording for eXp or Arizona?
6. Does giving away free copies of my book to the public need any approval or wording?
7. If the site shows market statistics from MLS data, what attribution/disclaimer is required?
8. Is there a compliance sign-off process for websites and ads? Can you confirm approval in writing?
Thank you,
Phillip

## What to do with the answers
- Send the wording to Claude; it goes into one Lovable change request (footer, privacy, terms, form notes).
- Keep the broker's written approval; then set `copy_and_compliance_approved` and `disclosures_approved` in `OWNER_APPROVALS.json` yourself.

## Suggestions (in priority order)
1. **Send the email above first** — it unblocks the privacy policy, footer and launch. Ask for eXp's standard agent-site privacy policy; that is often the fastest route.
2. **Fair Housing review of copy.** The Hub's relocation page mentions "schools" and neighborhood character. Brokerages commonly want neighborhood language kept neutral (no steering by schools, demographics or "type of people"). Have the broker read every page, the reader PDFs and the chat prompt.
3. **Keep the AI Reader Guide off** until the broker has seen it. A bot answering real estate questions in your name is the highest-risk feature.
4. **Market numbers only with source + as-of date**, and check MLS attribution rules before using any MLS-derived figure. The Market Brief page should stay hidden until the first verified brief exists.
5. **Email/text footer:** every marketing email needs your physical address and a working unsubscribe link; texts need STOP language and carrier registration. Both are on the GHL checklist.
6. **Trademark marks:** the site uses ™ on "The Surprise Advantage", "Strategy Review", "Market Brief". Use ™ only (not ®) unless a mark is registered.
7. **No testimonials or review counts** until verified and approved (the Hub currently has none — keep it that way).
8. **Record the approval:** save the broker's written OK with the launch records, and re-check after any major content change.
