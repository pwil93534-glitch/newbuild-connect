#!/usr/bin/env node
// Fails if credential-looking strings appear in tracked project files (and, with --history, in git history of this folder).
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const re = /(pit-[0-9a-f-]{20,}|sk-[A-Za-z0-9_-]{20,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}|Bearer\s+[A-Za-z0-9._-]{20,}|(?:API_KEY|TOKEN|SECRET)\s*=\s*[A-Za-z0-9._-]{12,})/;
const files = execSync('git ls-files -co --exclude-standard .', { encoding: 'utf8' }).split('\n').filter((f) => f && !f.endsWith('secret-scan.mjs'));
const bad = [];
for (const f of files) { try { if (re.test(readFileSync(f, 'utf8'))) bad.push(f); } catch {} }
if (process.argv.includes('--history')) {
  const log = execSync('git log -p --all -- .', { encoding: 'utf8', maxBuffer: 1 << 28 });
  if (re.test(log)) bad.push('(git history)');
}
if (bad.length) { console.error('Possible secrets in:', bad.join(', ')); process.exit(1); }
console.log(`Secret scan clean (${files.length} files${process.argv.includes('--history') ? ' + history' : ''}).`);
