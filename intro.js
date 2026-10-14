/* Intro: el logo se arma sobre su retícula de 59 × 8 módulos y la pantalla se levanta como la persiana del taller */
(() => { try {
  window.introOK = true;
  const html = document.documentElement;
  const intro = document.getElementById('intro');
  if (!intro) return;
  if (!html.classList.contains('intro-activa')) { intro.remove(); return; }

  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => intro.querySelector(s);
  const svg = $('.intro__logo'), auto = $('.intro__auto'), marca = $('.intro__marca');
  const letras = [...intro.querySelectorAll('.intro__letras path')];
  const grilla = $('.intro__grilla'), reflejo = $('.intro__reflejo'), barrido = $('.intro__barrido');
  const boton = $('.intro__bajar'), cv = $('.intro__chispas'), ctx = cv.getContext('2d');
  const blur = $('#brillo feGaussianBlur');
  const ease = 'cubic-bezier(.2,.7,.1,1)';
  const anim = (el, kf, o) => el.animate(kf, { fill: 'both', easing: ease, ...o });
  const timers = [];
  const luego = (ms, fn) => timers.push(setTimeout(fn, ms));

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);

  /* Retícula de construcción del logotipo (59 × 8 módulos, ver diapositiva 08) */
  const NS = 'http://www.w3.org/2000/svg', X0 = 243.63, Y0 = 743.78, M = 592.74 / 59, ANCHO = 59 * M, ALTO = 8 * M;
  const linea = (x1, y1, x2, y2, mayor) => {
    const l = document.createElementNS(NS, 'line');
    Object.entries({ x1, y1, x2, y2 }).forEach(([k, v]) => l.setAttribute(k, v));
    if (mayor) l.classList.add('mayor');
    l.style.transformBox = 'fill-box'; l.style.transformOrigin = 'center';
    grilla.appendChild(l);
    return l;
  };
  const verticales = Array.from({ length: 60 }, (_, i) => linea(X0 + i * M, Y0 - 14, X0 + i * M, Y0 + ALTO + 14, i === 0 || i === 59));
  const horizontales = Array.from({ length: 9 }, (_, j) => linea(X0 - 14, Y0 + j * M, X0 + ANCHO + 14, Y0 + j * M, j === 0 || j === 8));

  /* Chispas (canvas a pantalla completa) */
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const medir = () => { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  medir(); addEventListener('resize', medir);
  const pt = svg.createSVGPoint();
  const aPantalla = p => { pt.x = p.x; pt.y = p.y; return pt.matrixTransform(svg.getScreenCTM()); };
  let particulas = [], cabeza = null, loop = 0;

  const dibujarChispas = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.globalCompositeOperation = 'lighter';
    particulas = particulas.filter(p => (p.vida -= p.caida) > 0);
    for (const p of particulas) {
      p.vy += 0.07; p.x += p.vx; p.y += p.vy;
      const v = p.vida;
      ctx.fillStyle = v > 0.7 ? `rgba(255,240,220,${v})` : v > 0.4 ? `rgba(255,120,60,${v})` : `rgba(225,6,0,${v})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.5 + v), 0, 6.283); ctx.fill();
    }
    if (cabeza) {
      const g = ctx.createRadialGradient(cabeza.x, cabeza.y, 0, cabeza.x, cabeza.y, 34);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.12, 'rgba(255,190,170,.9)');
      g.addColorStop(0.35, 'rgba(255,30,10,.45)'); g.addColorStop(1, 'rgba(255,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cabeza.x, cabeza.y, 34, 0, 6.283); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  };

  /* Trazo del auto: una luz recorre el contorno y va dejando la línea roja */
  const L = auto.getTotalLength();
  auto.style.strokeDasharray = L; auto.style.strokeDashoffset = L;
  const trazarAuto = (inicio, dur) => {
    const t0 = performance.now() + inicio;
    const io = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    const frame = t => {
      const k = Math.min(1, Math.max(0, (t - t0) / dur));
      if (t >= t0 && k < 1) {
        const largo = L * io(k);
        auto.style.strokeDashoffset = L - largo;
        auto.style.strokeOpacity = 1;
        cabeza = aPantalla(auto.getPointAtLength(largo));
        for (let i = 0; i < 3; i++) particulas.push({ x: cabeza.x, y: cabeza.y, vx: (Math.random() - 0.5) * 3.2, vy: -Math.random() * 2.4, r: 0.6 + Math.random() * 1.4, vida: 1, caida: 0.018 + Math.random() * 0.03 });
      } else if (k >= 1) { auto.style.strokeDashoffset = 0; cabeza = null; }
      dibujarChispas();
      if (k < 1 || particulas.length) loop = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, innerWidth, innerHeight);
    };
    loop = requestAnimationFrame(frame);
  };

  const barrer = demora => anim(barrido, [{ opacity: 1, transform: 'translateX(150px)' }, { opacity: 1, transform: 'translateX(880px)' }], { duration: 1100, delay: demora, easing: 'cubic-bezier(.6,0,.3,1)', fill: 'none' });
  let repetir = 0;

  const listo = () => {
    intro.classList.add('lista');
    boton.focus({ preventScroll: true, focusVisible: false });
    if (!quieto) repetir = setInterval(() => barrer(0), 5200);
  };

  if (quieto) {
    intro.classList.add('encendida');
    marca.removeAttribute('filter');
    listo();
  } else {
    // 1 · la retícula se abre desde el centro
    verticales.forEach((l, i) => anim(l, [{ opacity: 0, transform: 'scaleY(0)' }, { opacity: l.classList.contains('mayor') ? 0.9 : 0.28, transform: 'none' }], { duration: 600, delay: 80 + Math.abs(i - 29.5) * 11 }));
    horizontales.forEach((l, j) => anim(l, [{ opacity: 0, transform: 'scaleX(0)' }, { opacity: l.classList.contains('mayor') ? 0.9 : 0.28, transform: 'none' }], { duration: 900, delay: 200 + j * 40 }));
    // 2 · la luz dibuja el auto
    trazarAuto(350, 1700);
    // 3 · las letras se trazan sobre la retícula, de izquierda a derecha
    letras.forEach((p, k) => {
      const l = p.getTotalLength();
      p.style.strokeDasharray = l;
      anim(p, [{ strokeDashoffset: l, strokeOpacity: 1 }, { strokeDashoffset: 0, strokeOpacity: 1 }], { duration: 750, delay: 900 + k * 95 });
      anim(p, [{ fillOpacity: 0 }, { fillOpacity: 1 }], { duration: 500, delay: 1750 + k * 60 });
      anim(p, [{ strokeOpacity: 1 }, { strokeOpacity: 0 }], { duration: 500, delay: 2500 + k * 40 });
    });
    // 4 · el auto se llena de color con un destello
    anim(auto, [{ fillOpacity: 0 }, { fillOpacity: 1 }], { duration: 600, delay: 2000 });
    anim(auto, [{ strokeOpacity: 1 }, { strokeOpacity: 0 }], { duration: 500, delay: 2500, fill: 'forwards' });
    luego(1900, () => intro.classList.add('encendida'));
    // 5 · se va la retícula, aparece el reflejo en el piso y pasa una luz por el auto
    [...verticales, ...horizontales].forEach((l, i) => anim(l, [{ opacity: 0 }], { duration: 700, delay: 2500 + (i % 7) * 30, fill: 'forwards', composite: 'replace' }));
    anim(reflejo, [{ opacity: 0 }, { opacity: 1 }], { duration: 1000, delay: 2600 });
    barrer(2700);
    // el resplandor del logo se apaga para que quede limpio
    luego(2900, () => {
      const t0 = performance.now();
      const bajar = t => {
        const k = Math.min(1, (t - t0) / 700);
        blur.setAttribute('stdDeviation', (5 * (1 - k)).toFixed(2));
        if (k < 1) requestAnimationFrame(bajar); else marca.removeAttribute('filter');
      };
      requestAnimationFrame(bajar);
    });
    luego(3300, listo);
  }

  /* Salida: la persiana se levanta y entra la página */
  let saliendo = false, porTeclado = false;
  const salir = () => {
    if (saliendo) return;
    saliendo = true;
    clearInterval(repetir);
    intro.classList.add('sale');
    setTimeout(fin, quieto ? 450 : 1000);
  };
  const fin = () => {
    timers.forEach(clearTimeout);
    cancelAnimationFrame(loop);
    removeEventListener('wheel', alRueda);
    removeEventListener('keydown', alTecla);
    removeEventListener('resize', medir);
    intro.remove();
    html.classList.remove('intro-activa');
    scrollTo(0, 0);
    document.dispatchEvent(new Event('intro:fin'));
    if (porTeclado) document.querySelector('.nav__logo').focus();
  };

  const alRueda = e => { if (e.deltaY > 4) salir(); };
  const alTecla = e => {
    if (['ArrowDown', 'PageDown', ' ', 'Enter', 'Escape'].includes(e.key)) { e.preventDefault(); porTeclado = true; salir(); }
  };
  let y0 = null;
  intro.addEventListener('touchstart', e => { y0 = e.touches[0].clientY; }, { passive: true });
  intro.addEventListener('touchmove', e => {
    e.preventDefault();
    if (y0 !== null && y0 - e.touches[0].clientY > 30) salir();
  }, { passive: false });
  boton.addEventListener('click', salir);
  addEventListener('wheel', alRueda, { passive: true });
  addEventListener('keydown', alTecla);
} catch (err) {
  // si algo falla, la intro no puede bloquear la página
  console.error(err);
  const i = document.getElementById('intro'); if (i) i.remove();
  document.documentElement.classList.remove('intro-activa');
  document.dispatchEvent(new Event('intro:fin'));
} })();
