#!/usr/bin/env node
// Public-launch gate. Exits 1 while any pending marker remains in site/.
// Markers: data-pending="..." attributes, and the literal tokens PENDING-OWNER / TODO-OWNER.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const hits = [];
const approvals = JSON.parse(readFileSync(join(root, '..', 'OWNER_APPROVALS.json'), 'utf8'));
for (const [k, v] of Object.entries(approvals)) if (!k.startsWith('_') && v !== true) hits.push(`owner approval missing: ${k}`);
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(html|js|css|json)$/.test(f)) {
      readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
        if (/data-pending=|PENDING-OWNER|TODO-OWNER/.test(line)) hits.push(`${p.replace(root + '/', '')}:${i + 1}  ${line.trim().slice(0, 110)}`);
      });
    }
  }
};
walk(root);
for (const req of ['index.html','book/index.html','about/index.html','request-copy/index.html','privacy/index.html','reader/index.html','market-update/index.html','unsubscribe/index.html','reader/seller-checklist/index.html','reader/buyer-questions/index.html','reader/relocation-checklist/index.html','reader/investor-worksheet/index.html']) {
  try { statSync(join(root, req)); } catch { hits.push(`missing required page: ${req}`); }
}
if (hits.length) {
  console.error(`NOT READY FOR PUBLIC LAUNCH — ${hits.length} pending item(s):\n` + hits.join('\n'));
  process.exit(1);
}
console.log('No pending markers found. (Owner approval and QA are still required — see docs/ACCEPTANCE_CRITERIA.md.)');
