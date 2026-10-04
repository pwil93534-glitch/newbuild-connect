// QR short links: /q/<slug> -> destination in qr-destinations.json. Retarget by editing the JSON; printed QR codes never change.
import { readFileSync } from 'node:fs';
const map = JSON.parse(readFileSync(new URL('../qr-destinations.json', import.meta.url), 'utf8'));
export default function handler(req, res) {
  const slug = String(req.query?.slug || '').toLowerCase();
  const dest = map[slug];
  res.setHeader('Cache-Control', 'no-store');
  if (!dest || slug.startsWith('_')) { res.status(404).send('Not found'); return; }
  res.redirect(302, dest);
}
