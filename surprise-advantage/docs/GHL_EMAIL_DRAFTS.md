# Email & Text Drafts — for Phillip's edit and approval
Voice: calm, direct, experienced, protective. No hype, no stats, no urgency, no invented stories.
Every email ends with the standard footer below (unsubscribe link + physical address).
`[BRACKETS]` = missing values you must supply. Nothing here has been sent.

## Standard footer (paste at the bottom of every email below, T1 through M1)
```
Phillip Williams, REALTOR® | Real Estate Strategist
Brokered by eXp Realty, LLC · Arizona brokerage license LC634213000
Arizona real estate license SA657637000
16165 N 83rd Avenue, Peoria, AZ 85382
You're receiving this because you asked for a copy of the book or joined my list.
Unsubscribe: {{email.unsubscribe_link}}
```
Notes:
- `{{email.unsubscribe_link}}` is HighLevel's unsubscribe merge tag (written from memory, not yet tested on your account). Send a test to your own address and click it before any real send; it should set the contact to Do Not Disturb, which SA-07 relies on.
- Mailing address confirmed by Phillip on 2026-11-06.
- Wording follows Nicole Battin's ruling ("Phillip Williams" + "Real Estate Strategist", no "Real Estate Group"). Her answer on required CRM footer wording is still pending; adjust if she specifies something different.
- Use the footer without the "because" line on T1/T2 if you prefer; the unsubscribe link and address stay.

## T1 — Copy request confirmation (one-time, fulfilment)
**Subject:** We received your request for The Surprise Advantage
Hi {{contact.first_name}},
Thank you for asking for a copy of *The Surprise Advantage*. I'll send it to the address you gave us and let you know when it ships.
You didn't sign up for anything beyond that unless you ticked the optional boxes. You can change your mind at any time using the link below.
— Phillip Williams
[STANDARD FOOTER]

## T2 — Shipped (one-time, fulfilment)
**Subject:** Your copy of The Surprise Advantage is on its way
Hi {{contact.first_name}}, your copy has shipped to the address you provided. If it doesn't arrive, reply to this email and I'll sort it out.
— Phillip
[STANDARD FOOTER]

## R1 — Day 0 after delivered (consent-email)
**Subject:** One way to use the book
Hi {{contact.first_name}},
However you read it, I'd suggest keeping a pen nearby and marking the questions that apply to your situation. The right move depends on your goals and timeline, not on the market headline of the week.
If a question comes up, just reply. I read every response.
— Phillip
[STANDARD FOOTER]

## R2 — Day 7 (consent-email) — one block shown per interest tag
**Subject:** A short checklist you can use
Hi {{contact.first_name}},
Here is a checklist that goes with the book:
- Buying → Buyer Questions Checklist: https://phillipwilliamsrealestate.com/downloads/buyer-checklist.pdf
- Selling → Seller Preparation Checklist: https://phillipwilliamsrealestate.com/downloads/seller-checklist.pdf
- Relocating → Relocation Checklist: https://phillipwilliamsrealestate.com/downloads/relocation-checklist.pdf
- Investing → Investor Worksheet: https://phillipwilliamsrealestate.com/downloads/investor-worksheet.pdf
(No interest selected: send the Reader Resources link, https://phillipwilliamsrealestate.com/reader.)
(The live HighLevel R2 template currently sends everyone the Reader Resources link.)
They're general education, not legal, tax or financial advice.
— Phillip
[STANDARD FOOTER]

## R3 — Day 21 (consent-email)
**Subject:** What questions did the book leave you with?
Hi {{contact.first_name}},
If the book left you with a question, reply and tell me. What readers ask shapes what I write and teach next.
If a conversation would help, you can pick a time here whenever it suits you: [CALENDAR LINK]. No obligation either way.
— Phillip
[STANDARD FOOTER]

## M1 — Monthly market briefing template (manual send)
**Subject:** Surprise & West Valley market briefing — [MONTH YEAR]
**Required before sending (all must be filled):** each figure has *source name*, *link*, *as-of date*; no figure without a source; no predictions or guarantees; Phillip signs off.
1. What changed — [FIGURE] ([SOURCE], as of [DATE])
2. What it may mean for buyers — [PLAIN-LANGUAGE NOTE]
3. What it may mean for sellers — [PLAIN-LANGUAGE NOTE]
4. One question to ask your agent this month — [QUESTION]
Not legal, tax, or financial advice.
[STANDARD FOOTER]

## Text (consent-sms only)
Hi {{contact.first_name}}, it's Phillip Williams. Your copy of The Surprise Advantage has shipped. Reply STOP to opt out.

## S1 — Sphere opt-in invite (one-time, to tag sphere-invite only) — DRAFT, not approved
Audience: contacts tagged `sphere-invite` (431 as of 2026-11-12). Exclude anyone on DND, tagged "complained - unsubscribed", or with an email HighLevel marks invalid.
Format: plain text, no images, one link (the unsubscribe). Personal tone so it reads like a note, not a newsletter.
**Subject (pick one):** Quick question from Phillip / Would you like my market updates? / Checking before I send you anything
**Preview text:** One question, and a yes/no answer is all I need.

Hi {{contact.first_name}},

It's Phillip Williams. We've crossed paths over the years, and I'm reaching out before I add anyone to my email list.

Once a month I send a short note on what's changing in the Surprise and West Valley housing market: what moved, what it may mean for buyers and sellers, and one question worth asking. No sales pitch, and every number comes with its source and date.

Would you like to get it? Just reply "yes." If I don't hear back, I won't add you, and this is the only email you'll get about it.

If you received a market report from me earlier this week, that went out before I'd asked you. I'm sorry about that, and it won't happen again.

[OPTIONAL — Phillip to decide] I also just published a book, The Surprise Advantage. If you'd like a copy, mention that in your reply.

Thanks, and I hope you're doing well.
— Phillip

Phillip Williams, REALTOR® | Real Estate Strategist
Brokered by eXp Realty, LLC · Arizona brokerage license LC634213000
Arizona real estate license SA657637000
16165 N 83rd Avenue, Peoria, AZ 85382
You're receiving this one-time note because we've been in touch before.
Unsubscribe: {{email.unsubscribe_link}}

Handling replies: each "yes" → add `consent-email` + `market-update-subscriber`, note "Opted in by email reply YYYY-MM-DD", remove `sphere-invite`. No reply after 14 days → remove `sphere-invite`, send nothing further. Unsubscribe or "no" → DND email.
Before sending: send a test to Phillip's own address and click the unsubscribe link; confirm the sending address with Nicole (open question on the realestategroup domain); send in small batches (e.g. 50/day) to protect sender reputation after this week's complaints.
