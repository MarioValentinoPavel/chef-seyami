/* Chef Seyami · espuma de cezve, bandeja de cobre giratoria, kahve falı con poso generado */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  const D = window.I18N;
  let LANG = 'fr';
  const L = (fr, es) => (LANG === 'es' ? es : fr);
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { } } };

  /* ---------- bandeja giratoria ---------- */
  const wheel = $('#wheel');
  wheel.innerHTML = D.dial.map((p, i) => `<button class="plate" type="button" data-i="${i}" aria-label="${p[1]}"><img src="assets/img/${p[0]}.jpg" alt="${p[1]}" width="640" height="640"></button>`).join('');
  const plates = $$('.plate', wheel);
  const isMobile = () => matchMedia('(max-width: 980px)').matches;
  let step = 0, rot = { v: 0 }, userTouched = false;
  function placePlates() {
    const base = isMobile() ? 90 : 0;
    plates.forEach((p, i) => (p.style.transform = `rotate(${base + i * 60}deg) translateX(calc(var(--D) * -.355)) rotate(${-(base + i * 60)}deg)`));
  }
  function paintDial() {
    const n = ((step % 6) + 6) % 6;
    plates.forEach((p, i) => p.classList.toggle('is-on', i === n));
    const d = D.dial[n];
    $('#dialTr').textContent = d[1];
    $('#dialFr').textContent = L(d[2], d[3]);
  }
  function goStep(s, instant) {
    step = s;
    paintDial();
    const target = -step * 60;
    if (!hasGsap || REDUCE || instant) { rot.v = target; wheel.style.transform = `rotate(${target}deg)`; return; }
    gsap.to(rot, { v: target, duration: 1, ease: 'expo.out', onUpdate: () => (wheel.style.transform = `rotate(${rot.v}deg)`) });
    gsap.fromTo('.dialinfo > *', { y: 10, opacity: 0, filter: 'blur(4px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: 'expo.out', stagger: 0.05 });
  }
  $('#dialNext').addEventListener('click', () => { userTouched = true; goStep(step + 1); });
  $('#dialPrev').addEventListener('click', () => { userTouched = true; goStep(step - 1); });
  wheel.addEventListener('click', (e) => {
    const p = e.target.closest('.plate');
    if (!p) return;
    userTouched = true;
    const i = +p.dataset.i, n = ((step % 6) + 6) % 6;
    let diff = i - n; if (diff > 3) diff -= 6; if (diff < -3) diff += 6;
    goStep(step + diff);
  });
  // arrastrar para girar
  let drag = null;
  wheel.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') return; drag = { x: e.clientX, y: e.clientY, s: step }; });
  addEventListener('pointerup', (e) => {
    if (!drag) return;
    const dy = isMobile() ? e.clientX - drag.x : e.clientY - drag.y;
    if (Math.abs(dy) > 40) { userTouched = true; goStep(drag.s + (dy < 0 ? 1 : -1) * Math.max(1, Math.round(Math.abs(dy) / 160))); }
    drag = null;
  });
  setInterval(() => { if (!userTouched && !document.hidden) goStep(step + 1); }, 4500);
  addEventListener('resize', placePlates);

  /* ---------- listas ---------- */
  function renderLists() {
    $('#kebabs').innerHTML = D.kebabs.map(([img, tr, fr, es]) => `<li class="kb"><img src="assets/img/${img}.jpg" alt="${tr}" loading="lazy" width="640" height="640"><p>${L(fr, es)}</p></li>`).join('');
    $('#mezze').innerHTML = D.mezze.map(([img, tr, fr, es, drink]) => `<li class="mz${drink ? ' mz--drink' : ''}"><img src="assets/img/${img}.jpg" alt="${tr}" loading="lazy"><b>${tr}</b><span>${L(fr, es)}</span></li>`).join('');
    $('#quotes').innerHTML = D.quotes[LANG].map(([q, w]) => `<figure><p>${LANG === 'fr' ? '« ' + q + ' »' : '«' + q + '»'}</p><cite>${w}, Google</cite></figure>`).join('');
  }

  /* ---------- idioma ---------- */
  function applyLang(l) {
    LANG = l;
    document.documentElement.lang = l;
    $$('[data-i18n]').forEach((el) => {
      if (el.dataset.fr === undefined) el.dataset.fr = el.innerHTML;
      el.innerHTML = l === 'fr' ? el.dataset.fr : (D.dom[l] && D.dom[l][el.dataset.i18n]) || el.dataset.fr;
    });
    $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
    store.set('cs-lang', l);
    renderLists();
    paintDial();
    if (current) showReading(current, true);
  }
  $$('.lang button').forEach((b) => b.addEventListener('click', () => applyLang(b.dataset.lang)));

  /* ---------- kahve falı ---------- */
  const cup = $('#cup'), canvas = $('#grounds'), ctx = canvas.getContext('2d');
  const sign = $('#sign'), reading = $('#reading');
  let flipped = false, busy = false, current = null, lastIdx = -1;
  function drawGrounds() {
    const W = canvas.width, C = W / 2;
    ctx.clearRect(0, 0, W, W);
    ctx.fillStyle = '#efe6d8'; ctx.fillRect(0, 0, W, W);
    // posos: más densos cerca del borde, manchas grandes y salpicaduras
    for (let i = 0; i < 1400; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = C * Math.pow(Math.random(), 0.45);
      const x = C + Math.cos(a) * r, y = C + Math.sin(a) * r;
      const s = Math.random() < 0.06 ? 4 + Math.random() * 10 : 0.6 + Math.random() * 2.4;
      ctx.globalAlpha = 0.18 + Math.random() * 0.5;
      ctx.fillStyle = Math.random() < 0.5 ? '#3a2214' : '#5b3a22';
      ctx.beginPath(); ctx.ellipse(x, y, s, s * (0.5 + Math.random()), a, 0, Math.PI * 2); ctx.fill();
    }
    for (let k = 0; k < 7; k++) {
      let x = C + (Math.random() - 0.5) * C * 1.4, y = C + (Math.random() - 0.5) * C * 1.4;
      ctx.globalAlpha = 0.22; ctx.fillStyle = '#4a2a17';
      for (let j = 0; j < 40; j++) {
        x += (Math.random() - 0.5) * 18; y += (Math.random() - 0.5) * 18;
        ctx.beginPath(); ctx.arc(x, y, 3 + Math.random() * 7, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }
  function pick() {
    let i; do { i = Math.floor(Math.random() * D.fal.fr.length); } while (i === lastIdx);
    lastIdx = i; return i;
  }
  function showReading(i, silent) {
    const r = D.fal[LANG][i];
    sign.className = `cup__sign ph-fill ${r[0]}`;
    $('#readSign').textContent = r[1];
    $('#readDish').textContent = r[3];
    $('#readImg').src = `assets/img/${r[2]}.jpg`;
    $('#readImg').alt = r[3];
    if (silent) return;
    reading.classList.add('is-on');
    if (!hasGsap || REDUCE) { sign.style.opacity = '.85'; reading.style.opacity = '1'; return; }
    gsap.fromTo(sign, { opacity: 0, scale: 0.6, rotate: gsap.utils.random(-40, 40) }, { opacity: 0.85, scale: 1, duration: 1.4, ease: 'expo.out' });
    gsap.fromTo(reading, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', delay: 0.4 });
  }
  function countdown(n, done) {
    const el = $('#count');
    const ui = D.ui[LANG];
    if (n === 0) { el.textContent = ''; done(); return; }
    el.textContent = `${ui.cool}… ${n}`;
    setTimeout(() => countdown(n - 1, done), REDUCE ? 200 : 800);
  }
  $('#flip').addEventListener('click', () => {
    if (busy) return;
    busy = true;
    const label = $('#flip span');
    const go = () => {
      drawGrounds();
      sign.style.opacity = '0';
      cup.classList.add('is-flipped');
      flipped = true;
      setTimeout(() => countdown(3, () => {
        current = pick();
        showReading(current);
        label.textContent = D.ui[LANG].again;
        busy = false;
      }), REDUCE ? 50 : 1000);
    };
    if (flipped) {
      cup.classList.remove('is-flipped');
      if (hasGsap) gsap.to(reading, { opacity: 0, y: 10, duration: 0.3 });
      setTimeout(go, REDUCE ? 50 : 1000);
    } else go();
  });

  /* ---------- espuma de entrada ---------- */
  function foamIntro(done) {
    const c = $('#foam'), g = c.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = innerWidth, H = innerHeight;
    c.width = W * dpr; c.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bubbles = Array.from({ length: 140 }, () => ({ x: Math.random() * W, r: 3 + Math.random() * 16, o: Math.random() * 40, s: 0.6 + Math.random() }));
    const st = { lvl: 0, ph: 0 };
    const draw = () => {
      g.clearRect(0, 0, W, H);
      const top = H - st.lvl * (H + 80);
      g.fillStyle = '#2a170d';
      g.beginPath(); g.moveTo(0, H);
      for (let x = 0; x <= W; x += 20) g.lineTo(x, top + 26 + Math.sin(x / 70 + st.ph) * 10);
      g.lineTo(W, H); g.closePath(); g.fill();
      g.fillStyle = '#c99764';
      g.beginPath(); g.moveTo(0, top + 40);
      for (let x = 0; x <= W; x += 20) g.lineTo(x, top + Math.sin(x / 90 + st.ph * 1.3) * 14);
      g.lineTo(W, top + 40); g.closePath(); g.fill();
      for (const b of bubbles) {
        const y = top + 8 + b.o * 0.6 + Math.sin(st.ph * b.s + b.x) * 4;
        g.globalAlpha = 0.55; g.fillStyle = '#e8c79f';
        g.beginPath(); g.arc(b.x, y, b.r * 0.6, 0, Math.PI * 2); g.fill();
        g.globalAlpha = 1;
      }
    };
    gsap.timeline({ onUpdate: draw, onComplete: () => { c.remove(); done(); } })
      .to(st, { lvl: 1, ph: 6, duration: 1.3, ease: 'power2.inOut' })
      .to(st, { lvl: 0, ph: 12, duration: 1.1, ease: 'power3.in' }, '+=0.15')
      .add(() => document.body.classList.remove('is-locked'), '-=0.6')
      .add(heroIn, '-=0.7');
  }
  function heroIn() {
    if (!hasGsap || REDUCE) return;
    gsap.timeline()
      .from('.hero__title', { yPercent: 30, opacity: 0, duration: 1.2, ease: 'expo.out' })
      .from('.hero__ar, .hero__sub, .hero__cta, .dialinfo', { y: 20, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, '-=0.9')
      .fromTo(rot, { v: 90 }, { v: 0, duration: 1.8, ease: 'expo.out', onUpdate: () => (wheel.style.transform = `rotate(${rot.v}deg)`) }, 0)
      .from('.dial__wheel', { scale: 0.85, opacity: 0, duration: 1.4, ease: 'expo.out' }, 0);
  }

  /* ---------- scroll ---------- */
  function scrollFx() {
    if (!hasGsap || REDUCE) return;
    const nav = $('#nav');
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => { const y = s.scroll(); nav.classList.toggle('is-solid', y > 60); nav.classList.toggle('is-hidden', s.direction === 1 && y > 700); } });
    ScrollTrigger.batch('.kb', { start: 'top 90%', once: true, onEnter: (els) => gsap.from(els, { y: 50, rotate: (i) => (i % 2 ? 3 : -3), opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.06 }) });
    ScrollTrigger.batch('.mz', { start: 'top 92%', once: true, onEnter: (els) => gsap.from(els, { scale: 0.7, opacity: 0, duration: 0.9, ease: 'back.out(1.6)', stagger: 0.05 }) });
    gsap.from('.saucer', { rotate: -90, scale: 0.8, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.fal', start: 'top 70%' } });
    gsap.from('.fal__steps li', { x: -20, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.fal__steps', start: 'top 85%' } });
    gsap.from('.place__a, .place__b', { y: 80, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.15, scrollTrigger: { trigger: '.place', start: 'top 75%' } });
    gsap.from('.visit__big', { yPercent: 40, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.visit', start: 'top 75%' } });
  }

  placePlates();
  const initial = [new URLSearchParams(location.search).get('lang'), store.get('cs-lang'), (navigator.language || '').slice(0, 2)].find((l) => l === 'fr' || l === 'es') || 'fr';
  applyLang(initial);
  goStep(0, true);
  let seen = false;
  try { seen = sessionStorage.getItem('cs-intro') === '1'; sessionStorage.setItem('cs-intro', '1'); } catch (e) { }
  if (!hasGsap || REDUCE || seen) { $('#foam').remove(); heroIn(); }
  else { document.body.classList.add('is-locked'); foamIntro(() => { }); }
  scrollFx();
  addEventListener('load', () => hasGsap && ScrollTrigger.refresh());
})();
