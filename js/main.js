(function () {
  const WHATSAPP_NUMBER = '923331187141';

  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const toggleIcon = toggle.querySelector('use');

  function setNav(open) {
    nav.classList.toggle('is-open', open);
    toggle.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggleIcon.setAttribute('href', open ? '#i-close' : '#i-menu');
  }

  toggle.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) setNav(false);
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setNav(false); });

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const links = document.querySelectorAll('.nav__link');
  const sections = [...links]
    .filter((l) => l.getAttribute('href').startsWith('#'))
    .map((l) => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));

    const revealEls = document.querySelectorAll('.feature, .dept, .doc, .gallery__item, .review, .faq__item, .about__media, .form');
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveal.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => { el.classList.add('reveal'); reveal.observe(el); });
  }

  const form = document.getElementById('apptForm');
  const errorBox = document.getElementById('formError');
  const dateInput = document.getElementById('fDate');
  const deptSelect = document.getElementById('fDept');

  if (!form || !errorBox || !dateInput || !deptSelect) return;

  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  dateInput.min = today.toISOString().slice(0, 10);

  document.querySelectorAll('[data-doctor]').forEach((btn) => {
    btn.addEventListener('click', () => { deptSelect.value = btn.dataset.doctor; });
  });

  form.addEventListener('input', (e) => {
    const field = e.target.closest('.field');
    if (field && e.target.checkValidity()) field.classList.remove('is-invalid');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstInvalid = null;
    form.querySelectorAll('input, select, textarea').forEach((el) => {
      const ok = el.checkValidity();
      el.closest('.field').classList.toggle('is-invalid', !ok);
      if (!ok && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid) {
      errorBox.textContent = firstInvalid.id === 'fPhone'
        ? 'Please enter a valid mobile number, e.g. 0300-1234567.'
        : 'Please fill in all required fields.';
      errorBox.hidden = false;
      firstInvalid.focus();
      return;
    }
    errorBox.hidden = true;

    const data = new FormData(form);
    const lines = [
      'Assalam o Alaikum, I would like to book an appointment at Gujranwala Medical Complex.',
      '',
      'Name: ' + data.get('name').trim(),
      'Phone: ' + data.get('phone').trim(),
      'Department/Doctor: ' + data.get('department'),
      'Preferred date: ' + data.get('date')
    ];
    const msg = data.get('message').trim();
    if (msg) lines.push('Message: ' + msg);

    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
