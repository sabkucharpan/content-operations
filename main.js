(() => {
  const root = document.documentElement;
  const header = document.getElementById('siteHeader');
  const navPanel = document.getElementById('navPanel');
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const themeToggle = document.getElementById('themeToggle');
  const toTop = document.getElementById('toTop');
  const pointerGlow = document.getElementById('pointerGlow');

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    try { localStorage.setItem('sp-theme', theme); } catch (_) {}
    themeToggle?.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  };

  themeToggle?.addEventListener('click', () => {
    setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  // Scroll state + back-to-top
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle('scrolled', y > 18);
    toTop?.classList.toggle('visible', y > 700);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Mobile navigation
  const setNavOpen = (open) => {
    navPanel?.classList.toggle('open', open);
    mobileNavToggle?.classList.toggle('open', open);
    mobileNavToggle?.setAttribute('aria-expanded', String(open));
    mobileNavToggle?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  };
  mobileNavToggle?.addEventListener('click', () => setNavOpen(!navPanel?.classList.contains('open')));
  navPanel?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setNavOpen(false)));
  document.addEventListener('click', (e) => {
    if (!navPanel?.classList.contains('open')) return;
    if (!navPanel.contains(e.target) && !mobileNavToggle?.contains(e.target)) setNavOpen(false);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNavOpen(false); });

  // Scroll reveal
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -36px 0px' });
    revealItems.forEach((el) => revealObserver.observe(el));
    // Hero should feel immediate.
    document.querySelectorAll('#hero .reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 120 + i * 90);
    });
  } else {
    revealItems.forEach((el) => el.classList.add('visible'));
  }

  // Active nav highlighting
  const navLinks = [...document.querySelectorAll('.nav-panel a[href^="#"]')];
  const sectionIds = navLinks.map((a) => a.getAttribute('href').slice(1));
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    sections.forEach((section) => navObserver.observe(section));
  }

  // Pointer halo on larger screens.
  if (window.matchMedia('(pointer:fine)').matches && pointerGlow) {
    let raf = 0;
    window.addEventListener('pointermove', (e) => {
      pointerGlow.style.opacity = '.8';
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        pointerGlow.style.left = `${e.clientX}px`;
        pointerGlow.style.top = `${e.clientY}px`;
      });
    });
    window.addEventListener('pointerleave', () => { pointerGlow.style.opacity = '0'; });
  }

  // Case-study slider.
  const track = document.getElementById('sliderTrack');
  const dotsWrap = document.getElementById('sliderDots');
  const slideStatus = document.getElementById('slideStatus');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  const viewport = document.getElementById('sliderViewport');
  if (track && dotsWrap && slideStatus && prevBtn && nextBtn) {
    const slides = [...track.querySelectorAll('.slide')];
    let current = 0;
    let startX = null;

    dotsWrap.innerHTML = '';
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'slider-dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Show case study ${index + 1}`);
      dot.addEventListener('click', () => goTo(index));
      dotsWrap.appendChild(dot);
    });

    const dots = [...dotsWrap.querySelectorAll('.slider-dot')];
    const update = () => {
      track.style.transform = `translate3d(-${current * 100}%, 0, 0)`;
      slideStatus.textContent = `${String(current + 1).padStart(2, '0')} of ${String(slides.length).padStart(2, '0')}`;
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === current);
        dot.setAttribute('aria-current', index === current ? 'true' : 'false');
      });
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === slides.length - 1;
    };
    const goTo = (index) => {
      current = Math.max(0, Math.min(index, slides.length - 1));
      update();
    };
    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));
    viewport?.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    viewport?.addEventListener('touchend', (e) => {
      if (startX == null) return;
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 45) goTo(current + (diff > 0 ? 1 : -1));
      startX = null;
    }, { passive: true });
    document.addEventListener('keydown', (e) => {
      const projects = document.getElementById('projects');
      if (!projects) return;
      const rect = projects.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * .8 && rect.bottom > window.innerHeight * .2;
      if (!inView) return;
      if (e.key === 'ArrowRight') goTo(current + 1);
      if (e.key === 'ArrowLeft') goTo(current - 1);
    });
    update();
  }

  // Contact form: validate, then hand off to the visitor's email client.
  const form = document.getElementById('contactForm');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const name = document.getElementById('cf_name')?.value.trim();
    const email = document.getElementById('cf_email')?.value.trim();
    const company = document.getElementById('cf_company')?.value.trim();
    const type = document.getElementById('cf_type')?.value;
    const timeline = document.getElementById('cf_timeline')?.value;
    const message = document.getElementById('cf_message')?.value.trim();

    const body = [
      `Hi Samarpan,`, '', message, '', '---',
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company || 'Not provided'}`,
      `Work Type: ${type || 'Not specified'}`,
      `Timeline: ${timeline || 'Not specified'}`
    ].join('\n');
    window.location.href = `mailto:panchalsamarpan@gmail.com?subject=${encodeURIComponent(`Portfolio inquiry from ${name}`)}&body=${encodeURIComponent(body)}`;
  });

  // Copy email helper.
  const copyButton = document.getElementById('copyEmail');
  copyButton?.addEventListener('click', async () => {
    const email = 'panchalsamarpan@gmail.com';
    const label = copyButton.querySelector('span');
    try {
      await navigator.clipboard.writeText(email);
      label.textContent = 'Email copied';
      setTimeout(() => { label.textContent = 'Copy email'; }, 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  });
})();
