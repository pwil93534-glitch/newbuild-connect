// Builds the Phillip Williams stationery suite (letterhead, business cards, pre-listing cover, email signature)
// in two variants: A = eXp Realty logo, B = eXp Realty LUXURY logo (placeholder until the official file is supplied).
// Run:  node build.js      (needs playwright; see README)
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
const ROOT = __dirname, SRC = path.join(ROOT, 'src'), OUT = path.join(ROOT, 'output');
const LUX = path.join(ROOT, 'assets', 'exp-luxury.png'); // drop the official eXp Luxury logo here (PNG, transparent)
const hasLux = fs.existsSync(LUX);

const CSS = `
@font-face{font-family:Cormorant;font-weight:500;src:url(../fonts/cormorant-garamond-latin-500-normal.woff2)}
@font-face{font-family:Cormorant;font-weight:600;src:url(../fonts/cormorant-garamond-latin-600-normal.woff2)}
@font-face{font-family:Cormorant;font-weight:700;src:url(../fonts/cormorant-garamond-latin-700-normal.woff2)}
@font-face{font-family:Cormorant;font-weight:500;font-style:italic;src:url(../fonts/cormorant-garamond-latin-500-italic.woff2)}
@font-face{font-family:Manrope;font-weight:400;src:url(../fonts/manrope-latin-400-normal.woff2)}
@font-face{font-family:Manrope;font-weight:600;src:url(../fonts/manrope-latin-600-normal.woff2)}
@font-face{font-family:Manrope;font-weight:700;src:url(../fonts/manrope-latin-700-normal.woff2)}
:root{--navy:#0a1a30;--navy2:#102746;--gold:#c29b45;--gold2:#e3c37d;--ivory:#faf7ef;--ink:#0b1b33;--mut:#5b6677}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Manrope,Arial,sans-serif;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact}
.serif{font-family:Cormorant,Georgia,serif}
.caps{text-transform:uppercase;letter-spacing:.2em}
.slot{border:1px dashed var(--gold);color:var(--gold2);display:flex;align-items:center;justify-content:center;text-align:center;font-weight:600;line-height:1.25}
`;
const page = (body, extra = '') => `<!doctype html><meta charset=utf-8><style>${CSS}${extra}</style><body>${body}`;
const A = { id: 'A', label: 'eXp Realty logo' };
const B = { id: 'B', label: 'eXp Realty Luxury logo' };
// exp logo / luxury logo: dark=true -> for navy backgrounds
function expLogo(v, h, dark) {
  if (v.id === 'A') return `<img src="../assets/exp-logo${dark ? '-white' : ''}.png" style="height:${h}px;width:auto;display:block">`;
  if (hasLux) return `<img src="../assets/exp-luxury.png" style="height:${h}px;width:auto;display:block">`;
  return `<div class="slot" style="height:${h}px;width:${Math.round(h * 2.4)}px;font-size:${Math.max(5, Math.round(h * .17))}px;padding:0 4px">eXp REALTY LUXURY<br>logo: official file needed</div>`;
}
const pw = (h, dark) => `<img src="../assets/pw-logo${dark ? '-white' : ''}.png" style="height:${h}px;width:auto;display:block">`;
const eho = (h, dark) => `<img src="../assets/eho${dark ? '-white' : ''}.png" style="height:${h}px;width:auto;display:block">`;

const P = {
  name: 'Phillip Williams', phone: '(623) 292-3737', email: 'phillip.a.williams@exprealty.com',
  web: 'phillipknowsaz.com', book: 'bookastrategycallwithphillip.com', lic: 'SA657637000',
  addr: '16165 N 83rd Avenue, Peoria, AZ 85382',
};

// ---------- LETTERHEAD (8.5 x 11 in) ----------
const letterhead = (v, sample) => page(`
<div style="width:816px;height:1056px;position:relative;background:#fff">
  <div style="background:var(--navy);height:150px;padding:34px 56px;display:flex;justify-content:space-between;align-items:center">
    ${pw(82, true)}
    <div style="text-align:right">${expLogo(v, 50, true)}</div>
  </div>
  <div style="height:4px;background:linear-gradient(90deg,var(--gold),var(--gold2),var(--gold))"></div>
  <div style="padding:26px 56px 0;display:flex;justify-content:space-between;font-size:10px;letter-spacing:.2em;color:var(--gold)" class="caps">
    <span>Real Estate Strategist</span><span>Surprise &middot; Arizona</span>
  </div>
  <div style="padding:34px 72px;font-size:13.5px;line-height:1.75;color:#1b2a40">${sample ? `
    <p style="color:var(--mut)">[Date]</p><br>
    <p>[Seller Name]<br>[Property Address]</p><br>
    <p>Dear [Seller Name],</p><br>
    <p>Thank you for the opportunity to talk with you about your home. This letter and the package that follows outline how we would prepare, price and position it, so that every decision is yours and an informed one.</p><br>
    <p>[Body of letter]</p><br>
    <p>With appreciation,</p><br>
    <p class="serif" style="font-size:30px;font-weight:600;color:var(--navy)">Phillip Williams</p>
    <p style="font-size:11px;letter-spacing:.14em;color:var(--gold)" class="caps">REALTOR&reg; &middot; Real Estate Strategist</p>` : ''}</div>
  <div style="position:absolute;left:0;right:0;bottom:0">
    <div style="margin:0 56px;height:1px;background:var(--gold)"></div>
    <div style="padding:16px 56px 0;display:flex;justify-content:space-between;align-items:flex-start;font-size:10.5px;line-height:1.7;color:#243349">
      <div><b class="serif" style="font-size:17px;color:var(--navy)">Phillip Williams, REALTOR&reg;</b><br>Real Estate Strategist &middot; Author, <i>The Surprise Advantage</i><br>Arizona real estate license ${P.lic}</div>
      <div style="text-align:center">${P.phone}<br>${P.email}<br>${P.web}</div>
      <div style="text-align:right;display:flex;gap:10px;align-items:center">${eho(30)}<span style="font-size:9px;line-height:1.3">Equal Housing<br>Opportunity</span></div>
    </div>
    <div style="margin:12px 0 0;background:var(--navy);color:#cfd6e2;font-size:8.5px;letter-spacing:.06em;padding:11px 56px;text-align:center">Phillip Williams Real Estate Group &nbsp;|&nbsp; Brokered by eXp Realty &nbsp;&middot;&nbsp; eXp Realty, LLC &nbsp;&middot;&nbsp; Arizona brokerage license LC634213000</div>
  </div>
</div>`);

// ---------- BUSINESS CARD (3.5 x 2 in, 0.125 in bleed => 3.75 x 2.25 in = 360 x 216 px) ----------
const cardFront = v => page(`
<div style="width:360px;height:216px;background:radial-gradient(ellipse at 50% 38%,var(--navy2),var(--navy) 70%);position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center">
  <div style="position:absolute;inset:12px;border:.6px solid rgba(194,155,69,.55)"></div>
  <div style="margin-top:-14px">${pw(92, true)}</div>
  <div style="width:34px;height:1px;background:var(--gold);margin:9px 0 8px"></div>
  <div class="caps" style="font-size:6.2px;color:var(--gold2);font-weight:600;letter-spacing:.28em">Real Estate Strategist</div>
  <div style="position:absolute;bottom:22px;left:0;right:0;display:flex;justify-content:center">${expLogo(v, 17, true)}</div>
</div>`);
const cardBack = v => page(`
<div style="width:360px;height:216px;background:var(--ivory);position:relative;padding:26px 28px 20px 30px;display:flex;justify-content:space-between">
  <div style="position:absolute;inset:12px;border:.6px solid rgba(194,155,69,.7)"></div>
  <div style="z-index:1;display:flex;flex-direction:column;justify-content:space-between">
    <div>
      <div class="serif" style="font-size:22px;font-weight:600;color:var(--navy);line-height:1">Phillip Williams</div>
      <div class="caps" style="font-size:5.6px;color:var(--gold);font-weight:700;margin-top:5px;letter-spacing:.2em">REALTOR&reg; &middot; Real Estate Strategist</div>
      <div style="width:28px;height:1px;background:var(--gold);margin:9px 0 9px"></div>
      <div style="font-size:7.4px;line-height:1.85;color:#1b2a40;font-weight:600">${P.phone}<br>${P.email}<br>${P.web}</div>
    </div>
    <div style="font-size:5.6px;color:var(--mut);line-height:1.6">Author of <i>The Surprise Advantage</i><br>Arizona license ${P.lic} &middot; eXp Realty</div>
  </div>
  <div style="z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:space-between">
    <div style="text-align:center"><img src="../assets/qr-booking.png" style="width:64px;height:64px;display:block"><div class="caps" style="font-size:4.6px;color:var(--navy);font-weight:700;margin-top:4px;letter-spacing:.14em">Book a conversation</div></div>
    <div style="display:flex;align-items:center;gap:4px">${eho(14)}<span style="font-size:4.4px;line-height:1.2;color:var(--mut)">Equal Housing<br>Opportunity</span></div>
  </div>
</div>`);

// ---------- PRE-LISTING PACKAGE COVER (8.5 x 11 in) ----------
const cover = v => page(`
<div style="width:816px;height:1056px;background:radial-gradient(ellipse at 50% 30%,var(--navy2),var(--navy) 72%);position:relative;color:#fff;text-align:center">
  <div style="position:absolute;inset:34px;border:1px solid rgba(194,155,69,.6)"></div>
  <div style="position:absolute;inset:44px;border:.5px solid rgba(194,155,69,.3)"></div>
  <div style="padding-top:118px;display:flex;justify-content:center">${pw(120, true)}</div>
  <div class="caps" style="margin-top:96px;font-size:12px;color:var(--gold2);letter-spacing:.42em;font-weight:600">Pre-Listing Package</div>
  <div style="width:60px;height:1px;background:var(--gold);margin:22px auto"></div>
  <div class="serif" style="font-size:54px;font-weight:500;font-style:italic;line-height:1.1">Prepared for<br>[Seller Name]</div>
  <div style="margin-top:22px;font-size:14px;letter-spacing:.12em;color:#cdd5e2">[Property Address]</div>
  <div style="position:absolute;bottom:92px;left:0;right:0">
    <div class="serif" style="font-size:30px;font-weight:600">Phillip Williams</div>
    <div class="caps" style="margin-top:6px;font-size:10px;color:var(--gold2);letter-spacing:.26em;font-weight:600">REALTOR&reg; &middot; Real Estate Strategist</div>
    <div style="margin-top:16px;font-size:11px;color:#cdd5e2;letter-spacing:.06em">${P.phone} &nbsp;&middot;&nbsp; ${P.email} &nbsp;&middot;&nbsp; ${P.web}</div>
    <div style="margin-top:22px;display:flex;justify-content:center;align-items:center;gap:18px">${expLogo(v, 34, true)}<span style="width:1px;height:28px;background:var(--gold)"></span>${eho(26, true)}</div>
    <div style="margin-top:12px;font-size:8.5px;color:#9fb0c8;letter-spacing:.06em">Arizona real estate license ${P.lic} &nbsp;|&nbsp; Phillip Williams Real Estate Group | Brokered by eXp Realty</div>
  </div>
</div>`);

// ---------- EMAIL SIGNATURE (640 px, table layout, inline styles; name is an image so the serif face survives every email app) ----------
const signature = (v, imgBase = '../assets/') => {
  const gl = hasLux && v.id === 'B' ? `${imgBase}exp-luxury.png` : null;
  const expImg = v.id === 'A' ? `<img src="${imgBase}exp-logo.png" alt="eXp Realty" height="34" style="display:block;height:34px;width:auto;border:0">`
    : gl ? `<img src="${gl}" alt="eXp Realty Luxury" height="34" style="display:block;height:34px;width:auto;border:0">`
    : `<div style="border:1px dashed #c29b45;color:#8a6a1f;font:600 8px Arial,sans-serif;text-align:center;padding:9px 8px;line-height:1.3;white-space:nowrap;width:128px">eXp REALTY LUXURY<br>logo: official file needed</div>`;
  return `<table cellpadding="0" cellspacing="0" border="0" width="640" style="width:640px;background:#faf7ef;border-top:3px solid #c29b45;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;color:#0b1b33">
<tr><td style="padding:20px 22px 12px 22px" valign="top" width="112"><img src="${imgBase}clean-headshot.jpg" alt="Phillip Williams" width="96" height="96" style="display:block;width:96px;height:96px;border-radius:48px;border:2px solid #c29b45"></td>
<td style="padding:20px 22px 12px 0" valign="top">
<img src="${imgBase}sig-name.png" alt="Phillip Williams, REALTOR®" height="40" style="display:block;height:40px;width:auto;border:0">
<div style="font:600 11px Arial,sans-serif;letter-spacing:2px;color:#b08a33;margin:6px 0 10px 0">REAL ESTATE STRATEGIST &nbsp;|&nbsp; <span style="letter-spacing:.5px">eXp Realty</span></div>
<div style="font:13px/1.7 Arial,sans-serif;color:#1b2a40"><span style="color:#b08a33">T</span>&nbsp; <a href="tel:+16232923737" style="color:#1b2a40;text-decoration:none">(623) 292-3737</a><br><span style="color:#b08a33">E</span>&nbsp; <a href="mailto:phillip.a.williams@exprealty.com" style="color:#1b2a40;text-decoration:none">phillip.a.williams@exprealty.com</a><br><span style="color:#b08a33">W</span>&nbsp; <a href="https://phillipknowsaz.com" style="color:#1b2a40;text-decoration:none">phillipknowsaz.com</a></div></td></tr>
<tr><td colspan="2" style="padding:0 22px 14px 22px"><table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0a1a30;border-collapse:collapse"><tr>
<td style="padding:13px 18px;font:italic 500 16px Georgia,serif;color:#ffffff">Author of <span style="color:#e3c37d">The Surprise Advantage</span><div style="font:12px Arial,sans-serif;color:#cfd6e2;margin-top:3px;font-style:normal">Understand the market before you make the move.</div></td>
<td style="padding:13px 18px" align="right"><a href="https://bookastrategycallwithphillip.com" style="background:#c29b45;color:#0a1a30;font:700 11px Arial,sans-serif;letter-spacing:1.5px;text-decoration:none;padding:11px 16px;display:inline-block">BOOK A CONVERSATION</a></td></tr></table></td></tr>
<tr><td colspan="2" style="padding:0 22px 16px 22px"><table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse"><tr>
<td valign="middle" width="1"><img src="${imgBase}pw-logo.png" alt="Phillip Williams Real Estate Group" height="44" style="display:block;height:44px;width:auto;border:0"></td>
<td valign="middle" style="padding:0 14px" width="1"><div style="width:1px;height:34px;background:#c29b45"></div></td>
<td valign="middle" width="1">${expImg}</td>
<td valign="middle" align="right" style="font:10px/1.5 Arial,sans-serif;color:#5b6677">Arizona real estate license SA657637000<br>Phillip Williams Real Estate Group | Brokered by eXp Realty</td>
<td valign="middle" width="1" style="padding-left:12px"><img src="${imgBase}eho.png" alt="Equal Housing Opportunity" height="28" style="display:block;height:28px;width:auto;border:0"></td>
</tr></table></td></tr></table>`;
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ deviceScaleFactor: 3 });
  const w = (f, html) => { const p = path.join(SRC, f); fs.writeFileSync(p, html); return p; };
  const open = async (file) => { const pg = await ctx.newPage(); await pg.goto('file://' + file); await pg.evaluate(() => document.fonts.ready); return pg; };
  // name wordmark for the signature (transparent PNG)
  let f = w('name.html', page(`<div id=n class="serif" style="display:inline-block;font-size:44px;font-weight:600;color:#0a1a30;padding:2px 4px;line-height:1.1;white-space:nowrap">Phillip Williams<span style="font-size:15px;vertical-align:super;margin-left:3px;color:#b08a33;font-family:Manrope;font-weight:700">REALTOR&reg;</span></div>`, 'body{background:transparent}'));
  let pg = await open(f);
  await (await pg.$('#n')).screenshot({ path: path.join(ROOT, 'assets', 'sig-name.png'), omitBackground: true });
  await pg.close();
  const shots = {};
  for (const v of [A, B]) {
    for (const [name, html, w2, h2, pdf] of [
      ['letterhead', letterhead(v, false), 816, 1056, '8.5in|11in'],
      ['letterhead-sample', letterhead(v, true), 816, 1056, '8.5in|11in'],
      ['card-front', cardFront(v), 360, 216, '3.75in|2.25in'],
      ['card-back', cardBack(v), 360, 216, '3.75in|2.25in'],
      ['prelisting-cover', cover(v), 816, 1056, '8.5in|11in'],
    ]) {
      const file = w(`${name}-${v.id}.html`, html);
      pg = await open(file);
      await pg.setViewportSize({ width: w2, height: h2 });
      const png = path.join(OUT, `${name}-${v.id}.png`);
      await pg.screenshot({ path: png, clip: { x: 0, y: 0, width: w2, height: h2 } });
      const [pw_, ph_] = pdf.split('|');
      await pg.pdf({ path: path.join(OUT, `${name}-${v.id}.pdf`), width: pw_, height: ph_, printBackground: true, pageRanges: '1' });
      await pg.close();
      shots[`${name}-${v.id}`] = png;
    }
    // signature
    const sigHtml = signature(v);
    const file = w(`signature-${v.id}.html`, page(`<div style="padding:24px;background:#fff;width:690px">${sigHtml}</div>`));
    pg = await open(file);
    const el = await pg.$('table');
    await el.screenshot({ path: path.join(OUT, `signature-${v.id}.png`) });
    await pg.close();
    fs.writeFileSync(path.join(OUT, `signature-${v.id}.html`), `<!-- Paste into HighLevel / your email app. Images must be hosted: replace each src="../assets/..." with your uploaded media URL. -->\n` + signature(v, 'ASSETS_URL/'));
    shots[`signature-${v.id}`] = path.join(OUT, `signature-${v.id}.png`);
  }
  await b.close();
  fs.writeFileSync(path.join(SRC, 'shots.json'), JSON.stringify(shots, null, 1));
  console.log('built', Object.keys(shots).length, 'luxury logo present:', hasLux);
})();
