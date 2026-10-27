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
- The address is the eXp office address used on the old site pages. **Confirm it is the address you want on mailings** (a valid physical postal address is required in every marketing email).
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
- Buying → Buyer Questions Checklist: [SITE DOMAIN]/reader/buyer-questions/
- Selling → Seller Preparation Checklist: [SITE DOMAIN]/reader/seller-checklist/
- Relocating → Relocation Checklist: [SITE DOMAIN]/reader/relocation-checklist/
- Investing → Investor Worksheet: [SITE DOMAIN]/reader/investor-worksheet/
(No interest selected: send the Reader Resources link, [SITE DOMAIN]/reader/.)
They're general education, not legal, tax or financial advice.
— Phillip
[STANDARD FOOTER]
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
