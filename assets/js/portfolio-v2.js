(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const qs = (s, r=document) => r.querySelector(s);
  const qsa = (s, r=document) => [...r.querySelectorAll(s)];
  const clamp = (n,min=0,max=1) => Math.min(max,Math.max(min,n));

  const toggle = qs('.menu-toggle');
  const mobile = qs('.mobile-nav');
  if (toggle && mobile) {
    toggle.addEventListener('click', () => {
      const open = mobile.classList.toggle('open');
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    qsa('a', mobile).forEach(a => a.addEventListener('click', () => {
      mobile.classList.remove('open');
      document.body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const track = qs('[data-motion-word]');
  const flowRows = qsa('[data-flow-row]');
  let state = 0;
  const states = flowRows.length || 4;
  function setState(next) {
    state = next % states;
    if (track) track.style.transform = `translateY(-${state * 106}px)`;
    flowRows.forEach((row,i) => row.classList.toggle('active', i === state));
  }
  setState(0);
  if (!reduce && states > 1) setInterval(() => setState(state + 1), 2200);

  const heroStage = qs('[data-hero-stage]');
  const heroFrame = qs('[data-hero-frame]');
  const caseShell = qs('[data-cases-shell]');
  const cards = qsa('[data-case-card]');
  const counter = qs('[data-case-counter]');

  function updateHero() {
    if (!heroStage || !heroFrame || reduce || innerWidth < 761) return;
    const rect = heroStage.getBoundingClientRect();
    const travel = Math.max(1, heroStage.offsetHeight - innerHeight);
    const p = clamp(-rect.top / travel);
    const scale = 1 - p * .047;
    heroFrame.style.transform = `scale(${scale})`;
    heroFrame.style.borderRadius = `${p * 30}px`;
  }

  function updateCases() {
    if (!caseShell || !cards.length || reduce || innerWidth < 761) return;
    const rect = caseShell.getBoundingClientRect();
    const travel = Math.max(1, caseShell.offsetHeight - innerHeight);
    const p = clamp(-rect.top / travel);
    const indexFloat = p * (cards.length - 1);
    const active = Math.round(indexFloat);
    if (counter) counter.textContent = String(active + 1).padStart(2,'0');
    cards.forEach((card,i) => {
      const d = i - indexFloat;
      const y = d * 46;
      const z = -Math.abs(d) * 180;
      const rx = d * -3.4;
      const scale = 1 - Math.min(Math.abs(d) * .065,.2);
      const opacity = clamp(1 - Math.abs(d) * .36,.08,1);
      card.style.transform = `translate3d(0, calc(-50% + ${y}%), ${z}px) rotateX(${rx}deg) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex = String(100 - Math.round(Math.abs(d) * 10));
    });
  }

  let ticking = false;
  function frame() {
    updateHero();
    updateCases();
    ticking = false;
  }
  function requestFrame() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(frame);
  }
  addEventListener('scroll', requestFrame, {passive:true});
  addEventListener('resize', requestFrame);
  requestFrame();

  const reveals = qsa('[data-reveal]');
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      });
    }, {threshold:.16});
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }
})();