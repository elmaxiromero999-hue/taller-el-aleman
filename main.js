/* Taller El Alemán · interacciones de la landing */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = 'https://wa.me/5493516570799';
  window.elAlemanOK = true;

  /* Menú móvil */
  const burger = $('.nav__burger'), menu = $('#menu');
  const cerrar = () => { menu.classList.remove('abierto'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menú'); };
  burger.addEventListener('click', () => {
    const abrir = burger.getAttribute('aria-expanded') !== 'true';
    menu.classList.toggle('abierto', abrir);
    burger.setAttribute('aria-expanded', String(abrir));
    burger.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
  });
  $$('a', menu).forEach(a => a.addEventListener('click', cerrar));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('abierto')) { cerrar(); burger.focus(); } });

  /* Aparición de bloques al entrar en pantalla */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach(el => {
    const hermanos = $$(':scope > .rv', el.parentElement);
    el.style.setProperty('--d', (hermanos.indexOf(el) % 4) * 0.08 + 's');
  });

  /* Contadores: el número final ya está en el HTML */
  const fmt = (v, dec) => v.toFixed(dec).replace('.', ',');
  const cuenta = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    cuenta.unobserve(e.target);
    if (quieto) return;
    const el = e.target, fin = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), t0 = performance.now();
    const paso = t => {
      const k = Math.min(1, (t - t0) / 1400), v = fin * (1 - Math.pow(1 - k, 4));
      el.textContent = fmt(v, dec);
      if (k < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }), { threshold: 0.6 });
  // lo que está detrás de la intro espera a que se levante la persiana
  const observar = () => { $$('.rv').forEach(el => io.observe(el)); $$('[data-count]').forEach(el => cuenta.observe(el)); };
  if (document.documentElement.classList.contains('intro-activa')) document.addEventListener('intro:fin', observar, { once: true });
  else observar();

  /* Link activo en la barra */
  const links = $$('.nav__links a');
  const secciones = links.map(a => $(a.getAttribute('href')));
  const activo = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('activo', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  secciones.forEach(s => s && activo.observe(s));

  /* Scroll: progreso, parallax del hero, recorrido de siniestros, botón flotante */
  const barra = $('.progreso'), heroImg = $('.hero__bg img'), hero = $('.hero');
  const pasosBox = $('.sin__pasos'), media = $('.sin__media'), wa = $('.wa-flot');
  const pasos = $$('.paso'), fotos = $$('.sin__frame picture'), num = $('.sin__num');
  let pasoActual = -1, pendiente = false;

  const setPaso = i => {
    if (i === pasoActual) return;
    pasoActual = i;
    pasos.forEach((p, k) => p.classList.toggle('on', k === i));
    fotos.forEach((f, k) => f.classList.toggle('on', k === i));
    num.textContent = String(i + 1).padStart(2, '0');
  };

  const alScroll = () => {
    pendiente = false;
    const y = scrollY, vh = innerHeight, total = document.documentElement.scrollHeight - vh;
    const hh = hero.offsetHeight, conMedia = media.offsetParent !== null;
    const r = conMedia ? pasosBox.getBoundingClientRect() : null;

    barra.style.setProperty('--p', (y / total).toFixed(4));
    if (!quieto && y < hh) heroImg.style.setProperty('--py', (y * 0.25).toFixed(1) + 'px');
    wa.classList.toggle('ver', y > hh * 0.6);
    if (y < hh * 0.5) links.forEach(a => a.classList.remove('activo'));
    if (r) {
      const p = Math.min(1, Math.max(0, (vh * 0.5 - r.top) / r.height));
      media.style.setProperty('--p', p.toFixed(4));
      setPaso(Math.min(pasos.length - 1, Math.floor(p * pasos.length)));
    }
  };
  addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(alScroll); } }, { passive: true });
  addEventListener('resize', alScroll);
  alScroll();

  /* Consulta guiada: arma el mensaje de WhatsApp */
  const form = $('#consulta'), msg = $('#mensaje'), enviar = $('#enviar');
  const DANO = { choque: 'tuve un choque', granizo: 'mi auto tiene daños de granizo', pintura: 'quiero consultar por rayones o pintura', otro: 'quiero hacer una consulta' };
  const VIA = { seguro: 'Lo gestiono con mi seguro.', particular: 'Sería de forma particular.', flota: 'Es un vehículo de empresa.' };
  const armar = animar => {
    const d = form.dano.value, v = form.via.value, auto = form.auto.value.trim();
    let t = `Hola, ${DANO[d]}. ${VIA[v]}`;
    if (auto) t += ` Vehículo: ${auto}.`;
    t += ' ¿Me dan un turno para presupuesto?';
    msg.textContent = t;
    enviar.href = `${WA}?text=${encodeURIComponent(t)}`;
    if (animar && !quieto) { msg.classList.remove('cambia'); void msg.offsetWidth; msg.classList.add('cambia'); }
  };
  let espera;
  form.addEventListener('change', e => { if (e.target.type === 'radio') armar(true); });
  // al tipear, el lector de pantalla anuncia el mensaje solo cuando la persona hace una pausa
  form.auto.addEventListener('input', () => { clearTimeout(espera); espera = setTimeout(() => armar(false), 500); });
  armar(false);

  /* Mapa: se carga recién al hacer clic */
  $('#cargar-mapa').addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = 'https://www.google.com/maps?q=Soto+1917,+C%C3%B3rdoba,+Argentina&output=embed';
    f.title = 'Mapa: Soto 1917, Córdoba';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    const fachada = $('.mapa__fachada');
    $$('.mapa__grilla, .mapa__pin, #cargar-mapa', fachada).forEach(n => n.remove());
    fachada.prepend(f);
    f.focus();
  });

  /* Granizo: luz de inspección. Las bandas del tablero se deforman donde hay bollos. */
  const lupa = $('#lupa'), cv = $('canvas', lupa), ctx = cv.getContext('2d');
  const S = Math.min(devicePixelRatio || 1, 1.5);
  let W = 0, H = 0, campo = null, lx = 0, ly = 0, tx = 0, ty = 0, ultimoToque = 0, corriendo = false, visible = false;

  const azar = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(7);
  const bollos = Array.from({ length: 46 }, () => ({ x: 0.08 + azar() * 0.84, y: 0.12 + azar() * 0.8, r: 0.018 + azar() * 0.03, a: 0.6 + azar() * 0.8 }));

  const preparar = () => {
    const r = lupa.getBoundingClientRect();
    W = cv.width = Math.round(r.width * S); H = cv.height = Math.round(r.height * S);
    campo = new Float32Array(W * H);
    // derivada de una gaussiana: desplaza las bandas hacia afuera del centro de cada bollo
    for (const b of bollos) {
      const cx = b.x * W, cy = b.y * H, s = b.r * W, R = Math.ceil(s * 3), amp = b.a * 26 * S / s;
      for (let y = Math.max(0, cy - R | 0); y < Math.min(H, cy + R); y++)
        for (let x = Math.max(0, cx - R | 0); x < Math.min(W, cx + R); x++) {
          const dx = x - cx, dy = y - cy;
          campo[y * W + x] += amp * dx * Math.exp(-(dx * dx + dy * dy) / (2 * s * s)) * 0.6;
        }
    }
    if (!lx) { lx = tx = W * 0.55; ly = ty = H * 0.45; }
    dibujar();
  };

  const dibujar = () => {
    ctx.clearRect(0, 0, W, H);
    const rx = Math.max(110 * S, Math.min(230 * S, W * 0.34)), ry = rx * 0.8;
    const x0 = Math.max(0, lx - rx | 0), y0 = Math.max(0, ly - ry | 0);
    const x1 = Math.min(W, lx + rx | 0), y1 = Math.min(H, ly + ry | 0);
    const bw = x1 - x0, bh = y1 - y0;
    if (bw <= 0 || bh <= 0) return;
    const img = ctx.createImageData(bw, bh), d = img.data, P = 22 * S;
    for (let y = 0; y < bh; y++) {
      const gy = y + y0, ny = (gy - ly) / ry;
      for (let x = 0; x < bw; x++) {
        const gx = x + x0, nx = (gx - lx) / rx, q = nx * nx + ny * ny;
        if (q >= 1) continue;
        const caida = Math.pow(1 - q, 1.6);
        const u = gx + campo[gy * W + gx] + gy * 0.35;
        const v = ((u % P) + P) % P / P;
        const banda = v < 0.4 ? 1 - Math.pow(Math.abs(v - 0.2) / 0.2, 6) : 0;
        const a = Math.max(0, banda) * caida;
        const i = (y * bw + x) * 4;
        d[i] = 255; d[i + 1] = 250; d[i + 2] = 244; d[i + 3] = a * 235;
      }
    }
    ctx.putImageData(img, x0, y0);
  };

  const bucle = t => {
    if (!visible) { corriendo = false; return; }
    if (t - ultimoToque > 2500) { // recorrido solo cuando nadie la mueve
      const k = t / 1000;
      tx = W * (0.5 + 0.32 * Math.sin(k * 0.55));
      ty = H * (0.48 + 0.26 * Math.sin(k * 0.9 + 1));
    }
    lx += (tx - lx) * 0.14; ly += (ty - ly) * 0.14;
    dibujar();
    requestAnimationFrame(bucle);
  };
  const arrancar = () => { if (!corriendo && visible && !quieto) { corriendo = true; requestAnimationFrame(bucle); } };

  const mover = e => {
    const r = lupa.getBoundingClientRect();
    tx = (e.clientX - r.left) * S; ty = (e.clientY - r.top) * S; ultimoToque = performance.now();
    lupa.classList.add('usada');
    if (quieto) { lx = tx; ly = ty; dibujar(); }
  };
  // en el celular un toque lleva la luz a ese punto; el arrastre vertical sigue scrolleando
  lupa.addEventListener('pointermove', mover);
  lupa.addEventListener('pointerdown', mover);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; arrancar(); }).observe(lupa);
  new ResizeObserver(preparar).observe(lupa);
})();
