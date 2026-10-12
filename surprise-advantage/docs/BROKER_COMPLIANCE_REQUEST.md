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

## eXp Policies & Procedures check (Version R, September 2026, 98 pp.) — added 2026-10-12
Checked against the PDF Phillip supplied. Page numbers are the policy's own. This is a reading of the policy, not legal advice or broker approval.

### Already consistent
- No "eXp"/"exp" in the sender domain (`phillip.phillipwilliamsrealestategroup.com`), booking domain, or email addresses (p. 34–35, rule C.2.d).
- Emails carry an unsubscribe link and mailing address; interest is not treated as marketing consent; opt-out sets DND/suppression (supports "Solicitation Laws" duty, p. 32–33).
- No invented testimonials, stats or credentials (p. 32, content must be "completely factual").
- Reader Guide chat is off by default.

### Needs action before anything goes public
1. **Marketing review.** Custom-created content (not eXp Canva templates) must go through the compliance channel in "Marketing Review and Approval" (p. 34 and following) *before publication*. That covers the Hub, the book site, the five emails, the booking page and the reader PDFs. Ask the Arizona State Broker which channel to use.
2. **Website branding (p. 34, B.4).** Above the fold: agent name and/or team name plus the eXp logo, and a clear contact line. Check the Hub header and the book site against this.
3. **eXp affiliation on content with contact info (B.4, C.2.c).** Use the eXp Realty logo together with team name/logo. Email footers currently show business name and address only; add the brokerage identification the broker specifies.
4. **Team name (pp. 80–81).** Team names may not use "Realty" or "Real Estate" and need the State Broker's written approval. "Phillip Williams Real Estate Group" (GHL business name, domain, Hub footer) likely conflicts. Do not change names yet; ask the broker (question 3 above) and hold the name in footers/sender until answered.
5. **AI (pp. 77–79).** If the Reader Guide chat is ever turned on, the policy's disclosure text must be clearly and conspicuously shown: "Important: This is an automated AI tool and not an eXp agent. It does not provide legal, financial, or real estate advice and does not represent you in any transaction. Please consult directly with your eXp agent before making decisions." Also: no personal information into AI tools that train on it or store it outside the U.S.; human fact-check of all AI-assisted content before sending/publishing; AI messaging needs prior consent, clear identification and opt-out.
6. **Fair Housing (p. 77).** AI-assisted copy and responses must follow fair housing law; keep school/neighborhood language neutral (already item 2 above).
7. **TCPA / CAN-SPAM / DNC (pp. 32–33, 66).** The agent is solely responsible. Texts stay off until the SMS opt-in wording is approved (A2P 10DLC is confirmed for +1 623-292-3737 as of 2026-10-12); screen against the Do Not Call rules before any calls.

### Add to the broker email
- Which compliance channel/bot should receive the Hub, book site, emails and booking page, and the expected turnaround?
- Required wording/placement for eXp logo + team name on the website and in email footers.
- Is "Phillip Williams Real Estate Group" acceptable, or what team name should be used?
- Confirm the AI disclosure wording and any Arizona-specific addition if the chat is enabled.

Nothing was changed on the site, in GHL, or in OWNER_APPROVALS.json as a result of this review.
