// Vacation Istria – menu
(() => {
  const btn = document.querySelector('.menu-btn');
  if (btn) btn.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    btn.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.sub-toggle').forEach((t) => t.addEventListener('click', () => {
    const li = t.closest('.has-sub');
    const open = li.classList.toggle('open');
    t.setAttribute('aria-expanded', open);
  }));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.has-sub.open').forEach((li) => { li.classList.remove('open'); li.querySelector('.sub-toggle').setAttribute('aria-expanded', 'false'); });
    if (document.body.classList.contains('nav-open')) { document.body.classList.remove('nav-open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
  });
})();
// YouTube: load the player only when someone clicks
document.querySelectorAll('.yt-play').forEach((b) => b.addEventListener('click', () => {
  const box = b.parentElement, id = box.dataset.id;
  const f = document.createElement('iframe');
  f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
  f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
  f.allowFullscreen = true; f.title = b.getAttribute('aria-label') || 'Video';
  box.replaceChildren(f);
}));
// Lightbox for photos in galleries and content
(() => {
  const imgs = [...document.querySelectorAll('main .hero-media img, main .side-photo img, main .aerial-photo img, main .place-grid img, main .marina-photo img, main .gal img, main .pic img, main .wide img')].filter((i) => !i.closest('a'));
  if (!imgs.length) return;
  const lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Photo');
  lb.innerHTML = '<img alt=""><p class="lb-cap"></p><button class="lb-x" aria-label="Close">×</button><button class="lb-prev" aria-label="Previous photo">‹</button><button class="lb-next" aria-label="Next photo">›</button>';
  document.body.append(lb);
  const big = lb.querySelector('img'), cap = lb.querySelector('.lb-cap');
  let cur = 0, last = null;
  const show = (i) => { cur = (i + imgs.length) % imgs.length; const im = imgs[cur]; big.src = (im.srcset ? im.srcset.split(',').pop().trim().split(' ')[0] : im.src); big.alt = im.alt; cap.textContent = im.alt; };
  const open = (i) => { last = document.activeElement; show(i); lb.classList.add('open'); lb.querySelector('.lb-x').focus(); };
  const close = () => { lb.classList.remove('open'); if (last) last.focus(); };
  imgs.forEach((im, i) => { im.classList.add('zoomable'); im.tabIndex = 0; im.addEventListener('click', () => open(i)); im.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(i); }); });
  lb.querySelector('.lb-x').onclick = close;
  lb.querySelector('.lb-prev').onclick = () => show(cur - 1);
  lb.querySelector('.lb-next').onclick = () => show(cur + 1);
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  document.addEventListener('keydown', (e) => { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
  let x0 = null; lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); x0 = null; });
})();
// Forms: sent to our e-mail through formsubmit.co (same as the old site); WhatsApp as an alternative
(() => {
  const EMAIL = 'info@vacation-istria.com', WA = '385977961919';
  document.querySelectorAll('form[data-form]').forEach((form) => {
    const kind = form.dataset.form, res = form.querySelector('.form-result'), btn = form.querySelector('button[type=submit]');
    const tour = form.querySelector('#fTour');
    if (tour) {
      const info = form.querySelector('.tour-info');
      tour.addEventListener('change', () => { const t = tour.selectedOptions[0]?.dataset.info; info.hidden = !t; info.textContent = t || ''; });
      const g = form.querySelector('#fGuests');
      for (let i = 1; i <= 12; i++) g.add(new Option(i, i)); g.add(new Option('12+', '12+')); g.value = '2';
      const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); form.querySelector('#fDate').min = d.toISOString().slice(0, 10);
    }
    const text = () => {
      const f = Object.fromEntries(new FormData(form));
      return kind === 'booking'
        ? `Hello, I would like to book: ${f.tour || '-'}\nDate: ${f.date || '-'}\nGuests: ${f.guests || '-'}\nName: ${f.name || '-'}\nPhone: ${f.phone || '-'}\nEmail: ${f.email || '-'}${f.message ? '\n' + f.message : ''}`
        : `${f.message || ''}\n— ${f.name || ''}`;
    };
    const wa = form.querySelector('.wa-compose');
    if (wa) wa.addEventListener('click', (e) => { e.preventDefault(); window.open(`https://wa.me/${WA}?text=${encodeURIComponent(text())}`, '_blank', 'noopener'); });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('[required]').forEach((el) => { const bad = !el.checkValidity(); el.classList.toggle('invalid', bad); if (bad && ok) { el.focus(); ok = false; } });
      if (!ok) { res.hidden = false; res.className = 'form-result err'; res.textContent = 'Please fill in the marked fields.'; return; }
      btn.disabled = true; const label = btn.textContent; btn.textContent = 'Sending…';
      const data = Object.fromEntries(new FormData(form));
      data._subject = kind === 'booking' ? `Booking request: ${data.tour} (${data.date}, ${data.guests} guests)` : `Comment from ${data.name}`;
      data._template = 'table'; data._captcha = 'false'; data.source_page = location.href;
      if (kind === 'booking') data.consent_given_at = new Date().toISOString();
      try {
        const r = await fetch(`https://formsubmit.co/ajax/${EMAIL}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        const j = await r.json();
        if (!r.ok || String(j.success) !== 'true') throw new Error();
        form.querySelectorAll('.field, .field-row, .check, .actions, .form-note').forEach((el) => el.hidden = true);
        res.hidden = false; res.className = 'form-result';
        res.textContent = kind === 'booking' ? 'Request sent. Thank you — we’ll reply by email or WhatsApp within 24 hours.' : 'Comment sent. Thank you!';
      } catch {
        res.hidden = false; res.className = 'form-result err';
        res.innerHTML = `The message could not be sent. Please try again, or write to us on <a href="https://wa.me/${WA}">WhatsApp</a> or at <a href="mailto:${EMAIL}">${EMAIL}</a>.`;
        btn.disabled = false; btn.textContent = label;
      }
    });
  });
  // Google map loads only after a click
  document.querySelectorAll('.map-load').forEach((b) => b.addEventListener('click', () => {
    const box = b.closest('.map-box'); const f = document.createElement('iframe');
    f.src = box.dataset.map; f.loading = 'lazy'; f.title = 'Map: Riva, Pula'; f.referrerPolicy = 'no-referrer-when-downgrade';
    box.replaceChildren(f);
  }));
})();
