/* MENUZA site logic. Content comes from content.js (window.MENUZA). */
(() => {
const C = window.MENUZA;
const $ = (q, r = document) => r.querySelector(q), $$ = (q, r = document) => [...r.querySelectorAll(q)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
let L = (() => { try { const s = localStorage.getItem('menuza-lang'); if (s === 'ar' || s === 'en') return s } catch (e) {} return (navigator.language || '').toLowerCase().startsWith('ar') ? 'ar' : 'en' })();
const T = (k, l = L) => C.t[l][k] ?? C.t.en[k] ?? k;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (n, l = L) => l === 'ar' ? (+n).toLocaleString('ar-EG') : String(n);
const omr = (n, l) => (+n).toFixed(3) + ' ' + T('demo.omr', l);
const wa = t => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(t)}`;
const icon = id => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;

/* ---------- QR codes (real, scannable) ---------- */
function qrSVG(text, fg = '#0D0C0A') {
  const q = qrcode(0, 'M'); q.addData(text); q.make(); const n = q.getModuleCount(); let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.isDark(y, x)) d += `M${x} ${y}h1v1h-1z`;
  return `<svg viewBox="-1 -1 ${n + 2} ${n + 2}" role="img" aria-label="QR code" shape-rendering="crispEdges"><path d="${d}" fill="${fg}"/></svg>`;
}

/* ---------- the live menu app ---------- */
function MenuApp(phone, demo) {
  const th = demo.theme, sc = document.createElement('div');
  sc.className = 'screen' + (th.heavy ? ' heavy' : '');
  for (const [k, v] of Object.entries({ bg: th.bg, surface: th.surface, ink: th.ink, muted: th.muted, accent: th.accent, line: th.line, r: th.radius })) sc.style.setProperty('--a-' + k, v);
  phone.replaceChildren(sc);
  let lang = L, cart = {}, cur = null, qty = 1, app;
  const price = k => { for (const c of demo.cats) for (const [kk, p] of c.items) if (kk === k) return p; return 0 };
  const D = k => C.dishes[k];
  function render() {
    const N = demo[lang], tt = k => T(k, lang), f = D(demo.feat), keep = app ? app.scrollTop : 0;
    sc.dir = lang === 'ar' ? 'rtl' : 'ltr'; sc.lang = lang;
    sc.style.setProperty('--a-display', lang === 'ar' ? th.displayAr : th.display);
    sc.style.setProperty('--a-sans', lang === 'ar' ? "'Readex Pro',sans-serif" : "'Hanken Grotesk','Readex Pro',sans-serif");
    sc.innerHTML = `<div class="app" tabindex="0" aria-label="${esc(N.name)}">
      <div class="a-head"><div class="a-brand"><b>${esc(N.name)}</b><span>${esc(N.type)}</span></div><button class="a-lang" data-a="lang" aria-label="${lang === 'ar' ? 'English' : 'العربية'}">${lang === 'ar' ? 'EN' : 'ع'}</button></div>
      <button class="a-feat" data-k="${demo.feat}"><img src="${C.img + f.img}.webp" alt="" loading="lazy"><small>${tt('demo.chef')}</small><b>${esc(f[lang][0])}</b><em>${omr(price(demo.feat), lang)}</em></button>
      <div class="a-tabs" role="tablist">${demo.cats.map((c, i) => `<button class="a-tab" role="tab" data-c="${i}" aria-selected="${i === 0}">${esc(c[lang])}</button>`).join('')}</div>
      ${demo.cats.map((c, i) => `<section class="a-sec" data-sec="${i}"><h4>${esc(c[lang])}</h4>${c.items.map(([k, p]) => { const x = D(k); return `<button class="a-item" data-k="${k}"><span class="im"><img src="${C.img + x.img}.webp" alt="" loading="lazy"></span><span class="tx"><span class="nm">${esc(x[lang][0])}</span><span class="ds">${esc(x[lang][1])}</span><span class="pr">${omr(p, lang)}</span></span></button>` }).join('')}</section>`).join('')}
      <div class="a-end"></div></div>
      <div class="a-sheet a-detail" aria-hidden="true" inert></div><div class="a-sheet a-order" aria-hidden="true" inert></div>
      <button class="a-cart" data-a="order"><span><i>0</i>${tt('demo.order')}</span><span class="tot"></span></button>`;
    app = $('.app', sc); app.scrollTop = keep; app.addEventListener('scroll', spy, { passive: true }); updCart();
  }
  function spy() {
    const tabs = $('.a-tabs', sc), h = tabs.offsetHeight + 8; let idx = 0;
    $$('.a-sec', sc).forEach((s, i) => { if (s.offsetTop - h <= app.scrollTop) idx = i });
    $$('.a-tab', sc).forEach((t, i) => { const on = i === idx; if ((t.getAttribute('aria-selected') === 'true') !== on) { t.setAttribute('aria-selected', on); if (on) tabs.scrollTo({ left: t.offsetLeft - tabs.clientWidth / 2 + t.offsetWidth / 2, behavior: RM ? 'auto' : 'smooth' }) } });
  }
  const sheet = (cls, on) => { const s = $(cls, sc); s.classList.toggle('on', on); s.setAttribute('aria-hidden', !on); s.inert = !on; if (on) s.scrollTop = 0 };
  function detail(k) {
    cur = k; qty = 1; const x = D(k), tt = kk => T(kk, lang);
    $('.a-detail', sc).innerHTML = `<div class="hero-im"><img src="${C.img + x.img}.webp" alt="${esc(x[lang][0])}"><button class="a-back" data-a="back">${icon('i-back')}${tt('demo.back')}</button></div>
      <div class="body"><h5>${esc(x[lang][0])}</h5><p>${esc(x[lang][1])}</p><div class="price">${omr(price(k), lang)}</div>
      <div class="a-qty"><button data-a="minus" aria-label="−">−</button><output>1</output><button data-a="plus" aria-label="+">+</button><button class="a-add" data-a="add">${tt('demo.add')}</button></div></div>`;
    sheet('.a-detail', true);
  }
  function order() {
    const tt = k => T(k, lang), keys = Object.keys(cart).filter(k => cart[k] > 0);
    const total = keys.reduce((s, k) => s + cart[k] * price(k), 0);
    $('.a-order', sc).innerHTML = `<div class="body" style="padding-top:15cqw"><button class="a-back" data-a="back" style="position:static;align-self:flex-start;background:var(--a-surface);color:var(--a-ink)">${icon('i-back')}${tt('demo.back')}</button>
      <h5>${tt('demo.order')}</h5>${keys.length ? keys.map(k => `<div class="a-line"><span><b>${cart[k]}×</b> ${esc(D(k)[lang][0])}</span><span>${omr(cart[k] * price(k), lang)}</span></div>`).join('') + `<div class="a-total"><span>${tt('demo.total')}</span><span>${omr(total, lang)}</span></div><button class="a-send" data-a="send">${tt('demo.send')}</button>` : `<p>${tt('demo.empty')}</p>`}
      <p class="a-note">${tt('demo.note')}</p></div>`;
    sheet('.a-order', true);
  }
  function updCart() {
    const n = Object.values(cart).reduce((a, b) => a + b, 0), tot = Object.keys(cart).reduce((s, k) => s + cart[k] * price(k), 0), b = $('.a-cart', sc);
    b.classList.toggle('on', n > 0); $('i', b).textContent = num(n, lang); $('.tot', b).textContent = omr(tot, lang);
  }
  sc.addEventListener('click', e => {
    const a = e.target.closest('[data-a]'), k = e.target.closest('[data-k]'), tab = e.target.closest('.a-tab');
    if (a) {
      const v = a.dataset.a;
      if (v === 'lang') { lang = lang === 'ar' ? 'en' : 'ar'; render() }
      else if (v === 'back') { sheet('.a-detail', false); sheet('.a-order', false) }
      else if (v === 'plus' || v === 'minus') { qty = Math.max(1, Math.min(20, qty + (v === 'plus' ? 1 : -1))); $('.a-detail output', sc).textContent = num(qty, lang) }
      else if (v === 'add') { cart[cur] = (cart[cur] || 0) + qty; updCart(); sheet('.a-detail', false); const b = $('.a-cart', sc); if (!RM) b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 400 }) }
      else if (v === 'order') order();
      else if (v === 'send') { a.textContent = T('demo.note', lang) }
      return;
    }
    if (tab) { const s = $(`.a-sec[data-sec="${tab.dataset.c}"]`, sc); app.scrollTo({ top: s.offsetTop - $('.a-tabs', sc).offsetHeight - 4, behavior: RM ? 'auto' : 'smooth' }); return }
    if (k) detail(k.dataset.k);
  });
  sc.addEventListener('keydown', e => { if (e.key === 'Escape') { sheet('.a-detail', false); sheet('.a-order', false) } });
  render();
  return { setLang(l) { if (l !== lang) { lang = l; render() } } };
}

/* ---------- sections ---------- */
const apps = [];
function renderServices() {
  $('#svcList').innerHTML = C.services.map(s => { const x = s[L]; return `<article class="svc-item rv in"><div class="pic">${s.img === 'qr' ? qrSVG(C.siteUrl, '#8E6C3A') : `<img src="${C.img + s.img}.webp" alt="" loading="lazy">`}</div>
    <div><h3>${esc(x.name)}</h3><ul>${x.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div></article>` }).join('');
}
function buildDemoCards() {
  $$('.phone[data-demo]').forEach(p => apps.push(MenuApp(p, C.demos.find(d => d.id === p.dataset.demo))));
}
function textDemoCards() {
  $$('.demo-card').forEach(c => { const d = C.demos.find(x => x.id === c.dataset.id)[L]; $(':scope > .type', c).textContent = d.type; $(':scope > h3', c).textContent = d.name; $(':scope > p', c).textContent = d.blurb; $(':scope > button > span', c).textContent = T('demo.view') });
}
function renderPlans() {
  $('#plans').innerHTML = C.plans.map(p => { const x = p[L]; return `<article class="plan rv in${p.popular ? ' pop' : ''}">${p.popular ? `<span class="badge">${T('price.popular')}</span>` : ''}
    <h3>${esc(x.name)}</h3><div class="amt"><b>${num(p.price)}</b><span>${T('demo.omr')}</span></div><div class="once">${T('price.once')}</div>
    <ul>${x.items.map(i => `<li>${icon('i-check')}<span>${esc(i)}</span></li>`).join('')}</ul>
    <a class="btn ${p.popular ? 'btn-gold' : 'btn-dark'}" href="#contact" data-plan="${p.id}">${T('price.choose')} ${esc(x.name)}</a></article>` }).join('');
  $('#subs').innerHTML = C.subscriptions.map(s => { const x = s[L]; return `<div class="sub"><b>${esc(x.name)}</b><div class="amt">${num(s.price)} <small>${T('demo.omr')} ${T('sub.month')}</small></div><ul>${x.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>` }).join('');
}
function renderSteps() {
  $('#steps').innerHTML = C.steps[L].map(([h, p], i) => `<li class="step"><span class="dot">${num(i + 1)}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('');
}
function renderWork() {
  $('#workGrid').innerHTML = C.portfolio.map(w => { const [h, p] = w[L];
    const media = w.video ? `<video src="${w.video}" poster="${w.poster}" muted loop playsinline preload="none" aria-hidden="true"></video>` : w.shot ? `<img class="shot" src="${w.shot}" alt="" loading="lazy">` : `<div class="bg" style="background:${w.bg}"></div><img class="dish" src="${C.img + w.dish}.webp" alt="" loading="lazy">`;
    return `<article class="work rv in">${media}<span class="tag">${T(w.kind === 'real' ? 'work.real' : 'work.concept')}</span><h3>${esc(h)}</h3><p>${esc(p)}</p>${w.demo ? `<button class="btn btn-gold" data-open="${w.demo}">${T('work.open')}<svg class="arr" aria-hidden="true"><use href="#i-arrow"/></svg></button>` : ''}</article>` }).join('');
  const v = $('#workGrid video'); if (v && !RM) new IntersectionObserver(e => e[0].isIntersecting ? v.play().catch(() => {}) : v.pause(), { threshold: .3 }).observe(v);
}
function renderPackSelect() {
  const s = $('#f-pack'), keep = s.value;
  s.innerHTML = `<option value="" disabled ${keep ? '' : 'selected'}>${T('f.pick')}</option>` + C.plans.map(p => `<option value="${p.id}">${esc(p[L].name)} · ${num(p.price)} ${T('demo.omr')}</option>`).join('') + `<option value="unsure">${T('f.unsure')}</option>`;
  if (keep) s.value = keep;
}
function setWa() {
  const msg = L === 'ar' ? 'السلام عليكم، شاهدت موقع منيوزا وأرغب في قائمة رقمية لمطعمي.' : 'Hello Menuza, I saw your website and I would like a digital menu for my restaurant.';
  [$('#ftWa')].forEach(a => { a.href = wa(msg); a.target = '_blank'; a.rel = 'noopener' });
}
function applyLang() {
  const h = document.documentElement; h.lang = L; h.dir = L === 'ar' ? 'rtl' : 'ltr';
  $$('[data-t]').forEach(e => { e.innerHTML = T(e.dataset.t) });
  $$('[data-ph]').forEach(e => { e.placeholder = T(e.dataset.ph) });
  $('#lang').lang = L === 'ar' ? 'en' : 'ar';
  document.dispatchEvent(new Event('menuza:lang'));
  document.title = L === 'ar' ? 'منيوزا · قوائم رقمية تفاعلية للمطاعم في عُمان' : 'Menuza · Interactive Digital Menus for Restaurants in Oman';
  renderServices(); textDemoCards(); renderPlans(); renderSteps(); renderWork(); renderPackSelect(); setWa();
  apps.forEach(a => a.setLang(L)); $$('.field').forEach(f => { delete f.dataset.err; $('.err', f) && ($('.err', f).textContent = '') });
  try { localStorage.setItem('menuza-lang', L) } catch (e) {}
}

/* ---------- modal demo ---------- */
const modal = $('#modal'); let lastFocus = null, modalApp = null;
function openDemo(id) {
  lastFocus = document.activeElement; modalApp = MenuApp($('#modalPhone'), C.demos.find(d => d.id === id));
  modal.classList.add('on'); document.body.style.overflow = 'hidden'; setTimeout(() => $('#modalX').focus(), 50);
}
function closeDemo() { modal.classList.remove('on'); document.body.style.overflow = ''; setTimeout(() => { $('#modalPhone').replaceChildren(); modalApp = null }, 400); lastFocus && lastFocus.focus() }
$('#modalX').onclick = closeDemo;
modal.addEventListener('click', e => { if (e.target === modal) closeDemo() });
addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('on')) closeDemo() });
document.addEventListener('click', e => {
  const o = e.target.closest('[data-open]'); if (o) { e.preventDefault(); openDemo(o.dataset.open); return }
  const p = e.target.closest('[data-plan]'); if (p) { $('#f-pack').value = p.dataset.plan }
  const n = e.target.closest('#nav a'); if (n) toggleNav(false);
});

/* ---------- contact form → WhatsApp ---------- */
const form = $('#form');
const clean = v => String(v).replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
function phoneOk(v) { const d = v.replace(/\D/g, '').replace(/^00/, ''); const local = d.startsWith('968') ? d.slice(3) : d; return /^[279]\d{7}$/.test(local) }
form.addEventListener('submit', e => {
  e.preventDefault(); let bad = null;
  for (const el of $$('[required]', form)) {
    const f = el.closest('.field'), v = clean(el.value); let msg = '';
    if (!v) msg = T('f.err.required'); else if (el.type === 'tel' && !phoneOk(v)) msg = T('f.err.phone');
    if (msg) { f.dataset.err = 1; $('.err', f).textContent = msg; bad = bad || el } else { delete f.dataset.err; $('.err', f).textContent = '' }
  }
  if (bad) { bad.focus(); return }
  const g = n => clean(form.elements[n].value), pk = form.elements.package, pkName = pk.options[pk.selectedIndex].text;
  const lines = L === 'ar'
    ? ['السلام عليكم، أرغب في عرض سعر من منيوزا.', `اسم المطعم: ${g('restaurant')}`, `الاسم: ${g('name')}`, `الهاتف: ${g('phone')}`, `الباقة: ${pkName}`, g('notes') && `متطلبات إضافية: ${g('notes')}`]
    : ['Hello Menuza, I would like a quotation.', `Restaurant: ${g('restaurant')}`, `Name: ${g('name')}`, `Phone: ${g('phone')}`, `Package: ${pkName}`, g('notes') && `Additional requirements: ${g('notes')}`];
  $('#formOk').textContent = T('f.ok');
  const w = window.open(wa(lines.filter(Boolean).join('\n')), '_blank', 'noopener'); if (!w) location.href = wa(lines.filter(Boolean).join('\n'));
});
form.addEventListener('input', e => { const f = e.target.closest('.field'); if (f && f.dataset.err) { delete f.dataset.err; $('.err', f).textContent = '' } });

/* ---------- header, nav, reveal ---------- */
const hd = $('#hd'), onScroll = () => hd.classList.toggle('solid', scrollY > 30); addEventListener('scroll', onScroll, { passive: true }); onScroll();
function toggleNav(on) { const n = $('#nav'), b = $('#burger'); on = on ?? !n.classList.contains('open'); n.classList.toggle('open', on); b.setAttribute('aria-expanded', on) }
$('#burger').onclick = () => toggleNav();
$('#lang').onclick = () => { L = L === 'ar' ? 'en' : 'ar'; applyLang() };
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: .12 });
const watch = () => $$('.rv:not(.in)').forEach(el => io.observe(el));
new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.style.setProperty('--prog', 1)), { threshold: .3 }).observe($('#steps'));
$('#yr').textContent = new Date().getFullYear();
buildDemoCards(); applyLang(); watch(); initLive();
/* ---------- live menu on the first screen (designs from ../menus) ---------- */
function initLive() {
  const fr = $('#liveFrame'); let list = [], i = 0, shown = '';
  const load = () => { const d = list[i]; if (!d) return; const src = `../menus/view.html?id=${d.id}&lang=${L}`;
    if (src !== shown) { shown = src; fr.src = src }
    $('#lvName').textContent = d.name[L]; $('#lvCount').textContent = `${d.id} · ${num(i + 1)} ${T('live.of')} ${num(list.length)}`;
    $('#lvWant').href = wa(T('live.msg') + d.id + ' (' + d.name[L] + ')') };
  const go = s => { i = (i + s + list.length) % list.length; load() };
  $('#lvPrev').onclick = () => go(L === 'ar' ? 1 : -1); $('#lvNext').onclick = () => go(L === 'ar' ? -1 : 1);
  document.addEventListener('menuza:lang', load);
  fetch('../menus/designs/index.json').then(r => r.json()).then(all => {
    const pick = ['A-001', 'A-026', 'A-016', 'A-029', 'A-011', 'A-032', 'A-021', 'A-035', 'A-006', 'A-013'];
    const rest = all.filter(d => d.set === 'interactive' && !pick.includes(d.id));
    list = [...pick.map(id => all.find(d => d.id === id)).filter(Boolean), ...rest]; load() }).catch(() => {});
}
})();
