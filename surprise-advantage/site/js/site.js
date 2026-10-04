// Accessible form handling for .api-form. Submissions go only to the same-origin serverless endpoint.
(() => {
  const kindle = document.getElementById('kindle-btn');
  if (kindle) kindle.addEventListener('click', (e) => e.preventDefault());
  document.querySelectorAll('[data-print]').forEach((b) => b.addEventListener('click', () => window.print()));

  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  document.querySelectorAll('form.api-form').forEach((form) => {
    const $ = (id) => form.querySelector('#' + id);
    const params = new URLSearchParams(location.search);
    $('source').value = params.get('src') || params.get('utm_source') || 'direct';
    const msg = $('form-msg');
    const fail = (id, text) => { const e = $(id); if (!e) return false; e.textContent = text; e.hidden = false; return true; };
    const clear = () => form.querySelectorAll('.error').forEach((e) => { e.hidden = true; e.textContent = ''; });

    form.addEventListener('submit', async (e) => {
      e.preventDefault(); clear(); msg.textContent = '';
      const bad = [];
      const need = (field, errId, text) => { if (fail(errId, text)) bad.push(field); };
      const name = $('name'), addr = $('addr'), email = $('email'), ship = $('c-ship'), mail = $('c-email');
      if (name && name.required && !name.value.trim()) need(name, 'name-err', 'Please enter your name.');
      if (email && !EMAIL.test(email.value)) need(email, 'email-err', 'Please enter a valid email address.');
      if (addr && !addr.value.trim()) need(addr, 'addr-err', 'Please enter a mailing address.');
      if (ship && !ship.checked) need(ship, 'c-ship-err', 'Please agree so we can send your copy.');
      if (mail && mail.required && !mail.checked) need(mail, 'c-email-err', 'Please tick the box to receive updates.');
      if (bad.length) { bad[0].focus(); return; }

      const fd = new FormData(form);
      const data = Object.fromEntries(fd);
      data.interest = fd.getAll('interest');
      const btn = $('submit-btn'); btn.disabled = true;
      try {
        const r = await fetch(form.dataset.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const j = await r.json().catch(() => ({}));
        msg.textContent = j.message || (r.ok ? 'Thank you.' : 'Something went wrong. Please try again, or email phillip.a.williams@exprealty.com.');
        if (r.ok) form.reset();
      } catch { msg.textContent = 'Something went wrong. Please check your connection and try again.'; }
      finally { btn.disabled = false; }
    });
  });
})();
