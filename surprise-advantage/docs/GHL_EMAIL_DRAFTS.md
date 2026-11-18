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
Format: plain text, no images, two links (website, unsubscribe). Personal tone so it reads like a note, not a newsletter.
**Subject:** Quick question from Phillip
**Sender:** Phillip Williams <phillip@phillipwilliamsrealestatestrategist.com> (approved by Phillip 2026-11-12; currently set in HighLevel)
**Preview text:** One question, and a yes/no answer is all I need.

Hi {{contact.first_name}},

It's Phillip Williams. We've crossed paths over the years, and I'm reaching out before I add anyone to my email list.

Once a month I send a short note on what's changing in the Surprise and West Valley housing market: what moved, what it may mean for buyers and sellers, and one question worth asking. No sales pitch, and every number comes with its source and date.

Would you like to get it? Just reply "yes." If I don't hear back, I won't add you, and this is the only email you'll get about it.

If you received a market report from me earlier this week, that went out before I'd asked you. I'm sorry about that, and it won't happen again.

I also just published a book, The Surprise Advantage. If you'd like a copy, mention that in your reply and I'll follow up with you. You can also read about it at phillipwilliamsrealestate.com.

Thanks, and I hope you're doing well.
— Phillip

Phillip Williams, REALTOR® | Real Estate Strategist
Brokered by eXp Realty, LLC · Arizona brokerage license LC634213000
Arizona real estate license SA657637000
16165 N 83rd Avenue, Peoria, AZ 85382
You're receiving this one-time note because we've been in touch before.
Unsubscribe: {{email.unsubscribe_link}}

Handling replies: book requests → Phillip replies personally (a copy if available, otherwise the website link). Each "yes" → add `consent-email` + `market-update-subscriber`, note "Opted in by email reply YYYY-MM-DD", remove `sphere-invite`. No reply after 14 days → remove `sphere-invite`, send nothing further. Unsubscribe or "no" → DND email.
Before sending: send a test to Phillip's own address and click the unsubscribe link; send in small batches (e.g. 50/day) to protect sender reputation after this week's complaints.

---

## MU-01 Monthly market update — welcome email (DRAFT, 2026-11-18, awaiting Phillip's approval)

Trigger (proposed): tag `monthly-market-update` added (new strategist-site signup). Send once. Skip if DND.
From: Phillip Williams <phillip@phillipwilliamsrealestatestrategist.com>
Subject: You're on the list for the monthly market update
Preview text: What to expect once a month, and how to reach me in the meantime.

Hi {{contact.first_name}},

Thanks for signing up for my monthly Surprise & West Valley market update.

Here's what to expect. Once a month I'll send you one short email covering:

- What changed in prices, inventory and days on market around Surprise and the West Valley
- Where each number comes from and the date it covers
- What it means if you're thinking about buying or selling

No daily emails, no pressure, and no sales pitch. If a month doesn't have much worth saying, I'll keep it short.

While you wait for the first edition, three things that might help:

- Book a strategy call: https://phillipwilliamsrealestatestrategist.com/schedule
- Request a complimentary copy of my book, The Surprise Advantage: https://phillipwilliamsrealestate.com/complimentary-copy
- Search homes for sale: https://phillipknowsaz.com

If you have a question about your own situation, just reply to this email. It comes straight to me.

Phillip

Phillip Williams, REALTOR® | Real Estate Strategist
Brokered by eXp Realty, LLC · Arizona brokerage license LC634213000
Arizona real estate license SA657637000
16165 N 83rd Avenue, Peoria, AZ 85382
(623) 292-3737

You're receiving this because you signed up for the monthly market update at phillipwilliamsrealestatestrategist.com.
Unsubscribe: {{email.unsubscribe_link}}

### MU-01 v2 (2026-11-18) — Phillip's rewrite, with Claude's edits. Awaiting approval.
Changes from Phillip's version: subject/preview added; first-name fallback; "latest update is ready" link removed until a real archive page exists (it pointed to the home page, which has no update) — replaced with first-edition line; minor trims; footer de-duplicated. "retired" kept pending Phillip's confirmation.

Subject: Welcome — your Surprise & West Valley market update
Preview text: Thanks for joining. Here's what to expect, plus a thank-you gift.

Hi {{contact.first_name | default: "there"}},

First, thank you for subscribing. I'm glad we're connected.

If you've been following the real estate market, you already know there's no shortage of headlines, opinions and predictions. But the question that matters most is: what does it all mean for you and your family?

That's why I created the Surprise & West Valley Monthly Market Update. My goal is simple: to help you look past the headlines, understand what's actually happening in our local market, and make informed decisions when the time is right.

[FIRST-EDITION LINE — until the archive page exists:]
Your first edition will arrive early next month.
[ONCE /market-update EXISTS, replace with:]
You don't have to wait until next month. Read the latest edition here: [Read the Latest Market Update](https://phillipwilliamsrealestatestrategist.com/market-update)

Here's what you can expect each month:
- The local picture: home prices, available inventory, and how long homes are staying on the market.
- Facts, not speculation: every number comes with its source and the date it covers.
- Perspective that matters: what those changes could mean if you're buying, selling, investing, or simply keeping an eye on your home's value.

No daily emails. No unnecessary noise. Just practical information that respects your time.

A little about me, and why I do this.
I proudly served 26 years in the U.S. military. That time taught me that preparation matters, that leadership is about serving others, and that trust is earned through your actions. Those principles didn't end when I retired. Today they shape how I serve individuals and families throughout the West Valley.

Whether we're working together for the first time or simply staying connected, you deserve someone who listens, thinks ahead and gives you straight answers. Good real estate decisions don't happen by accident. They start with good information and a clear strategy, and that's what I want this update to give you.

As a thank-you for joining, I'd love to send you a complimentary copy of my book, The Surprise Advantage.
[Request Your Complimentary Copy](https://phillipwilliamsrealestate.com/complimentary-copy)

One last thing: you never have to wait for the next update to ask me a question. Whether it's about the market, your home's value or an opportunity you're considering, just reply to this email. It comes directly to me, and I'd be glad to hear from you.

Thank you again for being here.

Phillip Williams
REALTOR® | Real Estate Strategist
(623) 292-3737

Brokered by eXp Realty, LLC · Arizona brokerage license LC634213000
Arizona real estate license SA657637000
16165 N 83rd Avenue, Peoria, AZ 85382

You're receiving this because you subscribed to the Surprise & West Valley Monthly Market Update at phillipwilliamsrealestatestrategist.com.
Unsubscribe: {{email.unsubscribe_link}}

### MU-01 v3 (2026-11-18) — APPROVED by Phillip ("yes, approve it"). Loaded in HighLevel as template `MU-01 Monthly market update — welcome` (6afd2deea094ee50c8c15ade), first-edition-on-its-way wording. Greeting is plain `{{contact.first_name}}`: HighLevel says the Liquid `| default:` form in v2 blocks the send (first name is required on the signup form). Change from v2 only:
Phillip confirmed he retired from the military ("when I retired" stays). Archive page now exists (preview): https://phillipwilliamsrealestatestrategist.com/market-update — empty until the first edition is published.
Replace the first-edition block with:
- Until the first edition is posted: "Your first edition is on its way. Every edition is also posted here, so you can always catch up: [See the Market Update page](https://phillipwilliamsrealestatestrategist.com/market-update)"
- After the first edition is posted: "You don't have to wait until next month. [Read the Latest Market Update](https://phillipwilliamsrealestatestrategist.com/market-update)"
Everything else as v2.

## ME-2026-12 — First monthly edition (DRAFT, 2026-11-18, awaiting Phillip's approval)
Send: Tuesday, December 1, 2026 (first Tuesday of each month; weekly Thursday update unchanged). To: tag `monthly-market-update`, DND skipped.
Data: Realtor.com Residential Data, "Inventory Core Metrics" ZIP and county files, month 2026-10 (October 2026), downloaded 2026-11-18 from econdata.s3-us-west-2.amazonaws.com/Reports/Core/ (sha256 zip 8ed9f1d4…, county 9664e164…). These are LISTING figures (asking prices, active/pending listings), not closed sales. Surprise totals are Claude's sums of the five Surprise ZIP codes (85374, 85378, 85379, 85387, 85388); year-ago totals back-calculated from Realtor.com's year-over-year changes. Price-reduction share is weighted by active listings. If Realtor.com posts November 2026 data before Dec 1, refresh the numbers and dates before sending.

Subject: Surprise market update: more homes to choose from, fewer going under contract
Preview text: October numbers for Surprise and Maricopa County, and what they mean for you.

Hi {{contact.first_name}},

Welcome to the first Surprise & West Valley Monthly Market Update. Here's what the numbers showed for October 2026.

**Surprise at a glance (October 2026, five Surprise ZIP codes)**
- Homes for sale: 1,040 active listings, up about 11% from October 2025 (about 935).
- Homes going under contract: 280 pending listings, down about 13% from a year ago (about 322).
- New listings: 364 came on the market in October, down about 7% from a year ago.
- Price cuts: about 27% of active listings had a price reduction.

**Asking prices by ZIP code (median listing price, October 2026, change vs. October 2025)**
- 85374: $394,700 (+1.7%), median 45 days on market
- 85378: $331,000 (−4.8%), 64 days (small sample: 17 active listings)
- 85379: $441,250 (−4.9%), 57 days
- 85387: $459,900 (−2.3%), 65 days
- 85388: $529,900 (+6.1%), 67 days

**Maricopa County for comparison (October 2026)**
- Median listing price $499,600, down 3.9% from a year ago.
- 17,649 active listings, up 10.3%. Pending listings 4,356, down 15.2%.
- Median 59 days on market. About 30% of listings had a price cut.

**What this could mean for you**
- If you're buying: you have more homes to choose from than a year ago, and more than one in four sellers in Surprise has already reduced their price. That can mean more room to negotiate on price, repairs or closing costs. It still pays to be prepared before you write an offer.
- If you're selling: buyers have options, so pricing, condition and presentation matter more than they did a year ago. Homes are taking roughly two months to sell in most Surprise ZIP codes. A realistic price from the start usually beats chasing the market down.
- If you're watching your home's value: asking prices are close to flat in most of Surprise, a little up in some ZIP codes and a little down in others. Your street and your home's condition matter more than the headline number.

A note on these numbers: they are listing figures (asking prices and listing counts) from Realtor.com for October 2026, not closed sales. Every edition will say where its numbers came from and the month they cover.

Want to know what this means for your home or your search? Just reply to this email. It comes straight to me.

Every edition is also posted at https://phillipwilliamsrealestatestrategist.com/market-update

Phillip Williams
REALTOR® | Real Estate Strategist
(623) 292-3737

Source: Realtor.com® Residential Data, Inventory Core Metrics by ZIP code and county, October 2026. Surprise totals are sums of ZIP codes 85374, 85378, 85379, 85387 and 85388. Listing data, not closed sales.

[Standard footer as MU-01: eXp brokerage line, licenses, Peoria address, "You're receiving this because you subscribed…", {{email.unsubscribe_link}}]

### Open points for Phillip
1. Your own read: add one or two sentences from what you're seeing (showings, new-build incentives, offers) in your own words. Optional, but it's what makes this yours.
2. Closed-sale numbers (sold prices, months of supply) would come from ARMLS, which Claude can't access. If you want them, paste the ARMLS stats for Surprise and Claude will add them with the source and date.
3. Mortgage rates intentionally left out (keeps clear of credit-advertising rules). Can add Freddie Mac's weekly average with attribution if you want.
4. Once approved: Claude adds this edition to the site's Market Update page (preview) and loads the email in HighLevel as a draft campaign scheduled for Dec 1, then sends you one [TEST].
