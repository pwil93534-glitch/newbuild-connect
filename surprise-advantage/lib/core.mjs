// Platform-neutral, dependency-free form handler. All CRM access happens here, server-side only.
const HL_BASE = 'https://services.leadconnectorhq.com';
const INTEREST_TAGS = { buyer: 'buyer-interest', seller: 'seller-interest', relocation: 'relocation-interest', investor: 'investor-interest' };
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const hits = new Map(); // best-effort per-instance rate limit; a durable limiter is a hosting-phase item

export const FORMS = {
  copy_request: { needs: ['name', 'email', 'address', 'consent_fulfilment'], tags: ['book-reader', 'complimentary-copy-request'] },
  market_update: { needs: ['email', 'consent_email'], tags: ['market-update-subscriber'] },
  unsubscribe: { needs: ['email'], tags: ['unsubscribe-request'] },
};

const clean = (v, max = 300) => String(v ?? '').replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, max);
const bool = (v) => v === true || v === 'true' || v === 'on';

export function validate(type, raw = {}) {
  const form = FORMS[type];
  if (!form) return { error: 'Unknown form.' };
  const d = {
    name: clean(raw.name, 120), email: clean(raw.email, 320).toLowerCase(), address: clean(raw.address, 400),
    source: clean(raw.source, 80) || 'direct',
    consent_fulfilment: bool(raw.consent_fulfilment), consent_email: bool(raw.consent_email), consent_sms: bool(raw.consent_sms),
    interest: (Array.isArray(raw.interest) ? raw.interest : []).filter((i) => i in INTEREST_TAGS),
  };
  for (const k of form.needs) if (!d[k]) return { error: `Missing or unconfirmed: ${k}` };
  if (!EMAIL_RE.test(d.email)) return { error: 'Invalid email.' };
  return { data: d };
}

export function buildContact(type, d, env, now = new Date()) {
  const tags = [...FORMS[type].tags, ...d.interest.map((i) => INTEREST_TAGS[i])];
  // Interest is segmentation only. Marketing eligibility comes ONLY from explicit consent tags.
  if (type !== 'unsubscribe') {
    if (d.consent_email) tags.push('consent-email');
    if (d.consent_sms) tags.push('consent-sms');
  }
  tags.push(`source:${d.source}`, `submitted:${now.toISOString().slice(0, 10)}`);
  const [firstName, ...rest] = d.name.split(/\s+/).filter(Boolean);
  const c = { locationId: env.HIGHLEVEL_LOCATION_ID, email: d.email, source: `Surprise Advantage / ${d.source}`, tags };
  if (firstName) c.firstName = firstName;
  if (rest.length) c.lastName = rest.join(' ');
  if (d.address) c.address1 = d.address;
  if (type === 'unsubscribe') {
    c.dnd = true; // suppress everything; marketing workflows must also exclude DND + the suppression tag
    tags.push(env.SUPPRESSION_LIST_TAG || 'suppressed');
  }
  return c;
}

export async function handle({ method, headers = {}, body, ip = 'unknown' }, type, env, fetchImpl = fetch, now = new Date()) {
  const res = (status, msg) => ({ status, body: { ok: status < 300, message: msg } });
  if (method !== 'POST') return res(405, 'Method not allowed.');
  if (env.FORM_ENABLED !== 'true') return res(503, 'Requests are not being accepted yet.');
  if (!env.HIGHLEVEL_API_KEY || !env.HIGHLEVEL_LOCATION_ID || !env.FORM_ALLOWED_ORIGIN) return res(503, 'Requests are not being accepted yet.');
  if (headers.origin !== env.FORM_ALLOWED_ORIGIN) return res(403, 'Forbidden.');
  const max = Number(env.FORM_RATE_LIMIT_PER_HOUR || 10);
  const bucket = (hits.get(ip) || []).filter((t) => now - t < 3600e3);
  if (bucket.length >= max) return res(429, 'Too many requests. Please try again later.');
  hits.set(ip, [...bucket, +now]);
  let raw = body;
  if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch { return res(400, 'Bad request.'); } }
  if (raw && raw.website) return res(200, 'Thank you.'); // honeypot: pretend success, store nothing
  const v = validate(type, raw);
  if (v.error) return res(400, v.error);
  try {
    const r = await fetchImpl(`${HL_BASE}/contacts/upsert`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.HIGHLEVEL_API_KEY}`, Version: '2021-07-28', 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(buildContact(type, v.data, env, now)),
    });
    if (!r.ok) return res(502, 'We could not save your request. Please try again or email us.');
  } catch { return res(502, 'We could not save your request. Please try again or email us.'); }
  return res(200, type === 'unsubscribe' ? 'You have been unsubscribed.' : 'Thank you. Your request was received.');
}

export const _resetRateLimit = () => hits.clear();
