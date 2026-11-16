// Dine Oman: shared UI helpers, header, route guards and validators.
(function () {
  const api = window.DineAPI, cfg = window.DINE_CONFIG, D = window.DINE_DATA, t = window.t;
  const HOME = { customer: "customer.html", owner: "owner.html", admin: "admin.html" };
  const LOGO = '<svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M22 16H50C71 16 84 32 84 50C84 68 71 84 50 84H22Z M38 70V49C38 38 44 30 53 25C62 30 68 38 68 49V70Z"/><circle cx="53" cy="58" r="5.5" fill="#E2A238"/></svg>';
  const HEART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.6-9.4C1 7.6 3.2 4 6.8 4c2.2 0 3.7 1.3 5.2 3.2C13.5 5.3 15 4 17.2 4c3.6 0 5.8 3.6 4.4 7.1-2.1 4.8-9.6 9.4-9.6 9.4z"/></svg>';
  const GOOGLE = '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>';

  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const loc = window.DINE_LANG === "en" ? "en-GB" : "ar-OM";
  const date = d => d ? new Date(d).toLocaleDateString(loc, { day: "numeric", month: "short", year: "numeric", numberingSystem: "latn" }) : "";
  const dateTime = d => d ? new Date(d).toLocaleString(loc, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", numberingSystem: "latn" }) : "";
  const L = v => D.label(v);
  const SEP = t("، ", ", ");

  function toast(msg, bad) {
    const el = document.createElement("div");
    el.className = "toast" + (bad ? " bad" : ""); el.textContent = msg; el.setAttribute("role", "status");
    document.body.appendChild(el); setTimeout(() => el.remove(), 4200);
  }

  // ----- validators -----
  const digits = s => (s || "").replace(/\D/g, "").replace(/^00968|^968/, "");
  const normIg = s => (s || "").trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/[/?].*$/, "");
  const normUrl = s => { s = (s || "").trim(); return s && !/^https?:\/\//i.test(s) ? "https://" + s : s; };
  const V = {
    email: v => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test((v || "").trim()),
    phone: v => /^[2-9]\d{7}$/.test(digits(v)),
    mobile: v => /^[79]\d{7}$/.test(digits(v)),
    name: v => (v || "").trim().length >= 3,
    password: v => (v || "").length >= 8 && /[a-z]/i.test(v) && /\d/.test(v),
    url: v => { try { const u = new URL(/^https?:\/\//i.test(v) ? v : "https://" + v); return /\.[a-z]{2,}$/i.test(u.hostname); } catch (e) { return false; } },
    instagram: v => /^[a-z0-9._]{1,30}$/i.test(normIg(v)),
    maps: v => {
      v = (v || "").trim();
      const c = /^\s*(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/.exec(v);
      if (c) return +c[1] >= 16 && +c[1] <= 27 && +c[2] >= 51 && +c[2] <= 60.5;
      return V.url(v) && /(google\.[a-z.]+\/maps|maps\.google|goo\.gl\/maps|maps\.app\.goo\.gl|g\.co\/kgs|waze\.com|maps\.apple\.com)/i.test(v);
    }
  };
  const omani = v => "+968" + digits(v);
  const fmtPhone = p => (p || "").replace(/^\+968(\d{4})(\d{4})$/, "+968 $1 $2");
  function strength(pw) {
    let s = 0;
    if (pw.length >= 8) s++; if (pw.length >= 12) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++; if (/\d/.test(pw)) s++; if (/[^a-z0-9]/i.test(pw)) s++;
    return Math.min(4, s);
  }
  function mark(field, ok, msg) {
    if (!field) return ok;
    field.classList.toggle("invalid", !ok);
    if (msg) { const e = $(".err", field); if (e) e.textContent = msg; }
    $$(".input", field).forEach(c => c.setAttribute("aria-invalid", ok ? "false" : "true"));
    return ok;
  }
  function firstInvalid(root) {
    const f = $(".field.invalid", root);
    if (f) { f.scrollIntoView({ behavior: "smooth", block: "center" }); const c = $("input,select,textarea", f); if (c) setTimeout(() => c.focus({ preventScroll: true }), 300); }
    return f;
  }
  function busy(btn, on, label) {
    if (on) { btn.dataset.label = btn.innerHTML; btn.disabled = true; btn.innerHTML = `<span class="spin"></span> ${label || t("لحظة…", "Please wait…")}`; }
    else { btn.disabled = false; btn.innerHTML = btn.dataset.label || btn.innerHTML; }
  }
  function bindPassword(input, meter) {
    const wrap = input.closest(".pw");
    if (wrap && !$(".eye", wrap)) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "eye"; b.textContent = t("إظهار", "Show");
      b.onclick = () => { const show = input.type === "password"; input.type = show ? "text" : "password"; b.textContent = show ? t("إخفاء", "Hide") : t("إظهار", "Show"); };
      wrap.appendChild(b);
    }
    if (meter) input.addEventListener("input", () => { meter.dataset.s = input.value ? strength(input.value) : 0; });
  }
  function bindImage(drop, { max = 5, types = ["image/png", "image/jpeg", "image/webp"], onChange } = {}) {
    const input = $("input[type=file]", drop); let file = null;
    const field = drop.closest(".field");
    function show(url) {
      let img = $("img.preview", drop);
      if (!img) { img = document.createElement("img"); img.className = "preview"; img.alt = ""; drop.appendChild(img); const r = document.createElement("span"); r.className = "replace"; r.textContent = t("تغيير", "Replace"); drop.appendChild(r); }
      img.src = url;
    }
    function take(f) {
      if (!f) return;
      if (!types.includes(f.type)) return mark(field, false, t("نوع الملف غير مدعوم. استخدم JPG أو PNG أو WebP.", "That file type isn't supported. Use JPG, PNG or WebP."));
      if (f.size > max * 1048576) return mark(field, false, t(`حجم الملف أكبر من ${max} ميجابايت.`, `That file is over ${max} MB.`));
      file = f; mark(field, true); show(URL.createObjectURL(f)); onChange && onChange(f);
    }
    input.addEventListener("change", () => take(input.files[0]));
    ["dragenter", "dragover"].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.add("over"); }));
    ["dragleave", "drop"].forEach(e => drop.addEventListener(e, () => drop.classList.remove("over")));
    drop.addEventListener("drop", ev => { ev.preventDefault(); take(ev.dataTransfer.files[0]); });
    return { get: () => file, set: show, previewUrl: () => ($("img.preview", drop) || {}).src };
  }
  function bindPhotos(box, { limit = 8, existing = [], onChange } = {}) {
    let kept = [...existing], added = [];
    function thumb(src, rm) {
      const g = document.createElement("div"); g.className = "thumb";
      g.innerHTML = `<img alt=""><button type="button" aria-label="${t("حذف الصورة", "Remove photo")}">×</button>`;
      $("img", g).src = src; $("button", g).onclick = rm; return g;
    }
    function draw() {
      box.innerHTML = "";
      kept.forEach((src, i) => box.appendChild(thumb(src, () => { kept.splice(i, 1); draw(); })));
      added.forEach((f, i) => box.appendChild(thumb(URL.createObjectURL(f), () => { added.splice(i, 1); draw(); })));
      if (kept.length + added.length < limit) {
        const d = document.createElement("label"); d.className = "drop thumb-add";
        d.innerHTML = `<input type="file" accept="image/png,image/jpeg,image/webp" multiple aria-label="${t("إضافة صور", "Add photos")}"><span class="ph"><b>+ ${t("إضافة", "Add")}</b>${kept.length + added.length} / ${limit}</span>`;
        $("input", d).onchange = e => {
          const ok = [...e.target.files].filter(f => /^image\/(png|jpeg|webp)$/.test(f.type) && f.size <= 5 * 1048576);
          if (ok.length < e.target.files.length) toast(t("تم تخطي بعض الصور: استخدم JPG أو PNG أو WebP حتى 5 ميجابايت.", "Some photos were skipped: use JPG, PNG or WebP up to 5 MB."), true);
          added = added.concat(ok).slice(0, limit - kept.length); draw();
        };
        box.appendChild(d);
      }
      onChange && onChange();
    }
    draw();
    return { files: () => added, kept: () => kept, count: () => kept.length + added.length, setLimit(n) { limit = n; draw(); } };
  }

  // ----- header: logo, language switch, one link -----
  async function chrome(opts = {}) {
    const me = opts.me !== undefined ? opts.me : await api.me().catch(() => null);
    if (api.mode === "demo" && !$(".demo")) {
      const bar = document.createElement("div"); bar.className = "demo";
      const n = api.unread();
      bar.innerHTML = t(`نسخة تجريبية: البيانات محفوظة في هذا المتصفح فقط. الرسائل تصل إلى <a href="demo-inbox.html">صندوق العرض${n ? ` (${n})` : ""}</a>.`,
        `Demo: data stays in this browser. Emails go to the <a href="demo-inbox.html">demo inbox${n ? ` (${n})` : ""}</a>.`);
      document.body.prepend(bar);
    }
    const head = $("header.top");
    if (head) {
      const lang = `<button type="button" class="lang" id="langBtn">${t("English", "العربية")}</button>`;
      const link = opts.nav === false ? "" : me
        ? `<a href="${HOME[me.role]}">${me.role === "admin" ? t("لوحة الإدارة", "Admin") : me.role === "owner" ? t("مطاعمي", "My restaurants") : t("حسابي", "My account")}</a>`
        : `<a href="login.html">${t("تسجيل الدخول", "Log in")}</a>`;
      head.innerHTML = `<div class="wrap"><a class="logo" href="restaurants.html">${LOGO}<span>${t("داين عُمان", "Dine Oman")}</span></a><nav>${lang}${link}</nav></div>`;
      $("#langBtn").onclick = () => window.setLang(window.DINE_LANG === "en" ? "ar" : "en");
    }
    return me;
  }
  async function logout(everywhere) { await api.signOut(!!everywhere); location.href = "login.html" + (everywhere ? "?signedout=1" : ""); }

  // Route guard. Client-side redirects are for experience only; the database enforces access.
  async function requireRole(roles) {
    const me = await api.me().catch(() => null);
    const here = location.pathname.split("/").pop() + location.hash;
    if (!me) { location.replace("login.html?next=" + encodeURIComponent(here)); return new Promise(() => {}); }
    if (!roles.includes(me.role)) { location.replace(HOME[me.role] + "?denied=1"); return new Promise(() => {}); }
    return me;
  }
  function homeFor(me, next) {
    const allowed = { customer: ["customer.html", "restaurants.html", "restaurant.html"], owner: ["owner.html", "restaurants.html", "restaurant.html"], admin: ["admin.html", "restaurants.html", "restaurant.html"] }[me.role];
    if (next && allowed.includes(next.split(/[?#]/)[0])) return next;
    return HOME[me.role];
  }

  const plan = id => { const p = cfg.PLANS.find(x => x.id === id) || { name: id, ar: id, price: "", price_ar: "", line: "", line_ar: "" }; return { ...p, label: t(p.ar, p.name), priceLabel: t(p.price_ar, p.price), lineLabel: t(p.line_ar, p.line) }; };
  const publicUrl = slug => `${(cfg.PUBLIC_BASE_URL || "").replace(/\/$/, "")}/restaurant/${slug}`;
  const profileHref = slug => api.mode === "demo" ? `restaurant.html?slug=${encodeURIComponent(slug)}` : publicUrl(slug);
  const STATUS = {
    awaiting_verification: [t("بانتظار تأكيد البريد", "Awaiting email verification"), "pending"],
    pending: [t("قيد المراجعة", "Pending approval"), "pending"],
    approved: [t("مقبول", "Approved"), "approved"],
    rejected: [t("مرفوض", "Not approved"), "rejected"]
  };
  const statusBadge = r => { const live = r.status === "approved" && r.published; const [label, c] = live ? [t("منشور", "Live"), "live"] : STATUS[r.status]; return `<span class="status ${c}">${label}</span>`; };
  const stars = n => "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
  const rname = r => (window.DINE_LANG === "ar" && r.name_ar) ? r.name_ar : r.name;
  function rcard(r, extra = "") {
    return `<a class="card" href="${esc(profileHref(r.slug))}">
      <div class="ph">${r.cover_url ? `<img src="${esc(r.cover_url)}" alt="" loading="lazy">` : ""}</div>
      ${r.plan === "featured" ? `<span class="feat">${t("مميّز", "Featured")}</span>` : ""}
      <div><b>${esc(rname(r))}</b><span class="m">${esc(L(r.cuisine))} · ${esc(r.area)}${SEP}${esc(L(r.city))}</span>${extra ? `<span class="m" style="display:block">${extra}</span>` : ""}</div></a>`;
  }
  // Dashboard sections driven by location.hash.
  function tabs(nav, main, views, fallback) {
    async function show() {
      const id = location.hash.slice(1).split("-")[0] || fallback;
      const key = views[id] ? id : fallback;
      $$("a[data-tab]", nav).forEach(a => a.setAttribute("aria-current", a.dataset.tab === key ? "page" : "false"));
      main.innerHTML = `<p class="muted">${t("جارٍ التحميل…", "Loading…")}</p>`;
      try { await views[key](main, location.hash.slice(1)); } catch (e) { main.innerHTML = `<div class="notice bad">${esc(e.message)}</div>`; }
      window.scrollTo({ top: 0 });
    }
    addEventListener("hashchange", show); show();
    return show;
  }
  const initials = n => (n || "?").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
  // Two-tap confirmation for destructive links.
  function confirmTap(el, label, fn) {
    el.onclick = async e => {
      e.preventDefault();
      if (el.dataset.sure !== "1") { el.dataset.sure = "1"; el.dataset.orig = el.textContent; el.textContent = label; setTimeout(() => { el.dataset.sure = ""; el.textContent = el.dataset.orig; }, 4000); return; }
      el.disabled = true; try { await fn(); } catch (err) { toast(err.message, true); el.disabled = false; }
    };
  }

  window.DineUI = { $, $$, esc, date, dateTime, toast, V, omani, digits, fmtPhone, normIg, normUrl, mark, firstInvalid, busy, bindPassword, bindImage, bindPhotos,
    chrome, logout, requireRole, homeFor, HOME, LOGO, HEART, GOOGLE, plan, publicUrl, profileHref, statusBadge, STATUS, stars, rcard, rname, tabs, initials, confirmTap, L, SEP };
})();
