import { handle } from '../lib/core.mjs';
export default async function handler(req, res) {
  const out = await handle({ method: req.method, headers: req.headers, body: req.body, ip: (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown' }, 'market_update', process.env);
  res.setHeader('Cache-Control', 'no-store');
  res.status(out.status).json(out.body);
}
