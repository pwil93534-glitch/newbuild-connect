// Accessible form handling. No data leaves the browser unless data-endpoint is set by an approved deploy.
(() => {
  const $ = (id) => document.getElementById(id);
  const kindle = $('kindle-btn');
  if (kindle) kindle.addEventListener('click', (e) => e.preventDefault());

  const form = $('copy-form');
  if (!form) return;
  const params = new URLSearchParams(location.search);
  $('source').value = params.get('src') || params.get('utm_source') || 'direct';

  const err = (id, msg) => { const el = $(id); el.textContent = msg; el.hidden = !msg; return !!msg; };
  const ready = !!form.dataset.endpoint;
  if (ready) $('form-offline').hidden = true;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('form-msg'); msg.textContent = '';
    if (!ready) { msg.textContent = 'Requests are not being accepted yet.'; return; }
    const bad = [
      err('name-err', $('name').value.trim() ? '' : 'Please enter your name.') && $('name'),
      err('email-err', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('email').value) ? '' : 'Please enter a valid email address.') && $('email'),
      err('addr-err', $('addr').value.trim() ? '' : 'Please enter a mailing address.') && $('addr'),
      err('c-ship-err', $('c-ship').checked ? '' : 'Please agree so we can send your copy.') && $('c-ship'),
    ].filter(Boolean);
    if (bad.length) { bad[0].focus(); return; }
    $('submitted_at').value = new Date().toISOString();
    const data = Object.fromEntries(new FormData(form));
    data.interest = new FormData(form).getAll('interest');
    $('submit-btn').disabled = true;
    try {
      const r = await fetch(form.dataset.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error(String(r.status));
      form.reset(); msg.textContent = 'Thank you. Your request was received.';
    } catch { msg.textContent = 'Something went wrong. Please try again, or email phillip.a.williams@exprealty.com.'; }
    finally { $('submit-btn').disabled = false; }
  });
})();
