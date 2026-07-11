/* ============================================================
   SAMARPAN PANCHAL — PORTFOLIO
   main.js
   ============================================================ */

/* ---------- SCROLL REVEAL ---------- */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

/* Hero items reveal immediately on load */
document.querySelectorAll('#hero .reveal').forEach((el, i) => {
  setTimeout(() => el.classList.add('visible'), 150 + i * 130);
});

/* ---------- MOBILE NAV ---------- */
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}
document.querySelectorAll('.nav-links a').forEach((a) => {
  a.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
  });
});

/* ---------- CONTACT FORM ---------- */
function handleSubmit(btn) {
  const n  = document.getElementById('cf_name').value.trim();
  const e  = document.getElementById('cf_email').value.trim();
  const c  = document.getElementById('cf_company').value.trim();
  const t  = document.getElementById('cf_type').value;
  const tl = document.getElementById('cf_timeline').value;
  const m  = document.getElementById('cf_message').value.trim();

  if (!n || !e || !m) {
    btn.textContent = 'Please fill Name, Email & Message';
    setTimeout(() => (btn.textContent = 'Send Message →'), 2500);
    return;
  }

  const body =
    'Hi Samarpan,\n\n' + m +
    '\n\n---' +
    '\nName: '     + n +
    '\nEmail: '    + e +
    '\nCompany: '  + (c  || 'Not provided') +
    '\nWork Type: '+ (t  || 'Not specified') +
    '\nTimeline: ' + (tl || 'Not specified');

  window.location.href =
    'mailto:panchalsamarpan@gmail.com?subject=' +
    encodeURIComponent('Portfolio Inquiry from ' + n) +
    '&body=' +
    encodeURIComponent(body);
}

/* ══════════════════════════════════════
   PROJECT SLIDER
══════════════════════════════════════ */
(function () {
  const track   = document.getElementById('sliderTrack');
  const dotsWrap = document.getElementById('sliderDots');
  const numEl   = document.getElementById('slideNum');
  const totEl   = document.getElementById('slideTotal');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  if (!track) return;

  const slides = track.querySelectorAll('.slide');
  const total  = slides.length;
  let current  = 0;

  totEl.textContent = total;

  // Build dots
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'slider-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', 'Slide ' + (i + 1));
    d.onclick = () => goTo(i);
    dotsWrap.appendChild(d);
  });

  function goTo(n) {
    current = Math.max(0, Math.min(n, total - 1));
    track.style.transform = `translateX(-${current * 100}%)`;
    numEl.textContent = current + 1;
    dotsWrap.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
  }

  goTo(0);

  // Touch/swipe support
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
  });

  // Expose globally for inline onclick
  window.sliderMove = (dir) => goTo(current + dir);
})();
