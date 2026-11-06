/* Menu engine. mount(root, config, {mode:'full'|'thumb', lang:'ar'|'en', record:false}) */
(() => {
const DATA = window.MENU_DATA;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => new Promise(r => setTimeout(r, RM ? Math.min(ms, 60) : ms));
const EZ = { out: 'cubic-bezier(.55,0,.8,.2)', in: 'cubic-bezier(.2,.8,.2,1)', back: 'cubic-bezier(.3,1.45,.5,1)', io: 'cubic-bezier(.7,0,.25,1)' };
const ease = { back: t => { const c = 1.25; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2 }, io: t => t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2, out: t => 1 - (1 - t) ** 3 };
const tween = (dur, fn, ez = ease.io) => new Promise(res => { if (RM) { fn(1); return res() } const t0 = performance.now(); const f = n => { const t = Math.min(1, (n - t0) / dur); fn(ez(t)); t < 1 ? requestAnimationFrame(f) : res() }; requestAnimationFrame(f) });
const A = (el, kf, o) => { if (!el) return Promise.resolve(); if (RM) kf = [{ opacity: kf[0].opacity ?? 1 }, { opacity: kf[kf.length - 1].opacity ?? 1 }]; return el.animate(kf, { fill: 'both', ...o, duration: RM ? 120 : o.duration }).finished.catch(() => {}) };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const lum = h => { const v = [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16) / 255).map(c => c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2] };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05) };
const best = (bg, list) => list.reduce((p, c) => cr(c, bg) > cr(p, bg) ? c : p);
const UI = {
  ar: { tap: 'المس للدخول', menu: 'منيو', pick: 'اختر قسمًا', items: n => n === 1 ? 'طبق واحد' : n === 2 ? 'طبقان' : `${n} أطباق`, add: 'أضف إلى الطلب', added: 'أُضيف إلى طلبك', kcal: 'سعرة حرارية', contains: 'يحتوي على', free: 'دون مسببات حساسية شائعة', omr: 'ر.ع', contents: 'المحتويات', back: 'رجوع', close: 'إغلاق', lang: 'EN', enter: 'المس الطبق للدخول', layers: ['الخبز المحمّص', 'الجبن والصلصة', 'اللحم المشوي', 'الخضار والخبز'] },
  en: { tap: 'Tap to enter', menu: 'MENU', pick: 'Choose a section', items: n => `${n} ${n === 1 ? 'dish' : 'dishes'}`, add: 'Add to order', added: 'Added to your order', kcal: 'kcal', contains: 'Contains', free: 'No common allergens', omr: 'OMR', contents: 'Contents', back: 'Back', close: 'Close', lang: 'ع', enter: 'Tap the dish to enter', layers: ['Toasted bun', 'Cheese & sauce', 'Grilled beef', 'Greens & base'] }
};
const ICON = { back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>', x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>', l: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>', r: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>' };

function mount(root, cfg, opt = {}) {
  const thumb = opt.mode === 'thumb';
  const P = DATA.palettes[cfg.palette], cu = DATA.cuisines[cfg.cuisine];
  const el = document.createElement('div'); el.className = 'mx' + (thumb ? ' thumb' : ''); el.dataset.fam = cfg.family;
  const sink = best(P[2], [P[1], P[0], '#1A1714', '#FAF6EF']), spop = cr(P[3], P[2]) >= 3 ? P[3] : sink;
  let cvb = P[3], cvf = P[0]; if (cr(cvb, cvf) < 3) { cvb = P[0]; cvf = cr(P[3], P[0]) >= 3 ? P[3] : P[1] }
  const v = { '--bg': P[0], '--ink': P[1], '--sf': P[2], '--pop': P[3], '--tex': DATA.textures[P[4]] || 'none', '--sink': sink, '--spop': spop, '--cvb': cvb, '--cvf': cvf, '--dA': DATA.fonts[cfg.fonts[0]], '--dL': DATA.fonts[cfg.fonts[1]] };
  for (const k in v) el.style.setProperty(k, v[k]);
  root.replaceChildren(el);
  const ctx = { el, cfg, cu, P, lang: opt.lang || 'ar', alive: true, busy: false, screen: 'cover', cat: 0, thumb, record: !!opt.record, onDone: opt.onDone };
  ctx.u = () => UI[ctx.lang];
  ctx.d = k => DATA.dishes[k];
  ctx.img = k => DATA.img + DATA.dishes[k].img + '.webp';
  ctx.nm = k => DATA.dishes[k][ctx.lang][0];
  ctx.ds = k => DATA.dishes[k][ctx.lang][1];
  ctx.pr = k => `<span class="mx-pr">${DATA.dishes[k].price.toFixed(3)}<small>${ctx.u().omr}</small></span>`;
  ctx.cn = i => cu.cats[i][ctx.lang];
  ctx.W = () => ctx.stage.clientWidth; ctx.H = () => ctx.stage.clientHeight;
  ctx.$ = q => el.querySelector(q); ctx.$$ = q => [...el.querySelectorAll(q)];
  const setLang = () => { el.lang = ctx.lang; el.dir = ctx.lang === 'ar' ? 'rtl' : 'ltr' };
  setLang();
  const wide = () => { const w = el.clientWidth / Math.max(1, el.clientHeight) > 1.15; el.toggleAttribute('data-wide', w); return w };
  ctx.wide = wide;

  if (cfg.set === 'display') return mountLoop(ctx);

  el.innerHTML = `<div class="mx-tex"></div><div class="mx-stage"></div>
   <header class="mx-hd"><button class="mx-ic back" data-act="back" aria-label="${ctx.u().back}">${ICON.back}</button><div class="mx-brand"><b class="mx-bw">${ctx.u().menu}</b><span>${esc(cu[ctx.lang])}</span></div><button class="mx-ic" data-act="lang">${ctx.u().lang}</button></header>
   <div class="mx-tabs" role="tablist"></div>
   <div class="mx-detail" aria-hidden="true"><div class="scrim" data-act="x"></div><div class="hero"><img alt=""></div><div class="sheet" role="dialog"></div></div>
   <div class="mx-toast" aria-live="polite"></div>${coverHTML(ctx)}`;
  ctx.stage = ctx.$('.mx-stage'); el.dataset.screen = 'cover'; wide();
  const fam = FAM[cfg.family]; ctx.fam = fam;
  fam.setup(ctx); fam.layout(ctx); fam.hub(ctx, { instant: true });
  if (thumb) { ctx.$('.mx-bw').style.opacity = 0; return { destroy() {} } }
  ctx.$('.mx-bw').style.opacity = 0;
  const tabs = () => { ctx.$('.mx-tabs').innerHTML = cu.cats.map((c, i) => `<button class="mx-tab" role="tab" data-act="cat" data-i="${i}" aria-selected="${ctx.screen === 'cat' && i === ctx.cat}">${esc(c[ctx.lang])}</button>`).join('') };
  ctx.tabs = tabs; tabs();
  const go = async (fn) => { if (ctx.busy) return; ctx.busy = true; try { await fn() } finally { ctx.busy = false } };
  ctx.toCat = i => go(async () => { const from = ctx.screen; ctx.screen = 'cat'; el.dataset.screen = 'cat'; const prev = ctx.cat; ctx.cat = i; tabs(); await fam.cat(ctx, i, { from, prev }) });
  ctx.toHub = () => go(async () => { ctx.screen = 'hub'; el.dataset.screen = 'hub'; tabs(); await fam.hub(ctx, { fromCat: true }) });
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b || !el.contains(b)) return;
    const a = b.dataset.act;
    if (a === 'cover') { if (!ctx.busy) go(() => openCover(ctx, e)); return }
    if (a === 'lang') { ctx.lang = ctx.lang === 'ar' ? 'en' : 'ar'; setLang(); ctx.$('.mx-bw').textContent = ctx.u().menu; ctx.$('.mx-brand span').textContent = cu[ctx.lang]; b.textContent = ctx.u().lang; tabs(); fam.layout(ctx); ctx.screen === 'cat' ? fam.cat(ctx, ctx.cat, { instant: true }) : fam.hub(ctx, { instant: true }); if (ctx.$('.mx-detail.on')) fillDetail(ctx, ctx.dk); return }
    if (a === 'back') { if (ctx.$('.mx-detail.on')) closeDetail(ctx); else if (ctx.screen === 'cat') ctx.toHub(); return }
    if (a === 'x') { closeDetail(ctx); return }
    if (a === 'add') { const t = ctx.$('.mx-toast'); t.textContent = ctx.u().added; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 1600); return }
    if (a === 'cat') { const i = +b.dataset.i; if (ctx.screen === 'cat' && i === ctx.cat) return; ctx.toCat(i); return }
    if (a === 'dish') { openDetail(ctx, b.dataset.k, b.querySelector('img')); return }
    if (fam.act) fam.act(ctx, a, b);
  });
  el.addEventListener('keydown', e => { if (e.key === 'Escape') { ctx.$('.mx-detail.on') ? closeDetail(ctx) : ctx.screen === 'cat' && ctx.toHub() } });
  let sx = null; el.addEventListener('pointerdown', e => { sx = [e.clientX, e.clientY] });
  el.addEventListener('pointerup', e => { if (!sx) return; const dx = e.clientX - sx[0], dy = e.clientY - sx[1]; sx = null; if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return; if (ctx.$('.mx-detail.on') || ctx.screen === 'cover') return; const dir = (dx < 0 ? 1 : -1) * (el.dir === 'rtl' ? -1 : 1); if (fam.swipe && fam.swipe(ctx, dir)) return; if (ctx.screen === 'cat') ctx.toCat((ctx.cat + dir + cu.cats.length) % cu.cats.length) });
  const ro = new ResizeObserver(() => { wide(); fam.layout(ctx) }); ro.observe(el);
  return { destroy() { ctx.alive = false; ro.disconnect() } };
}

/* ---------- cover + reveal ---------- */
function coverHTML(ctx) {
  const r = ctx.cfg.reveal, peek = ctx.cu.cats[0].items[0], two = ['doors', 'puzzle'].includes(r);
  const inner = `<div class="tex"></div><div class="frame"></div><span class="lbl">${esc(ctx.cu.en)}</span><b class="word">${UI.ar.menu}</b><span class="sub">${esc(ctx.cu.ar)} · ${esc(ctx.cfg.name.ar)}</span><img class="peek" src="${ctx.img(peek)}" alt=""><span class="tap">${UI.ar.tap}</span>`;
  return `<div class="mx-cover" data-r="${r}" data-act="cover" role="button" tabindex="0" aria-label="${UI.ar.tap}"><div class="mx-cv a">${inner}</div>${two ? `<div class="mx-cv b">${inner}</div>` : ''}</div>`;
}
async function openCover(ctx, e) {
  const el = ctx.el, cv = ctx.$('.mx-cover'), parts = [...cv.querySelectorAll('.mx-cv')], r = cv.dataset.r, R = el.getBoundingClientRect();
  const px = e && e.clientX ? (e.clientX - R.left) / R.width * 100 : 50, py = e && e.clientY ? (e.clientY - R.top) / R.height * 100 : 50;
  if (r === 'mask') { /* the dish fills the letters of «منيو», then we dive through them */
    const cvA = parts[0], w = cvA.querySelector('.word'), others = [...cvA.querySelectorAll('.frame,.lbl,.sub,.peek,.tap,.tex')], peek = ctx.cu.cats[0].items[0];
    Object.assign(w.style, { backgroundImage: `url(${ctx.img(peek)})`, backgroundSize: '70% auto', backgroundPosition: '50% 60%', webkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', transformOrigin: '50% 62%' });
    await Promise.all(others.map(o => A(o, [{ opacity: 1 }, { opacity: 0 }], { duration: 320 })).concat(A(w, [{ transform: 'none' }, { transform: 'scale(1.18)' }], { duration: 520, easing: EZ.back })));
    setTimeout(() => { ctx.screen = 'hub'; el.dataset.screen = 'hub'; ctx.fam.hub(ctx, { arrive: true }) }, RM ? 0 : 520);
    await Promise.all([A(w, [{ transform: 'scale(1.18)' }, { transform: 'scale(16)' }], { duration: 1000, easing: 'cubic-bezier(.7,0,.3,1)' }), A(cv, [{ opacity: 1 }, { opacity: 1, offset: .55 }, { opacity: 0 }], { duration: 1000 })]);
    const tgt = ctx.$('.mx-bw'); A(tgt, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: EZ.back }); tgt.style.opacity = 1; cv.remove(); return;
  }
  // Match & Move: the cover word travels into the header
  const w = parts[0].querySelector('.word'), wr = w.getBoundingClientRect(), tgt = ctx.$('.mx-bw'), tr = tgt.getBoundingClientRect();
  const fly = document.createElement('b'); fly.className = 'mx-ab mx-d'; fly.textContent = w.textContent;
  Object.assign(fly.style, { left: wr.left - R.left + 'px', top: wr.top - R.top + 'px', width: wr.width + 'px', height: wr.height + 'px', font: getComputedStyle(w).font, color: getComputedStyle(w).color, textAlign: 'center', zIndex: 30, transformOrigin: '0 0', whiteSpace: 'nowrap', direction: 'rtl' });
  el.appendChild(fly); parts.forEach(p => p.querySelector('.word').style.visibility = 'hidden');
  const s = tr.height / wr.height, dx = tr.left - wr.left + (tr.width - wr.width * s) / 2, dy = tr.top - wr.top;
  const o = { duration: 950, easing: EZ.io };
  let an;
  if (r === 'doors') an = [A(parts[0], [{ transform: 'none' }, { transform: 'translateX(-104%)' }], o), A(parts[1], [{ transform: 'none' }, { transform: 'translateX(104%)' }], o)];
  else if (r === 'puzzle') an = [A(parts[0], [{ transform: 'none' }, { transform: 'translateY(-104%)' }], o), A(parts[1], [{ transform: 'none' }, { transform: 'translateY(104%)' }], o)];
  else if (r === 'circle') an = [A(cv, [{ clipPath: `circle(150% at ${px}% ${py}%)` }, { clipPath: `circle(0% at ${px}% ${py}%)` }], { ...o, duration: 850 })];
  else if (r === 'blinds') an = [A(cv, [{ '--mxb': '0%' }, { '--mxb': '12.5%' }], o)];
  else if (r === 'page') an = [A(parts[0], [{ transform: 'perspective(160cqmin) rotateY(0)', filter: 'brightness(1)' }, { transform: 'perspective(160cqmin) rotateY(-120deg)', filter: 'brightness(.55)' }], { ...o, duration: 1100 }), A(cv, [{ opacity: 1 }, { opacity: 1, offset: .78 }, { opacity: 0 }], { ...o, duration: 1100 })];
  else if (r === 'dive') { cv.style.transformOrigin = '50% 34%'; an = [A(cv, [{ transform: 'none', opacity: 1, filter: 'blur(0)' }, { transform: 'scale(6)', opacity: 0, filter: 'blur(6px)' }], { duration: 900, easing: 'cubic-bezier(.6,0,.4,1)' })] }
  else if (r === 'iris') an = [A(cv, [{ transform: 'none', opacity: 1 }, { transform: 'rotate(-35deg) scale(.15)', opacity: 0 }], { duration: 900, easing: EZ.io })];
  else an = [A(cv, [{ transform: 'none' }, { transform: 'translateY(-28%) scaleY(.97)', offset: .38 }, { transform: 'translateY(-106%)' }], o)];
  setTimeout(() => { ctx.screen = 'hub'; el.dataset.screen = 'hub'; ctx.fam.hub(ctx, { arrive: true }) }, RM ? 0 : 380);
  await Promise.all([...an, A(fly, [{ transform: 'none' }, { transform: `translate(${dx}px,${dy}px) scale(${s})`, color: getComputedStyle(tgt).color }], { duration: 950, easing: EZ.io })]);
  tgt.style.opacity = 1; fly.remove(); cv.remove();
}

/* ---------- dish detail (shared element) ---------- */
function fillDetail(ctx, k) {
  const d = ctx.d(k), u = ctx.u(), al = d.al.map(a => DATA.allergens[a][ctx.lang === 'ar' ? 1 : 0]);
  ctx.$('.mx-detail .sheet').innerHTML = `<button class="mx-ic x" data-act="x" aria-label="${u.close}">${ICON.x}</button><h3>${esc(ctx.nm(k))}</h3><p>${esc(ctx.ds(k))}</p>
   <div class="meta"><span>${d.kcal} ${u.kcal}</span><span>${al.length ? u.contains + ': ' + al.join('، ') : u.free}</span></div>
   <div class="row">${ctx.pr(k)}<button class="add" data-act="add">${u.add}</button></div>`;
}
async function openDetail(ctx, k, src) {
  if (ctx.busy || !k) return; ctx.dk = k; fillDetail(ctx, k);
  const det = ctx.$('.mx-detail'), hi = det.querySelector('.hero img'), hero = det.querySelector('.hero'); hi.src = ctx.img(k);
  try { await hi.decode() } catch (e) {}
  if (document.startViewTransition && !RM && src) {
    src.style.viewTransitionName = 'mxhero';
    const t = document.startViewTransition(() => { src.style.viewTransitionName = ''; hi.style.viewTransitionName = 'mxhero'; det.classList.add('on'); det.setAttribute('aria-hidden', 'false') });
    await t.finished.catch(() => {}); hi.style.viewTransitionName = ''; ctx.src = src; return;
  }
  det.classList.add('on'); det.setAttribute('aria-hidden', 'false'); ctx.src = src;
  if (src && !RM) { const a = src.getBoundingClientRect(), b = hero.getBoundingClientRect(); A(hero, [{ transform: `translate(${a.left - b.left}px,${a.top - b.top}px) scale(${a.width / b.width})` }, { transform: 'none' }], { duration: 600, easing: EZ.in }) }
}
async function closeDetail(ctx) {
  const det = ctx.$('.mx-detail'), hi = det.querySelector('.hero img'), src = ctx.src && ctx.el.contains(ctx.src) ? ctx.src : null;
  if (document.startViewTransition && !RM && src) {
    hi.style.viewTransitionName = 'mxhero';
    const t = document.startViewTransition(() => { hi.style.viewTransitionName = ''; src.style.viewTransitionName = 'mxhero'; det.classList.remove('on'); det.setAttribute('aria-hidden', 'true') });
    await t.finished.catch(() => {}); src.style.viewTransitionName = ''; return;
  }
  det.classList.remove('on'); det.setAttribute('aria-hidden', 'true');
}

/* ---------- shared motion: leave into slot, empty beat, staggered arrival ---------- */
const leave = (imgs, txts) => Promise.all([...imgs.map((im, j) => A(im, [{ transform: 'none', opacity: 1 }, { transform: 'scale(.12) rotate(-70deg)', opacity: 0 }], { duration: 300, delay: j * 40, easing: EZ.out })), ...txts.map(t => A(t, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(1.4cqmin)' }], { duration: 220, easing: EZ.out }))]);
const arrive = (imgs, txts, stg = 95) => Promise.all([...imgs.map((im, j) => A(im, [{ transform: 'scale(.12) rotate(70deg)', opacity: 0 }, { transform: 'scale(1.06) rotate(-4deg)', opacity: 1, offset: .72 }, { transform: 'none', opacity: 1 }], { duration: 650, delay: j * stg, easing: EZ.in })), ...txts.map((t, j) => A(t, [{ opacity: 0, transform: 'translateY(2cqmin)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: j * stg + 140, easing: EZ.in }))]);
const decodeAll = imgs => Promise.all(imgs.map(i => i.decode ? i.decode().catch(() => {}) : 0));
const place = (n, x, y, w, h) => Object.assign(n.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });

/* ================= interactive families ================= */
const FAM = {};

/* 1 — Puzzle Spine: the band never moves; dishes dissolve into its sockets */
FAM['puzzle-spine'] = {
  N: 4,
  setup(ctx) { ctx.stage.innerHTML = `<svg class="mx-spine" aria-hidden="true"><path/></svg><div class="mx-big-cat"></div>` + [0, 1, 2, 3].map(j => `<button class="mx-sock" data-s="${j}"><div class="mx-dish breathe"><img alt=""></div></button><div class="mx-txt" data-s="${j}"></div>`).join('') },
  geo(ctx) {
    const W = ctx.W(), H = ctx.H(), wide = ctx.wide(), rtl = ctx.el.dir === 'rtl' ? 1 : -1, g = [];
    if (!wide) { const bw = W * .13, cx = W / 2, top = H * .22, r = Math.min(W * .19, H * .085);
      [.34, .52, .7, .88].forEach((f, j) => { const s = (j % 2 ? -1 : 1) * rtl, sy = H * f; g.push({ sx: cx + s * (bw / 2 + r * .55), sy, r, tx: s > 0 ? W * .05 : cx + bw / 2 + W * .03, ty: sy - r, tw: W / 2 - bw / 2 - W * .08, th: r * 2, knob: [cx - s * bw / 2, sy] }) });
      return { g, band: `M${cx - bw / 2} ${top}h${bw}V${H + 10}h${-bw}Z`, bw, title: H * .155 };
    }
    const bh = H * .12, cy = H * .6, r = Math.min(H * .17, W * .085);
    [.16, .38, .62, .84].forEach((f, j) => { const s = j % 2 ? 1 : -1, sx = W * (rtl > 0 ? 1 - f : f); g.push({ sx, sy: cy + s * (bh / 2 + r * .55), r, tx: sx - W * .1, ty: s < 0 ? cy + bh / 2 + H * .03 : cy - bh / 2 - H * .03 - r * 1.6, tw: W * .2, th: r * 1.6, knob: [sx, cy - s * bh / 2] }) });
    return { g, band: `M${W * .03} ${cy - bh / 2}H${W * .97}v${bh}H${W * .03}Z`, bw: bh, title: H * .2 };
  },
  layout(ctx) {
    const G = this.geo(ctx); let d = G.band;
    G.g.forEach(o => { const R = o.r * 1.1, k = G.bw * .3; d += `M${o.sx - R} ${o.sy}a${R} ${R} 0 1 0 ${2 * R} 0a${R} ${R} 0 1 0 ${-2 * R} 0Z M${o.knob[0] - k} ${o.knob[1]}a${k} ${k} 0 1 0 ${2 * k} 0a${k} ${k} 0 1 0 ${-2 * k} 0Z` });
    const svg = ctx.$('.mx-spine'); svg.setAttribute('viewBox', `0 0 ${ctx.W()} ${ctx.H()}`); svg.querySelector('path').setAttribute('d', d);
    ctx.$$('.mx-sock').forEach((n, j) => { const o = G.g[j]; place(n, o.sx - o.r, o.sy - o.r, o.r * 2, o.r * 2) });
    ctx.$$('.mx-txt').forEach((n, j) => { const o = G.g[j]; place(n, o.tx, o.ty, o.tw, o.th); n.style.textAlign = 'center' });
    ctx.$('.mx-big-cat').style.top = G.title + 'px';
  },
  fill(ctx, list, mode) {
    ctx.$$('.mx-sock').forEach((n, j) => { const k = list[j], im = n.querySelector('img'), t = ctx.$$('.mx-txt')[j];
      n.style.visibility = t.style.visibility = k ? 'visible' : 'hidden'; if (!k) return;
      if (mode === 'hub') { const c = ctx.cu.cats[k.i]; im.src = ctx.img(c.items[0]); n.dataset.act = 'cat'; n.dataset.i = k.i; n.removeAttribute('data-k'); t.innerHTML = `<b class="mx-nm">${esc(c[ctx.lang])}</b><span class="mx-ds">${ctx.u().items(c.items.length)}</span>` }
      else { im.src = ctx.img(k); n.dataset.act = 'dish'; n.dataset.k = k; t.innerHTML = `<b class="mx-nm">${esc(ctx.nm(k))}</b><span class="mx-ds">${esc(ctx.ds(k))}</span>${ctx.pr(k)}` }
      im.alt = mode === 'hub' ? ctx.cn(k.i) : ctx.nm(k) });
  },
  async swap(ctx, list, mode, first) {
    const vis = () => ctx.$$('.mx-sock').filter(n => n.style.visibility !== 'hidden');
    if (!first) { await leave(vis().map(n => n.querySelector('img')), ctx.$$('.mx-txt')); await sleep(170) }
    this.fill(ctx, list, mode); const ims = vis().map(n => n.querySelector('img')); await decodeAll(ims);
    await arrive(ims, ctx.$$('.mx-txt').filter(t => t.style.visibility !== 'hidden'));
  },
  async hub(ctx, o = {}) {
    const bc = ctx.$('.mx-big-cat'); bc.textContent = ctx.u().pick; bc.style.opacity = 1;
    const list = ctx.cu.cats.slice(0, 4).map((c, i) => ({ i }));
    if (o.instant) return this.fill(ctx, list, 'hub');
    A(bc, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 300 });
    await this.swap(ctx, list, 'hub', o.arrive);
  },
  async cat(ctx, i, o = {}) {
    const bc = ctx.$('.mx-big-cat'); const items = ctx.cu.cats[i].items.slice(0, 4);
    if (o.instant) { bc.style.opacity = 0; return this.fill(ctx, items, 'cat') }
    A(bc, [{ opacity: getComputedStyle(bc).opacity }, { opacity: 0 }], { duration: 250 });
    await this.swap(ctx, items, 'cat');
  }
};

/* 2 — Orbit Plate: satellites circle the plate; the chosen dish flies to the centre */
FAM['orbit'] = {
  setup(ctx) { ctx.rot = 0; ctx.stage.innerHTML = `<div class="mx-ring"></div><button class="mx-plate" data-act="center"><div class="mx-dish breathe"><img alt=""></div></button><div class="mx-big-cat"></div><div class="mx-info"></div>` + [0, 1, 2, 3, 4].map(j => `<button class="mx-sat" data-j="${j}"><div class="mx-dish"><img alt=""></div><span class="cap"></span></button>`).join('') },
  geo(ctx) { const W = ctx.W(), H = ctx.H(); if (!ctx.wide()) { const R = Math.min(W * .27, H * .15); return { cx: W / 2, cy: H * .49, R, OR: R * 1.68, S: R * .74, info: [W * .06, H * .49 + R * 1.68 + R * .74 * .9, W * .88], title: H * .155 } }
    const R = Math.min(H * .2, W * .14), rtl = ctx.el.dir === 'rtl'; const cx = rtl ? W * .64 : W * .36; return { cx, cy: H * .56, R, OR: R * 1.65, S: R * .7, info: [rtl ? W * .05 : W * .62, H * .42, W * .33], title: H * .17 } },
  layout(ctx) { const g = this.geo(ctx); ctx.g = g; place(ctx.$('.mx-plate'), g.cx - g.R, g.cy - g.R, g.R * 2, g.R * 2); ctx.$('.mx-plate .mx-dish').style.inset = g.R * .12 + 'px';
    place(ctx.$('.mx-ring'), g.cx - g.OR, g.cy - g.OR, g.OR * 2, g.OR * 2); const inf = ctx.$('.mx-info'); Object.assign(inf.style, { left: g.info[0] + 'px', top: g.info[1] + 'px', width: g.info[2] + 'px', right: 'auto' });
    ctx.$('.mx-big-cat').style.top = g.title + 'px'; this.pos(ctx) },
  pos(ctx) { const g = ctx.g, sats = ctx.$$('.mx-sat').filter(s => s.style.display !== 'none'), n = sats.length || 1;
    sats.forEach((s, j) => { const a = (ctx.rot + j * 360 / n - 90) * Math.PI / 180; place(s, g.cx + Math.cos(a) * g.OR - g.S / 2, g.cy + Math.sin(a) * g.OR - g.S / 2, g.S, g.S) }) },
  setSats(ctx, list, hub) { ctx.$$('.mx-sat').forEach((s, j) => { const it = list[j]; s.style.display = it == null ? 'none' : ''; if (it == null) return; const im = s.querySelector('img');
    if (hub) { const c = ctx.cu.cats[it]; im.src = ctx.img(c.items[0]); s.dataset.act = 'cat'; s.dataset.i = it; s.querySelector('.cap').textContent = c[ctx.lang] }
    else { im.src = ctx.img(it); s.dataset.act = 'sat'; s.dataset.k = it; s.querySelector('.cap').textContent = '' } }); this.pos(ctx) },
  setCenter(ctx, k, hub) { const p = ctx.$('.mx-plate'), im = p.querySelector('img'); im.src = ctx.img(k); im.alt = ctx.nm(k); p.dataset.k = k; p.dataset.act = hub ? 'none' : 'dish';
    ctx.$('.mx-info').innerHTML = hub ? `<span class="mx-ds">${ctx.u().pick}</span>` : `<b class="mx-nm">${esc(ctx.nm(k))}</b><span class="mx-ds">${esc(ctx.ds(k))}</span>${ctx.pr(k)}` },
  async hub(ctx, o = {}) { const bc = ctx.$('.mx-big-cat'); bc.textContent = ctx.cu[ctx.lang]; const cats = ctx.cu.cats.map((c, i) => i).slice(0, 5);
    if (o.instant) { this.setCenter(ctx, ctx.cu.cats[0].items[0], true); return this.setSats(ctx, cats, true) }
    const sats = ctx.$$('.mx-sat img'); if (!o.arrive) await leave(sats.filter(i => i.closest('.mx-sat').style.display !== 'none'), [ctx.$('.mx-info')]);
    this.setCenter(ctx, ctx.cu.cats[0].items[0], true); this.setSats(ctx, cats, true);
    const r0 = ctx.rot; tween(1100, t => { ctx.rot = r0 - 90 + 90 * t; this.pos(ctx) }, ease.out);
    await arrive(ctx.$$('.mx-sat').filter(s => s.style.display !== 'none').map(s => s.querySelector('img')).concat([ctx.$('.mx-plate img')]), [ctx.$('.mx-info'), bc]) },
  async cat(ctx, i, o = {}) { const items = ctx.cu.cats[i].items.slice(0, 6), center = items[0], rest = items.slice(1);
    if (o.instant) { this.setCenter(ctx, center); return this.setSats(ctx, rest) }
    const src = o.from === 'hub' ? ctx.$(`.mx-sat[data-i="${i}"] img`) : null, pimg = ctx.$('.mx-plate img'), a = src && src.getBoundingClientRect();
    await leave(ctx.$$('.mx-sat').filter(s => s.style.display !== 'none' && (!src || !s.contains(src))).map(s => s.querySelector('img')).concat(src ? [] : [pimg]), [ctx.$('.mx-info'), ctx.$('.mx-big-cat')]);
    this.setCenter(ctx, center); await decodeAll([pimg]);
    if (src) { const b = pimg.getBoundingClientRect(); src.style.opacity = 0; A(pimg, [{ transform: `translate(${a.left - b.left}px,${a.top - b.top}px) scale(${a.width / b.width})` }, { transform: 'none' }], { duration: 700, easing: EZ.in }) } else arrive([pimg], []);
    this.setSats(ctx, rest); ctx.$$('.mx-sat img').forEach(im => im.style.opacity = '');
    const r0 = ctx.rot; tween(1000, t => { ctx.rot = r0 + 120 * t; this.pos(ctx) }, ease.out);
    await arrive(ctx.$$('.mx-sat').filter(s => s.style.display !== 'none').map(s => s.querySelector('img')), [ctx.$('.mx-info')], 80) },
  async act(ctx, a, b) { if (a !== 'sat' || ctx.busy) return; ctx.busy = true;
    const k = b.dataset.k, p = ctx.$('.mx-plate'), old = p.dataset.k, pim = p.querySelector('img'), sim = b.querySelector('img'), ra = sim.getBoundingClientRect(), rb = pim.getBoundingClientRect();
    A(ctx.$('.mx-info'), [{ opacity: 1 }, { opacity: 0 }], { duration: 200 });
    this.setCenter(ctx, k); sim.src = ctx.img(old); b.dataset.k = old; await decodeAll([pim, sim]);
    A(pim, [{ transform: `translate(${ra.left - rb.left}px,${ra.top - rb.top}px) scale(${ra.width / rb.width})` }, { transform: 'none' }], { duration: 650, easing: EZ.in });
    A(sim, [{ transform: `translate(${rb.left - ra.left}px,${rb.top - ra.top}px) scale(${rb.width / ra.width})` }, { transform: 'none' }], { duration: 650, easing: EZ.in });
    const r0 = ctx.rot; await Promise.all([tween(650, t => { ctx.rot = r0 + 30 * t; this.pos(ctx) }, ease.out), A(ctx.$('.mx-info'), [{ opacity: 0, transform: 'translateY(2cqmin)' }, { opacity: 1, transform: 'none' }], { duration: 450, delay: 250 })]);
    ctx.busy = false }
};

/* 3 — Lazy Susan: a round table turns to bring the next dish forward */
FAM['susan'] = {
  M: 8,
  setup(ctx) { ctx.ang = 0; ctx.stage.innerHTML = `<div class="mx-table"></div><div class="mx-big-cat"></div><div class="mx-info"></div>` + Array.from({ length: this.M }, (_, j) => `<button class="mx-it" data-j="${j}"><div class="mx-dish"><img alt=""></div></button>`).join('') + `<button class="mx-ic mx-arrow" data-act="rot" data-d="-1" aria-label="prev">${ICON.l}</button><button class="mx-ic mx-arrow" data-act="rot" data-d="1" aria-label="next">${ICON.r}</button>` },
  geo(ctx) { const W = ctx.W(), H = ctx.H(), wide = ctx.wide(); const R = wide ? Math.min(W * .42, H * .95) : W * .68, top = wide ? H * .44 : H * .5; return { cx: W / 2, cy: top + R, R, IR: R * .76, S: wide ? H * .22 : W * .24, info: wide ? H * .14 : H * .21, ay: wide ? H * .7 : top + R * .24, W, H } },
  layout(ctx) { const g = this.geo(ctx); ctx.g = g; place(ctx.$('.mx-table'), g.cx - g.R, g.cy - g.R, g.R * 2, g.R * 2); Object.assign(ctx.$('.mx-info').style, { top: g.info + 'px' });
    const ar = ctx.$$('.mx-arrow'); place(ar[0], g.W * .04, g.ay, 44, 44); place(ar[1], g.W * .96 - 44, g.ay, 44, 44); ar[0].style.width = ar[1].style.width = ''; ctx.$('.mx-big-cat').style.top = g.H * .155 + 'px'; this.pos(ctx) },
  pos(ctx) { const g = ctx.g, st = 360 / this.M; ctx.$$('.mx-it').forEach((n, j) => { const deg = -90 + j * st + ctx.ang, a = deg * Math.PI / 180, f = Math.max(0, Math.cos((deg + 90) * Math.PI / 180)), s = .6 + .42 * f ** 3;
    place(n, g.cx + Math.cos(a) * g.IR - g.S / 2, g.cy + Math.sin(a) * g.IR - g.S / 2, g.S, g.S); n.style.transform = `scale(${s})`; n.style.zIndex = Math.round(f * 10); n.style.opacity = .35 + .65 * f }) },
  front(ctx) { const st = 360 / this.M; return ((Math.round(-ctx.ang / st) % this.M) + this.M) % this.M },
  setItems(ctx, list, hub) { ctx.list = list; ctx.hubMode = hub; ctx.$$('.mx-it').forEach((n, j) => { const it = list[j % list.length], im = n.querySelector('img'); im.src = ctx.img(hub ? ctx.cu.cats[it].items[0] : it); n.dataset.v = it; n.dataset.act = 'pick' }); this.info(ctx) },
  info(ctx) { const it = ctx.list[this.front(ctx) % ctx.list.length], inf = ctx.$('.mx-info');
    inf.innerHTML = ctx.hubMode ? `<b class="mx-nm">${esc(ctx.cn(it))}</b><span class="mx-ds">${ctx.u().items(ctx.cu.cats[it].items.length)} · ${ctx.u().enter}</span>` : `<b class="mx-nm">${esc(ctx.nm(it))}</b><span class="mx-ds">${esc(ctx.ds(it))}</span>${ctx.pr(it)}` },
  async turn(ctx, steps, dur = 700) { const st = 360 / this.M, a0 = ctx.ang, inf = ctx.$('.mx-info'); A(inf, [{ opacity: 1 }, { opacity: 0 }], { duration: 160 }); await tween(dur, t => { ctx.ang = a0 - steps * st * t; this.pos(ctx) }, ease.io); this.info(ctx); A(inf, [{ opacity: 0, transform: 'translateY(2cqmin)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: EZ.in }) },
  async spinSwap(ctx, fill) { const a0 = ctx.ang, ims = ctx.$$('.mx-it img'); A(ctx.$('.mx-info'), [{ opacity: 1 }, { opacity: 0 }], { duration: 200 }); let swapped = false;
    await tween(1300, t => { ctx.ang = a0 - 360 * t; this.pos(ctx); if (!swapped && t > .45) { swapped = true; fill(); ims.forEach((im, j) => A(im, [{ transform: 'scale(.2) rotate(60deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 500, delay: j * 30, easing: EZ.in })) } }, ease.io);
    ctx.ang = a0; this.pos(ctx); this.info(ctx); A(ctx.$('.mx-info'), [{ opacity: 0 }, { opacity: 1 }], { duration: 400 }) },
  async hub(ctx, o = {}) { ctx.$('.mx-big-cat').textContent = ctx.u().pick; const cats = ctx.cu.cats.map((c, i) => i);
    if (o.instant) { ctx.ang = 0; return this.setItems(ctx, cats, true) }
    if (o.arrive) { ctx.ang = 0; this.setItems(ctx, cats, true); const a0 = 120; await tween(1200, t => { ctx.ang = a0 * (1 - t); this.pos(ctx) }, ease.out); return }
    await this.spinSwap(ctx, () => { ctx.ang = 0; this.setItems(ctx, cats, true) }) },
  async cat(ctx, i, o = {}) { ctx.$('.mx-big-cat').textContent = ctx.cn(i); const items = ctx.cu.cats[i].items;
    if (o.instant) return this.setItems(ctx, items, false);
    await this.spinSwap(ctx, () => this.setItems(ctx, items, false)) },
  act(ctx, a, b) { if (ctx.busy) return;
    if (a === 'rot') { ctx.busy = true; this.turn(ctx, +b.dataset.d * (ctx.el.dir === 'rtl' ? -1 : 1)).then(() => ctx.busy = false); return }
    if (a === 'pick') { const j = +b.dataset.j, f = this.front(ctx); if (j === f) { if (ctx.hubMode) ctx.toCat(+b.dataset.v); else openDetail(ctx, b.dataset.v, b.querySelector('img')); return }
      let d = j - f; if (d > this.M / 2) d -= this.M; if (d < -this.M / 2) d += this.M; ctx.busy = true; this.turn(ctx, d, 500 + Math.abs(d) * 120).then(() => ctx.busy = false) } },
  swipe(ctx, dir) { if (ctx.busy) return true; ctx.busy = true; this.turn(ctx, dir).then(() => ctx.busy = false); return true }
};

/* 4 — Book of Plates: contents page, then pages that turn in 3D */
FAM['book'] = {
  setup(ctx) { ctx.stage.innerHTML = `<div class="mx-book"><div class="mx-page-l"></div><div class="mx-page"></div></div>` },
  layout() {},
  hubHTML(ctx) { return `<h4>${ctx.u().contents}</h4><div class="mx-toc">${ctx.cu.cats.map((c, i) => `<button data-act="cat" data-i="${i}"><span class="th mx-dish"><img src="${ctx.img(c.items[0])}" alt=""></span><b>${esc(c[ctx.lang])}</b><i>${i + 2}</i></button>`).join('')}</div><div class="pno">1</div>` },
  catHTML(ctx, i) { const c = ctx.cu.cats[i]; return `<h4>${esc(c[ctx.lang])}</h4><div class="mx-list">${c.items.slice(0, 4).map(k => `<button data-act="dish" data-k="${k}"><span class="th mx-dish"><img src="${ctx.img(k)}" alt="${esc(ctx.nm(k))}"></span><span><b class="mx-nm" style="display:block">${esc(ctx.nm(k))}</b><span class="mx-ds" style="display:block">${esc(ctx.ds(k))}</span>${ctx.pr(k)}</span></button>`).join('')}</div><div class="pno">${i + 2}</div>` },
  leftHTML(ctx, k, cap) { return `<div class="mx-feat-big mx-dish breathe"><img src="${ctx.img(k)}" alt=""></div><div class="mx-info" style="bottom:6%;left:8%;right:8%"><b class="mx-nm">${esc(cap)}</b></div>` },
  async turn(ctx, html, left, fwd) {
    const page = ctx.$('.mx-page'), L = ctx.$('.mx-page-l'), rtl = ctx.el.dir === 'rtl';
    if (RM) { page.innerHTML = html; L.innerHTML = left; return }
    const leaf = page.cloneNode(true); leaf.classList.add('leaf'); leaf.style.zIndex = 3; page.parentNode.appendChild(leaf);
    const ang = (rtl ? 1 : -1) * 178;
    if (fwd) { page.innerHTML = html; L.innerHTML = left; await A(leaf, [{ transform: 'rotateY(0)', filter: 'brightness(1)' }, { transform: `rotateY(${ang}deg)`, filter: 'brightness(.6)' }], { duration: 900, easing: EZ.io }); leaf.remove() }
    else { leaf.innerHTML = html; await A(leaf, [{ transform: `rotateY(${ang}deg)`, filter: 'brightness(.6)' }, { transform: 'rotateY(0)', filter: 'brightness(1)' }], { duration: 900, easing: EZ.io }); page.innerHTML = html; L.innerHTML = left; leaf.remove() }
    arrive(ctx.$$('.mx-page .th img'), ctx.$$('.mx-page button > :not(.th)'), 70);
  },
  async hub(ctx, o = {}) { const f = ctx.cu.cats[0].items[0], left = this.leftHTML(ctx, f, ctx.cu[ctx.lang]);
    if (o.instant || o.arrive) { ctx.$('.mx-page').innerHTML = this.hubHTML(ctx); ctx.$('.mx-page-l').innerHTML = left; if (o.arrive) arrive(ctx.$$('.mx-page .th img'), ctx.$$('.mx-toc b'), 80); return }
    await this.turn(ctx, this.hubHTML(ctx), left, false) },
  async cat(ctx, i, o = {}) { const c = ctx.cu.cats[i], left = this.leftHTML(ctx, c.items[0], c[ctx.lang]);
    if (o.instant) { ctx.$('.mx-page').innerHTML = this.catHTML(ctx, i); ctx.$('.mx-page-l').innerHTML = left; return }
    await this.turn(ctx, this.catHTML(ctx, i), left, o.from === 'hub' || i > o.prev) }
};

/* 5 — Sliding Doors: every section waits behind its own door */
FAM['doors'] = {
  setup(ctx) { ctx.stage.innerHTML = `<div class="mx-room"><div class="mx-grid"></div></div><div class="mx-doors"></div><div class="mx-panels"><i></i><i></i></div>` },
  layout() {},
  doorsHTML(ctx) { return ctx.cu.cats.map((c, i) => `<button class="mx-door" data-act="cat" data-i="${i}"><span class="lbl">${esc(c[ctx.lang])}</span><span class="knob"></span><span class="mx-dish"><img src="${ctx.img(c.items[0])}" alt=""></span></button>`).join('') },
  roomHTML(ctx, i) { return ctx.cu.cats[i].items.map(k => `<button class="mx-card" data-act="dish" data-k="${k}"><span class="th mx-dish"><img src="${ctx.img(k)}" alt="${esc(ctx.nm(k))}"></span><b class="mx-nm">${esc(ctx.nm(k))}</b>${ctx.pr(k)}</button>`).join('') },
  async hub(ctx, o = {}) { const d = ctx.$('.mx-doors'); d.innerHTML = this.doorsHTML(ctx); d.style.display = ''; const ds = [...d.children];
    if (o.instant) return;
    if (o.arrive) { await Promise.all(ds.map((n, j) => A(n, [{ transform: 'translateY(105%)' }, { transform: 'none' }], { duration: 700, delay: 300 + j * 90, easing: EZ.back }))); return }
    const mid = (ds.length - 1) / 2; await Promise.all(ds.map((n, j) => A(n, [{ transform: `translateX(${(j < mid ? -1 : 1) * 120}%)` }, { transform: 'none' }], { duration: 650, delay: Math.abs(j - mid) * 60, easing: EZ.in }))) },
  async cat(ctx, i, o = {}) { const g = ctx.$('.mx-grid'), d = ctx.$('.mx-doors');
    if (o.instant) { g.innerHTML = this.roomHTML(ctx, i); d.style.display = 'none'; return }
    if (o.from === 'hub') { g.innerHTML = this.roomHTML(ctx, i); const ds = [...d.children], ti = ds.findIndex(n => +n.dataset.i === i);
      await Promise.all(ds.map((n, j) => j === ti ? A(n, [{ transform: 'none' }, { transform: 'translateY(-105%)' }], { duration: 750, easing: EZ.io }) : A(n, [{ transform: 'none' }, { transform: `translateX(${(j < ti ? -1 : 1) * 130}%)` }], { duration: 650, delay: Math.abs(j - ti) * 50, easing: EZ.out })));
      d.style.display = 'none'; await arrive(ctx.$$('.mx-grid .th img'), ctx.$$('.mx-card > :not(.th)'), 70); return }
    const [a, b] = ctx.$$('.mx-panels i'); await Promise.all([A(a, [{ transform: 'translateX(-101%)' }, { transform: 'none' }], { duration: 480, easing: EZ.io }), A(b, [{ transform: 'translateX(101%)' }, { transform: 'none' }], { duration: 480, easing: EZ.io })]);
    g.innerHTML = this.roomHTML(ctx, i); await sleep(120); await decodeAll(ctx.$$('.mx-grid img'));
    await Promise.all([A(a, [{ transform: 'none' }, { transform: 'translateX(-101%)' }], { duration: 560, easing: EZ.io }), A(b, [{ transform: 'none' }, { transform: 'translateX(101%)' }], { duration: 560, easing: EZ.io }), arrive(ctx.$$('.mx-grid .th img'), [], 60)]) }
};

/* ---------- 2026 style families ---------- */
const blurIn = els => Promise.all(els.map((e, j) => A(e, [{ opacity: 0, filter: 'blur(12px)', transform: 'translateY(4cqmin) scale(.96)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }], { duration: 700, delay: j * 70, easing: EZ.in })));

/* 6 — Liquid Glass: frosted cards over moving colour; a glass lens sweeps the content away */
FAM['glass'] = {
  setup(ctx) { ctx.stage.innerHTML = `<div class="gl-blobs"><i></i><i></i><i></i></div><div class="gl-wrap"><div class="gl-title"></div><div class="gl-list"></div></div><div class="gl-lens"></div>` },
  layout() {},
  hubHTML(ctx) { return `<div class="gl-grid">${ctx.cu.cats.map((c, i) => `<button class="gl-card" data-act="cat" data-i="${i}"><span class="th mx-dish"><img src="${ctx.img(c.items[0])}" alt=""></span><b class="mx-nm">${esc(c[ctx.lang])}</b><span class="mx-ds">${ctx.u().items(c.items.length)}</span></button>`).join('')}</div>` },
  catHTML(ctx, i) { return ctx.cu.cats[i].items.map(k => `<button class="gl-row" data-act="dish" data-k="${k}"><span class="th mx-dish"><img src="${ctx.img(k)}" alt="${esc(ctx.nm(k))}"></span><span class="tx"><b class="mx-nm">${esc(ctx.nm(k))}</b><span class="mx-ds">${esc(ctx.ds(k))}</span>${ctx.pr(k)}</span></button>`).join('') },
  async sweep(ctx, fill) { if (RM) return fill(); const lens = ctx.$('.gl-lens'), d = ctx.el.dir === 'rtl' ? 1 : -1;
    const a = A(lens, [{ transform: `translateX(${d * 130}%)` }, { transform: `translateX(${-d * 130}%)` }], { duration: 1150, easing: EZ.io });
    await sleep(480); fill(); await decodeAll(ctx.$$('.gl-list img')); blurIn(ctx.$$('.gl-list .gl-card, .gl-list .gl-row')); await a },
  async hub(ctx, o = {}) { const fill = () => { ctx.$('.gl-title').textContent = ctx.u().pick; ctx.$('.gl-list').innerHTML = this.hubHTML(ctx); ctx.$('.gl-wrap').scrollTop = 0 };
    if (o.instant) return fill(); if (o.arrive) { fill(); return blurIn(ctx.$$('.gl-card')) } await this.sweep(ctx, fill) },
  async cat(ctx, i, o = {}) { const fill = () => { ctx.$('.gl-title').textContent = ctx.cn(i); ctx.$('.gl-list').innerHTML = this.catHTML(ctx, i); ctx.$('.gl-wrap').scrollTop = 0 };
    if (o.instant) return fill(); await this.sweep(ctx, fill) }
};

/* 7 — Kinetic Type: giant section words stretch, squash and re-form */
FAM['kinetic'] = {
  setup(ctx) { ctx.stage.innerHTML = `<div class="kn-words"></div><div class="kn-strip"></div>` },
  layout() {},
  fs(txt, max) { return Math.min(max, 88 / Math.max(3, txt.length * .58)) },
  listHTML(ctx) { return ctx.cu.cats.map((c, i) => `<button class="kn-w${i % 2 ? ' o' : ''}" data-act="cat" data-i="${i}" style="font-size:${this.fs(c[ctx.lang], 17)}cqw"><span>${esc(c[ctx.lang])}</span><img src="${ctx.img(c.items[0])}" alt=""></button>`).join('') },
  stripHTML(ctx, i) { return ctx.cu.cats[i].items.map(k => `<button class="kn-card" data-act="dish" data-k="${k}"><span class="th mx-dish"><img src="${ctx.img(k)}" alt="${esc(ctx.nm(k))}"></span><b class="mx-nm">${esc(ctx.nm(k))}</b><span class="mx-ds">${esc(ctx.ds(k))}</span>${ctx.pr(k)}</button>`).join('') },
  stretchIn: (els, d = 0) => Promise.all(els.map((e, j) => A(e, [{ transform: 'scale(1.7,.15)', opacity: 0 }, { transform: 'scale(.88,1.18)', opacity: 1, offset: .55 }, { transform: 'scale(1.04,.97)', offset: .8 }, { transform: 'none', opacity: 1 }], { duration: 760, delay: d + j * 90, easing: 'ease-out' }))),
  async hub(ctx, o = {}) { const w = ctx.$('.kn-words'), s = ctx.$('.kn-strip');
    if (!o.instant && !o.arrive) await Promise.all([A(w.firstElementChild, [{ transform: 'none', opacity: 1 }, { transform: 'scale(.6,1.6) translateY(-20%)', opacity: 0 }], { duration: 320, easing: EZ.out }), A(s, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(20%)', opacity: 0 }], { duration: 320 })]);
    w.className = 'kn-words list'; w.innerHTML = this.listHTML(ctx); s.innerHTML = ''; s.style.opacity = '';
    if (!o.instant) await this.stretchIn([...w.children], o.arrive ? 250 : 0) },
  async cat(ctx, i, o = {}) { const w = ctx.$('.kn-words'), s = ctx.$('.kn-strip'), name = ctx.cn(i);
    const set = () => { w.className = 'kn-words one'; w.innerHTML = `<div class="kn-w big" style="font-size:${this.fs(name, 24)}cqw"><span>${esc(name)}</span></div>`; s.innerHTML = this.stripHTML(ctx, i); s.scrollLeft = 0 };
    if (o.instant) return set();
    const lines = [...w.children], tap = o.from === 'hub' ? lines[i] : null, side = ctx.el.dir === 'rtl' ? -1 : 1;
    await Promise.all([...lines.map((l, j) => l === tap ? A(l, [{ transform: 'none' }, { transform: 'scale(1.25,.8)' }, { transform: 'scale(.4,1.8) translateY(-30%)', opacity: 0 }], { duration: 420, easing: EZ.out }) : A(l, [{ transform: 'none', opacity: 1 }, { transform: `translateX(${(j % 2 ? 1 : -1) * 120}%)`, opacity: 0 }], { duration: 380, delay: j * 40, easing: EZ.out })),
      ...[...s.children].map((c, j) => A(c, [{ transform: 'none', opacity: 1 }, { transform: `translateX(${side * 60}%)`, opacity: 0 }], { duration: 300, delay: j * 40, easing: EZ.out }))]);
    set(); await decodeAll(ctx.$$('.kn-strip img'));
    await Promise.all([this.stretchIn([w.firstElementChild]), ...[...s.children].map((c, j) => A(c, [{ transform: `translateX(${-side * 70}%) rotate(${-side * 6}deg)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 650, delay: 250 + j * 90, easing: EZ.back }))]) }
};

/* 8 — Curved Carousel: dishes ride the inside of a cylinder; drag, snap, tap the centre */
FAM['reel'] = {
  setup(ctx) { ctx.pos = 0; ctx.stage.innerHTML = `<div class="mx-big-cat"></div><div class="rl-track"></div><div class="mx-info rl-info"></div>`;
    const tr = ctx.$('.rl-track'); let d = null;
    tr.addEventListener('pointerdown', e => { d = { x: e.clientX, p: ctx.pos, t: performance.now(), v: 0, m: 0, id: e.pointerId } });
    tr.addEventListener('pointermove', e => { if (!d) return; if (!d.cap && Math.abs(e.clientX - d.x) > 8) { d.cap = true; tr.setPointerCapture(d.id) } if (!d.cap) return; const pitch = this.pitch(ctx), dx = (e.clientX - d.x) * (ctx.el.dir === 'rtl' ? -1 : 1); const np = d.p - dx / pitch, now = performance.now(); d.v = (np - ctx.pos) / Math.max(8, now - d.t); d.t = now; d.m = Math.max(d.m, Math.abs(e.clientX - d.x)); ctx.pos = Math.max(-.4, Math.min(ctx.list.length - .6, np)); this.pos(ctx) });
    tr.addEventListener('pointerup', e => { if (!d) return; const moved = d.m > 8, v = d.v; d = null; ctx.dragged = moved; if (moved) this.snap(ctx, Math.round(ctx.pos + v * 220)) }) },
  pitch(ctx) { return ctx.wide() ? ctx.H() * .42 : ctx.W() * .36 },
  layout(ctx) { this.pos(ctx) },
  pos(ctx) { if (!ctx.list) return; const W = ctx.W(), H = ctx.H(), wide = ctx.wide(), cx = W / 2, cy = wide ? H * .48 : H * .44, cw = wide ? H * .36 : W * .42, ch = cw * 1.32, R = W * .5, pitch = this.pitch(ctx), s = ctx.el.dir === 'rtl' ? -1 : 1;
    ctx.$$('.rl-card').forEach((c, j) => { const t = (j - ctx.pos) * pitch * s, x = cx + t * (1 + .08 * (t / R) ** 2), d = Math.min(1.6, Math.abs(t) / R);
      c.style.width = cw + 'px'; c.style.height = ch + 'px'; c.style.transform = `translate(${x - cw / 2}px,${cy - ch / 2 - d * d * ch * .04}px) perspective(${W * 1.4}px) rotateY(${-Math.sign(t) * Math.min(42, d * 30)}deg) scale(${1 + .16 * d * d})`; c.style.zIndex = 20 - Math.round(d * 10); c.style.opacity = Math.max(0, 1 - .28 * d) });
    const ci = Math.round(ctx.pos); if (ci !== ctx.ci) { ctx.ci = ci; this.info(ctx) } },
  info(ctx) { const it = ctx.list[Math.max(0, Math.min(ctx.list.length - 1, ctx.ci))], inf = ctx.$('.rl-info');
    inf.innerHTML = ctx.hubMode ? `<b class="mx-nm">${esc(ctx.cn(it))}</b><span class="mx-ds">${ctx.u().items(ctx.cu.cats[it].items.length)} · ${ctx.u().enter}</span>` : `<b class="mx-nm">${esc(ctx.nm(it))}</b><span class="mx-ds">${esc(ctx.ds(it))}</span>${ctx.pr(it)}`;
    if (!RM) A(inf, [{ opacity: 0, transform: 'translateY(2cqmin)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: EZ.in }) },
  async snap(ctx, j) { j = Math.max(0, Math.min(ctx.list.length - 1, j)); const p0 = ctx.pos; await tween(Math.min(700, 260 + Math.abs(j - p0) * 160), t => { ctx.pos = p0 + (j - p0) * t; this.pos(ctx) }, ease.out) },
  set(ctx, list, hub) { ctx.list = list; ctx.hubMode = hub; ctx.ci = null; const tr = ctx.$('.rl-track');
    tr.innerHTML = list.map((it, j) => `<button class="rl-card" data-act="rl" data-j="${j}"><span class="mx-dish"><img src="${ctx.img(hub ? ctx.cu.cats[it].items[0] : it)}" alt="${esc(hub ? ctx.cn(it) : ctx.nm(it))}"></span>${hub ? `<b>${esc(ctx.cn(it))}</b>` : ''}</button>`).join(''); ctx.pos = 0; this.pos(ctx) },
  async swapTo(ctx, list, hub, first) { const imgs = () => ctx.$$('.rl-card'), bc = ctx.$('.mx-big-cat');
    if (!first) await Promise.all(imgs().map((c, j) => A(c.firstElementChild, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(60%) rotate(12deg)', opacity: 0 }], { duration: 320, delay: j * 40, easing: EZ.out })));
    this.set(ctx, list, hub); bc.textContent = hub ? ctx.u().pick : ''; await decodeAll(ctx.$$('.rl-card img'));
    await Promise.all(imgs().map((c, j) => A(c.firstElementChild, [{ transform: 'translateY(-70%) rotate(-14deg)', opacity: 0 }, { transform: 'translateY(4%)', opacity: 1, offset: .7 }, { transform: 'none', opacity: 1 }], { duration: 700, delay: j * 80, easing: EZ.in }))) },
  async hub(ctx, o = {}) { const cats = ctx.cu.cats.map((c, i) => i); if (o.instant) { this.set(ctx, cats, true); ctx.$('.mx-big-cat').textContent = ctx.u().pick; return } await this.swapTo(ctx, cats, true, o.arrive) },
  async cat(ctx, i, o = {}) { if (o.instant) return this.set(ctx, ctx.cu.cats[i].items, false); await this.swapTo(ctx, ctx.cu.cats[i].items, false) },
  act(ctx, a, b) { if (a !== 'rl' || ctx.busy) return; if (ctx.dragged) { ctx.dragged = false; return } const j = +b.dataset.j;
    if (j !== Math.round(ctx.pos)) { this.snap(ctx, j); return } const it = ctx.list[j]; if (ctx.hubMode) ctx.toCat(it); else openDetail(ctx, it, b.querySelector('img')) },
  swipe() { return true }
};

/* 9 — Bento: a tile grid that flips in a wave between sections */
FAM['bento'] = {
  setup(ctx) { ctx.stage.innerHTML = `<div class="mx-big-cat"></div><div class="bn-grid"></div>` },
  layout() {},
  tiles(ctx, list, hub) { const n = list.length; return list.map((it, j) => { const big = j === 0, wide = !big && j === n - 1 && (n - 1) % 2 === 1, k = hub ? ctx.cu.cats[it].items[0] : it;
    const body = hub ? `<b class="mx-nm">${esc(ctx.cn(it))}</b><span class="mx-ds">${ctx.u().items(ctx.cu.cats[it].items.length)}</span>` : `<b class="mx-nm">${esc(ctx.nm(k))}</b>${big ? `<span class="mx-ds">${esc(ctx.ds(k))}</span>` : ''}${ctx.pr(k)}`;
    return `<button class="bn-t${big ? ' big' : ''}${wide ? ' wide' : ''}" ${hub ? `data-act="cat" data-i="${it}"` : `data-act="dish" data-k="${k}"`}><span class="th mx-dish"><img src="${ctx.img(k)}" alt="${esc(ctx.nm(k))}"></span><span class="tx">${body}</span></button>` }).join('') },
  async flip(ctx, html, first) { const g = ctx.$('.bn-grid'), P = 'perspective(140cqmin) ';
    if (!first) await Promise.all([...g.children].map((t, j) => A(t, [{ transform: P + 'rotateY(0)' }, { transform: P + 'rotateY(90deg)', opacity: .4 }], { duration: 260, delay: j * 70, easing: EZ.out })));
    g.innerHTML = html; await decodeAll(ctx.$$('.bn-grid img'));
    await Promise.all([...g.children].map((t, j) => A(t, [{ transform: P + 'rotateY(-90deg)', opacity: .4 }, { transform: P + 'rotateY(8deg)', opacity: 1, offset: .75 }, { transform: 'none', opacity: 1 }], { duration: 560, delay: j * 80, easing: EZ.in }))) },
  async hub(ctx, o = {}) { const bc = ctx.$('.mx-big-cat'); bc.textContent = ctx.u().pick; const html = this.tiles(ctx, ctx.cu.cats.map((c, i) => i), true);
    if (o.instant) { ctx.$('.bn-grid').innerHTML = html; return } await this.flip(ctx, html, o.arrive) },
  async cat(ctx, i, o = {}) { ctx.$('.mx-big-cat').textContent = ''; const html = this.tiles(ctx, ctx.cu.cats[i].items.slice(0, 5), false);
    if (o.instant) { ctx.$('.bn-grid').innerHTML = html; return } await this.flip(ctx, html) }
};

/* ================= display loops ================= */
function mountLoop(ctx) {
  const el = ctx.el, cu = ctx.cu, fam = ctx.cfg.family;
  el.innerHTML = `<div class="mx-tex"></div><div class="mx-stage"></div><header class="mx-hd" style="pointer-events:none"><div class="mx-brand"><b>${ctx.u().menu}</b><span>${esc(cu[ctx.lang])}</span></div></header>`;
  ctx.stage = ctx.$('.mx-stage'); ctx.wide();
  let running = false, stop = false;
  const L = LOOP[fam]; L.setup(ctx);
  const ro = new ResizeObserver(() => { ctx.wide(); L.layout && L.layout(ctx) }); ro.observe(el);
  ctx.ok = () => ctx.alive && !stop;
  const run = async () => { if (running) return; running = true; stop = false; try { do { await L.cycle(ctx) } while (ctx.ok() && !ctx.record); if (ctx.record && ctx.onDone) ctx.onDone() } catch (e) { console.error(e) } running = false };
  if (!ctx.thumb || ctx.cfg.autoplay !== false) run();
  return { play() { if (!running) run() }, pause() { stop = true }, destroy() { ctx.alive = false; ro.disconnect() } };
}
const LOOP = {};
const hold = async (ctx, ms) => { const t0 = performance.now(); while (ctx.ok() && performance.now() - t0 < ms) await sleep(100) };
const flat = cu => [...new Set(cu.cats.flatMap(c => c.items))];

/* B1 — Spine Parade */
LOOP['spine-parade'] = {
  setup(ctx) { const S = FAM['puzzle-spine']; S.setup(ctx); S.layout(ctx); this.S = S },
  layout(ctx) { FAM['puzzle-spine'].layout(ctx) },
  async cycle(ctx) { const S = FAM['puzzle-spine'], bc = ctx.$('.mx-big-cat');
    for (let i = 0; i < ctx.cu.cats.length && ctx.ok(); i++) { const items = ctx.cu.cats[i].items.slice(0, 4);
      A(bc, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-2cqmin)' }], { duration: 250 });
      await S.swap(ctx, items, 'cat', i === 0 && !ctx.started); ctx.started = true; bc.textContent = ctx.cn(i);
      A(bc, [{ opacity: 0, transform: 'translateY(2cqmin)' }, { opacity: 1, transform: 'none' }], { duration: 450 });
      await hold(ctx, 3200) } }
};
/* B2 — Hero Turntable */
LOOP['turntable'] = {
  setup(ctx) { ctx.stage.innerHTML = `<div class="mx-spot"></div><div class="mx-plinth"></div><div class="mx-ab tt-flip" style="left:50%;bottom:calc(10% + 16cqmin);width:70cqmin;height:56cqmin;margin-left:-35cqmin"><div class="mx-dish mx-turn" style="inset:0"><img alt="" style="object-position:50% 100%"></div></div><div class="mx-title" style="top:16%"><div class="k"></div><div class="mx-ds" style="font-size:3.4cqmin;margin-top:1cqmin"></div></div><div class="mx-stamp" style="width:22cqmin;height:22cqmin;right:8%;bottom:30%"></div>` },
  async cycle(ctx) { const list = flat(ctx.cu).slice(0, 6), fl = ctx.$('.tt-flip'), im = fl.querySelector('img'), ti = ctx.$('.mx-title'), st = ctx.$('.mx-stamp');
    for (const k of list) { if (!ctx.ok()) return;
      if (ctx.started) await Promise.all([A(fl, [{ transform: 'none' }, { transform: 'perspective(120cqmin) rotateY(90deg)' }], { duration: 320, easing: EZ.out }), A(ti, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'rotateX(80deg)' }], { duration: 300 }), A(st, [{ transform: 'none' }, { transform: 'scale(0) rotate(-90deg)' }], { duration: 280 })]);
      ctx.started = true; im.src = ctx.img(k); await decodeAll([im]); ti.querySelector('.k').textContent = ctx.nm(k); ti.querySelector('.mx-ds').textContent = ctx.ds(k); st.innerHTML = `${ctx.d(k).price.toFixed(3)}<small>${ctx.u().omr}</small>`;
      await Promise.all([A(fl, [{ transform: 'perspective(120cqmin) rotateY(-90deg)' }, { transform: 'none' }], { duration: 650, easing: EZ.back }), A(ti, [{ opacity: 0, transform: 'rotateX(-80deg)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 150 }), A(st, [{ transform: 'scale(0) rotate(90deg)' }, { transform: 'scale(1.15) rotate(-8deg)', offset: .7 }, { transform: 'rotate(-8deg)' }], { duration: 600, delay: 450, easing: EZ.in })]);
      await hold(ctx, 3000) } }
};
/* burger slicing for B3/B4 */
const BANDS = [[0, .36], [.36, .5], [.5, .69], [.69, 1]];
const burgerBox = async (ctx, k) => { const im = new Image(); im.src = ctx.img(k); try { await im.decode() } catch (e) {} return im.naturalHeight / Math.max(1, im.naturalWidth) || .7 };
function bandsHTML() { return BANDS.map((b, j) => `<div class="mx-band" data-j="${j}" style="inset:0;clip-path:inset(${b[0] * 100}% 0 ${(1 - b[1]) * 100}% 0)"></div>`).join('') }
/* B3 — Ingredient Explosion */
LOOP['explode'] = {
  setup(ctx) { ctx.stage.innerHTML = `<div class="mx-ab bx" style="left:50%;top:50%">${bandsHTML()}${BANDS.map((b, j) => `<div class="mx-lab" data-j="${j}"></div>`).join('')}</div><div class="mx-title" style="top:14%"><div class="k"></div></div><div class="mx-stamp" style="width:24cqmin;height:24cqmin;left:8%;bottom:10%"></div>` },
  async cycle(ctx) { const list = ['smash', 'avo', 'crispy', 'blue'], bx = ctx.$('.bx'), bands = ctx.$$('.mx-band'), labs = ctx.$$('.mx-lab'), ti = ctx.$('.mx-title .k'), st = ctx.$('.mx-stamp');
    for (const k of list) { if (!ctx.ok()) return; const ratio = await burgerBox(ctx, k), w = Math.min(ctx.W() * .54, ctx.H() * .4 / ratio), h = w * ratio;
      Object.assign(bx.style, { width: w + 'px', height: h + 'px', marginLeft: -w / 2 + 'px', marginTop: -h / 2 + 'px' }); bands.forEach(b => b.style.backgroundImage = `url(${ctx.img(k)})`);
      labs.forEach((l, j) => { l.textContent = ctx.u().layers[j]; Object.assign(l.style, { top: (BANDS[j][0] + BANDS[j][1]) / 2 * 100 + '%', insetInlineStart: '96%', opacity: 0 }) });
      ti.textContent = ctx.nm(k); st.innerHTML = `${ctx.d(k).price.toFixed(3)}<small>${ctx.u().omr}</small>`;
      await Promise.all([A(bx, [{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: EZ.in }), A(ti, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 })]); await hold(ctx, 900);
      const gap = h * .14; bx.style.left = ctx.el.dir === 'rtl' ? '62%' : '38%'; await Promise.all([...bands.map((b, j) => A(b, [{ transform: 'none' }, { transform: `translateY(${(j - 1.5) * gap}px) rotate(${(j % 2 ? 2 : -2)}deg)` }], { duration: 800, delay: j * 70, easing: EZ.back })), ...labs.map((l, j) => A(l, [{ opacity: 0, transform: `translateY(${(j - 1.5) * gap}px) translateX(-4cqmin)` }, { opacity: 1, transform: `translateY(${(j - 1.5) * gap}px)` }], { duration: 500, delay: 500 + j * 120 }))]);
      await hold(ctx, 2600);
      await Promise.all([...bands.map(b => A(b, [{ transform: getComputedStyle(b).transform }, { transform: 'none' }], { duration: 600, easing: EZ.io })), ...labs.map(l => A(l, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }))]);
      await A(st, [{ transform: 'scale(0) rotate(90deg)' }, { transform: 'scale(1.15) rotate(-10deg)', offset: .7 }, { transform: 'rotate(-10deg)' }], { duration: 550, easing: EZ.in }); await hold(ctx, 1600);
      await Promise.all([A(bx, [{ opacity: 1 }, { opacity: 0, transform: 'scale(.85)' }], { duration: 400 }), A(st, [{ transform: 'rotate(-10deg)' }, { transform: 'scale(0)' }], { duration: 300 }), A(ti, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 })]) } }
};
/* B4 — Stack Builder */
LOOP['stack'] = {
  setup(ctx) { LOOP.explode.setup(ctx) },
  async cycle(ctx) { const list = ['avo', 'smash', 'blue', 'crispy'], bx = ctx.$('.bx'), bands = ctx.$$('.mx-band'), ti = ctx.$('.mx-title .k'), st = ctx.$('.mx-stamp'); ctx.$$('.mx-lab').forEach(l => l.style.display = 'none');
    for (const k of list) { if (!ctx.ok()) return; const ratio = await burgerBox(ctx, k), w = Math.min(ctx.W() * .78, ctx.H() * .55 / ratio), h = w * ratio;
      Object.assign(bx.style, { width: w + 'px', height: h + 'px', marginLeft: -w / 2 + 'px', marginTop: -h / 2 + 'px', opacity: 1, transform: 'none' }); bands.forEach(b => { b.style.backgroundImage = `url(${ctx.img(k)})`; b.style.opacity = 0 });
      ti.textContent = ctx.nm(k); st.innerHTML = `${ctx.d(k).price.toFixed(3)}<small>${ctx.u().omr}</small>`;
      for (let j = 3; j >= 0 && ctx.ok(); j--) { bands[j].style.opacity = ''; await A(bands[j], [{ transform: `translateY(${-ctx.H()}px)`, opacity: 1 }, { transform: 'translateY(1.5cqmin)', offset: .75 }, { transform: 'none', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.5,0,.75,1)' }); A(bx, [{ transform: 'scaleY(.96)' }, { transform: 'none' }], { duration: 220 }) }
      await Promise.all([A(ti, [{ opacity: 0, transform: 'translateY(3cqmin)' }, { opacity: 1, transform: 'none' }], { duration: 500 }), A(st, [{ transform: 'scale(0) rotate(90deg)' }, { transform: 'scale(1.15) rotate(-10deg)', offset: .7 }, { transform: 'rotate(-10deg)' }], { duration: 550, delay: 200, easing: EZ.in })]);
      await hold(ctx, 2600);
      await Promise.all([...bands.map((b, j) => A(b, [{ transform: 'none', opacity: 1 }, { transform: `translateY(${-ctx.H()}px)`, opacity: 1 }], { duration: 520, delay: j * 70, easing: EZ.out })), A(ti, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }), A(st, [{ transform: 'rotate(-10deg)' }, { transform: 'scale(0)' }], { duration: 300 })]) } }
};
/* B5 — Steam & Pour */
LOOP['pour'] = {
  setup(ctx) { ctx.stage.innerHTML = `<div class="mx-stream"></div><div class="mx-ab gl" style="left:50%;bottom:12%;width:44cqmin;height:62cqmin;margin-left:-22cqmin"><div class="mx-dish" style="inset:0"><img alt=""></div></div><svg class="mx-ab mx-steam" viewBox="0 0 60 46" style="left:50%;width:30cqmin;height:24cqmin;margin-left:-15cqmin;bottom:calc(12% + 62cqmin)" aria-hidden="true"><path d="M14 44c-6-9 6-13 0-22s4-14 2-20"/><path d="M30 44c-6-9 6-13 0-22s4-14 2-20"/><path d="M46 44c-6-9 6-13 0-22s4-14 2-20"/></svg><div class="bubs"></div><div class="mx-title" style="top:14%"><div class="k"></div><div class="mx-ds" style="font-size:3.4cqmin;margin-top:1cqmin"></div></div><div class="mx-stamp" style="width:22cqmin;height:22cqmin;right:8%;bottom:26%"></div>` },
  async cycle(ctx) { const list = ['nanatea', 'karkade', 'talqeema', 'mint'], gl = ctx.$('.gl'), im = gl.querySelector('img'), sm = ctx.$('.mx-stream'), steam = ctx.$('.mx-steam'), bubs = ctx.$('.bubs'), ti = ctx.$('.mx-title'), st = ctx.$('.mx-stamp');
    for (const k of list) { if (!ctx.ok()) return; im.src = ctx.img(k); await decodeAll([im]); const cold = k === 'karkade';
      ti.querySelector('.k').textContent = ctx.nm(k); ti.querySelector('.mx-ds').textContent = ctx.ds(k); st.innerHTML = `${ctx.d(k).price.toFixed(3)}<small>${ctx.u().omr}</small>`;
      steam.style.display = cold ? 'none' : ''; bubs.innerHTML = cold ? [18, 30, 42, 52].map((x, j) => `<i class="mx-bub" style="left:calc(50% - 22cqmin + ${x * .44 * 1.6}cqmin);bottom:calc(12% + 10cqmin);width:${2 + j % 2}cqmin;height:${2 + j % 2}cqmin;animation-delay:${j * .6}s"></i>`).join('') : '';
      const g = gl.getBoundingClientRect(), s = ctx.stage.getBoundingClientRect(); Object.assign(sm.style, { left: '50%', top: '0', height: (g.top - s.top + g.height * .15) + 'px' });
      A(gl, [{ opacity: 0, transform: 'translateX(30cqmin)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: EZ.in });
      await A(sm, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 450, delay: 350, easing: EZ.in });
      await A(gl, [{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1500, easing: 'cubic-bezier(.3,.1,.3,1)' });
      await A(sm, [{ transform: 'scaleY(1)', transformOrigin: 'bottom' }, { transform: 'scaleY(0)', transformOrigin: 'bottom' }], { duration: 300 });
      await Promise.all([A(ti, [{ opacity: 0, transform: 'translateY(3cqmin)' }, { opacity: 1, transform: 'none' }], { duration: 500 }), A(st, [{ transform: 'scale(0) rotate(90deg)' }, { transform: 'scale(1.15) rotate(-8deg)', offset: .7 }, { transform: 'rotate(-8deg)' }], { duration: 550, delay: 200, easing: EZ.in })]);
      await hold(ctx, 2800);
      await Promise.all([A(gl, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(-30cqmin)' }], { duration: 450, easing: EZ.out }), A(ti, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }), A(st, [{ transform: 'rotate(-8deg)' }, { transform: 'scale(0)' }], { duration: 300 })]) } }
};

window.MenuEngine = { mount, families: Object.keys(FAM), loops: Object.keys(LOOP) };
})();
