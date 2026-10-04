import test from 'node:test';
import assert from 'node:assert/strict';
import { handle, validate, buildContact, _resetRateLimit } from '../lib/core.mjs';

const env = { FORM_ENABLED: 'true', HIGHLEVEL_API_KEY: 'k', HIGHLEVEL_LOCATION_ID: 'loc', FORM_ALLOWED_ORIGIN: 'https://ok.example' };
const req = (body, o = {}) => ({ method: 'POST', headers: { origin: 'https://ok.example' }, body, ip: o.ip || '1.1.1.1' });
const good = { name: 'Ann Lee', email: 'Ann@Example.com', address: '1 Main St', consent_fulfilment: true, interest: ['buyer'], source: 'qr-reader' };
const okFetch = (log) => async (url, init) => { log.push({ url, init }); return { ok: true }; };
test.beforeEach(_resetRateLimit);

test('disabled until FORM_ENABLED=true', async () => {
  const r = await handle(req(good), 'copy_request', { ...env, FORM_ENABLED: 'false' }, okFetch([]));
  assert.equal(r.status, 503);
});
test('missing credentials -> 503, no CRM call', async () => {
  const log = []; const r = await handle(req(good), 'copy_request', { ...env, HIGHLEVEL_API_KEY: '' }, okFetch(log));
  assert.equal(r.status, 503); assert.equal(log.length, 0);
});
test('wrong origin rejected', async () => {
  const r = await handle({ ...req(good), headers: { origin: 'https://evil.example' } }, 'copy_request', env, okFetch([]));
  assert.equal(r.status, 403);
});
test('requires fulfilment consent', async () => {
  const r = await handle(req({ ...good, consent_fulfilment: false }), 'copy_request', env, okFetch([]));
  assert.equal(r.status, 400);
});
test('interest does NOT imply marketing consent', () => {
  const c = buildContact('copy_request', validate('copy_request', good).data, env, new Date('2026-10-05'));
  assert.ok(c.tags.includes('buyer-interest'));
  assert.ok(!c.tags.includes('consent-email') && !c.tags.includes('consent-sms'));
});
test('explicit consent is tagged; source and date captured', () => {
  const d = validate('copy_request', { ...good, consent_email: true }).data;
  const c = buildContact('copy_request', d, env, new Date('2026-10-05T12:00:00Z'));
  assert.ok(c.tags.includes('consent-email') && c.tags.includes('source:qr-reader') && c.tags.includes('submitted:2026-10-05'));
  assert.equal(c.email, 'ann@example.com');
});
test('market_update requires email consent', async () => {
  assert.equal((await handle(req({ email: 'a@b.co' }), 'market_update', env, okFetch([]))).status, 400);
});
test('unsubscribe sets DND + suppression tag, never adds consent', () => {
  const c = buildContact('unsubscribe', validate('unsubscribe', { email: 'a@b.co', consent_email: true }).data, env);
  assert.equal(c.dnd, true); assert.ok(c.tags.includes('suppressed')); assert.ok(!c.tags.includes('consent-email'));
});
test('honeypot stores nothing', async () => {
  const log = []; const r = await handle(req({ ...good, website: 'spam' }), 'copy_request', env, okFetch(log));
  assert.equal(r.status, 200); assert.equal(log.length, 0);
});
test('valid submit goes server-side to HighLevel with bearer; key not in response', async () => {
  const log = []; const r = await handle(req(good), 'copy_request', env, okFetch(log));
  assert.equal(r.status, 200); assert.match(log[0].url, /contacts\/upsert$/); assert.equal(log[0].init.headers.Authorization, 'Bearer k');
  assert.ok(!JSON.stringify(r).includes('Bearer'));
});
test('CRM failure -> 502 without leaking detail', async () => {
  const r = await handle(req(good), 'copy_request', env, async () => ({ ok: false, status: 401 }));
  assert.equal(r.status, 502); assert.ok(!JSON.stringify(r).includes('401'));
});
test('rate limit', async () => {
  const e = { ...env, FORM_RATE_LIMIT_PER_HOUR: '2' };
  for (let i = 0; i < 2; i++) await handle(req(good), 'copy_request', e, okFetch([]));
  assert.equal((await handle(req(good), 'copy_request', e, okFetch([]))).status, 429);
});
test('markup stripped from input', () => {
  assert.ok(!validate('copy_request', { ...good, name: '<b>Ann</b>' }).data.name.includes('<'));
});
