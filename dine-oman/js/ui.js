// Dine Oman: shared UI helpers, header, route guards and validators.
(function () {
  const api = window.DineAPI, cfg = window.DINE_CONFIG;
  const HOME = { customer: "customer.html", owner: "owner.html", admin: "admin.html" };
  const LOGO = '<svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M22 16H50C71 16 84 32 84 50C84 68 71 84 50 84H22Z M38 70V49C38 38 44 30 53 25C62 30 68 38 68 49V70Z"/><circle cx="53" cy="58" r="5.5" fill="#E2A238"/></svg>';

  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => [...(el || document).querySelectorAll(s)];
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const date = d => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
  const dateTime = d => d ? new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

  function toast(msg, bad) {
    const t = document.createElement("div");
    t.className = "toast" + (bad ? " bad" : ""); t.textContent = msg; t.setAttribute("role", "status");
    document.body.appendChild(t); setTimeout(() => t.remove(), 4200);
  }

  // ----- validators -----
  const digits = s => (s || "").replace(/\D/g, "").replace(/^00968|^968/, "");
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
  const normIg = s => (s || "").trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/[/?].*$/, "");
  const normUrl = s => { s = (s || "").trim(); return s && !/^https?:\/\//i.test(s) ? "https://" + s : s; };
  function strength(pw) {
    let s = 0;
    if (pw.length >= 8) s++; if (pw.length >= 12) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++; if (/\d/.test(pw)) s++; if (/[^a-z0-9]/i.test(pw)) s++;
    return Math.min(4, s);
  }

  // Marks a .field as invalid / valid. Returns ok.
  function mark(field, ok, msg) {
    if (!field) return ok;
    field.classList.toggle("invalid", !ok);
    if (msg) { const e = $(".err", field); if (e) e.textContent = msg; }
    $$(".control", field).forEach(c => c.setAttribute("aria-invalid", ok ? "false" : "true"));
    return ok;
  }
  function firstInvalid(root) {
    const f = $(".field.invalid", root);
    if (f) { f.scrollIntoView({ behavior: "smooth", block: "center" }); const c = $("input,select,textarea", f); if (c) setTimeout(() => c.focus({ preventScroll: true }), 300); }
    return f;
  }
  function busy(btn, on, label) {
    if (on) { btn.dataset.label = btn.innerHTML; btn.disabled = true; btn.innerHTML = `<span class="spin"></span> ${label || "Please wait…"}`; }
    else { btn.disabled = false; btn.innerHTML = btn.dataset.label || btn.innerHTML; }
  }

  // Password field: show/hide toggle and strength meter.
  function bindPassword(input, meter) {
    const wrap = input.closest(".pw");
    if (wrap && !$(".eye", wrap)) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "eye"; b.textContent = "Show"; b.setAttribute("aria-label", "Show password");
      b.onclick = () => { const show = input.type === "password"; input.type = show ? "text" : "password"; b.textContent = show ? "Hide" : "Show"; b.setAttribute("aria-label", show ? "Hide password" : "Show password"); };
      wrap.appendChild(b);
    }
    if (meter) input.addEventListener("input", () => {
      const s = input.value ? strength(input.value) : 0;
      meter.dataset.s = s;
      $(".lbl", meter).textContent = input.value ? ["Too weak", "Weak", "Fair", "Good", "Strong"][s] : "Use 8+ characters with letters and numbers";
    });
  }

  // Image drop zone: returns { get(): File|null, set(url) }.
  function bindImage(drop, { max = 5, types = ["image/png", "image/jpeg", "image/webp"], onChange } = {}) {
    const input = $("input[type=file]", drop); let file = null;
    const field = drop.closest(".field");
    function show(url) {
      let img = $("img.preview", drop);
      if (!img) { img = document.createElement("img"); img.className = "preview"; img.alt = ""; drop.appendChild(img); const r = document.createElement("span"); r.className = "replace"; r.textContent = "Replace"; drop.appendChild(r); }
      img.src = url;
    }
    function take(f) {
      if (!f) return;
      if (!types.includes(f.type)) return mark(field, false, "That file type isn't supported. Use JPG, PNG or WebP.");
      if (f.size > max * 1048576) return mark(field, false, `That file is ${(f.size / 1048576).toFixed(1)} MB. The limit is ${max} MB.`);
      file = f; mark(field, true); show(URL.createObjectURL(f)); onChange && onChange(f);
    }
    input.addEventListener("change", () => take(input.files[0]));
    ["dragenter", "dragover"].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.add("over"); }));
    ["dragleave", "drop"].forEach(e => drop.addEventListener(e, () => drop.classList.remove("over")));
    drop.addEventListener("drop", ev => { ev.preventDefault(); take(ev.dataTransfer.files[0]); });
    return { get: () => file, set: show, previewUrl: () => ($("img.preview", drop) || {}).src };
  }

  // Multi-photo picker with thumbnails. existing = urls kept; returns { files(), kept(), count() }.
  function bindPhotos(box, { limit = 8, existing = [], onChange } = {}) {
    let kept = [...existing], added = [];
    function draw() {
      box.innerHTML = "";
      kept.forEach((src, i) => box.appendChild(thumb(src, () => { kept.splice(i, 1); draw(); })));
      added.forEach((f, i) => box.appendChild(thumb(URL.createObjectURL(f), () => { added.splice(i, 1); draw(); })));
      if (kept.length + added.length < limit) {
        const d = document.createElement("label"); d.className = "drop thumb-add";
        d.innerHTML = `<input type="file" accept="image/png,image/jpeg,image/webp" multiple aria-label="Add food photos"><span class="ph"><b>+ Add photos</b>${kept.length + added.length} of ${limit}</span>`;
        $("input", d).onchange = e => {
          const ok = [...e.target.files].filter(f => /^image\/(png|jpeg|webp)$/.test(f.type) && f.size <= 5 * 1048576);
          if (ok.length < e.target.files.length) toast("Some photos were skipped: use JPG, PNG or WebP up to 5 MB each.", true);
          added = added.concat(ok).slice(0, limit - kept.length); draw();
        };
        box.appendChild(d);
      }
      onChange && onChange();
    }
    function thumb(src, rm) {
      const g = document.createElement("div"); g.className = "thumb";
      g.innerHTML = `<img alt=""><button type="button" aria-label="Remove photo">×</button>`;
      $("img", g).src = src; $("button", g).onclick = rm; return g;
    }
    draw();
    return { files: () => added, kept: () => kept, count: () => kept.length + added.length, setLimit(n) { limit = n; draw(); } };
  }

  // ----- header & chrome -----
  async function chrome(opts = {}) {
    const me = opts.me !== undefined ? opts.me : await api.me().catch(() => null);
    if (api.mode === "demo" && !$(".demo-bar")) {
      const bar = document.createElement("div"); bar.className = "demo-bar";
      const n = api.unread();
      bar.innerHTML = `Demo mode: accounts and data stay in this browser. Emails go to the <a href="demo-inbox.html">demo inbox${n ? ` (${n} new)` : ""}</a>. <button type="button" id="demoReset">Reset demo</button>`;
      document.body.prepend(bar);
      $("#demoReset", bar).onclick = () => { api.reset(); location.href = "login.html"; };
    }
    const head = $("header.topbar");
    if (head) {
      const links = me
        ? `<a href="restaurants.html">Discover</a><a href="${HOME[me.role]}">${me.role === "admin" ? "Admin" : me.role === "owner" ? "My restaurants" : "My account"}</a><a href="#" class="pill" data-logout>Log out</a>`
        : `<a href="restaurants.html">Discover</a><a href="owner-signup.html">List your restaurant</a><a href="login.html">Log in</a><a class="pill" href="signup.html">Sign up</a>`;
      head.innerHTML = `<div class="container"><a class="brand" href="restaurants.html" aria-label="Dine Oman">${LOGO}<span><b>Dine Oman</b><small>داين عُمان</small></span></a><nav class="topnav" aria-label="Main">${opts.nav === false ? "" : links}</nav></div>`;
      $$("[data-logout]", head).forEach(a => a.addEventListener("click", async e => { e.preventDefault(); await api.signOut(false); location.href = "login.html"; }));
    }
    return me;
  }

  // Route guard. Client-side redirects are for experience only; the database enforces access.
  async function requireRole(roles) {
    const me = await api.me().catch(() => null);
    const here = location.pathname.split("/").pop() + location.hash;
    if (!me) { location.replace("login.html?next=" + encodeURIComponent(here)); return new Promise(() => {}); }
    if (!roles.includes(me.role)) { location.replace(HOME[me.role] + "?denied=1"); return new Promise(() => {}); }
    return me;
  }
  function homeFor(me, next) {
    // Only follow ?next= to a page this role may open.
    const allowed = { customer: ["customer.html", "restaurants.html", "restaurant.html"], owner: ["owner.html", "restaurants.html", "restaurant.html"], admin: ["admin.html", "restaurants.html", "restaurant.html"] }[me.role];
    if (next && allowed.includes(next.split(/[?#]/)[0])) return next;
    return HOME[me.role];
  }

  const plan = id => cfg.PLANS.find(p => p.id === id) || { name: id };
  const publicUrl = slug => `${(cfg.PUBLIC_BASE_URL || "").replace(/\/$/, "")}/restaurant/${slug}`;
  const profileHref = slug => api.mode === "demo" ? `restaurant.html?slug=${encodeURIComponent(slug)}` : publicUrl(slug);
  const STATUS = { awaiting_verification: ["Awaiting email verification", "pending"], pending: ["Pending approval", "pending"], approved: ["Approved", "approved"], rejected: ["Not approved", "rejected"] };
  const statusBadge = r => { const live = r.status === "approved" && r.published; const [t, c] = live ? ["Live", "live"] : STATUS[r.status]; return `<span class="badge ${c}">${t}</span>`; };

  const stars = n => "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);
  function rcard(r, extra = "") {
    return `<a class="rcard" href="${esc(profileHref(r.slug))}">
      <div class="cv">${r.cover_url ? `<img src="${esc(r.cover_url)}" alt="" loading="lazy">` : ""}${r.plan === "featured" ? '<span class="tag">Featured</span>' : ""}</div>
      <div class="bd"><img class="lg" src="${esc(r.logo_url)}" alt=""><div style="min-width:0"><b>${esc(r.name)}</b><small>${esc(r.cuisine)} · ${esc(r.area)}, ${esc(r.city)}</small></div>${extra ? `<div class="meta-line">${extra}</div>` : ""}</div></a>`;
  }
  // Dashboard sections driven by location.hash. views: { id: async (el, hash) => {} }
  function tabs(nav, main, views, fallback) {
    async function show() {
      const id = location.hash.slice(1).split("-")[0] || fallback;
      const key = views[id] ? id : fallback;
      $$("a[data-tab]", nav).forEach(a => a.setAttribute("aria-current", a.dataset.tab === key ? "page" : "false"));
      main.innerHTML = '<p class="muted">Loading…</p>';
      try { await views[key](main, location.hash.slice(1)); } catch (e) { main.innerHTML = `<div class="alert bad">Something went wrong: ${esc(e.message)}</div>`; }
      window.scrollTo({ top: 0 });
    }
    addEventListener("hashchange", show); show();
    return show;
  }
  const initials = n => (n || "?").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();

  window.DineUI = { stars, rcard, tabs, initials, $, $$, esc, date, dateTime, toast, V, omani, digits, normIg, normUrl, mark, firstInvalid, busy, bindPassword, bindImage, bindPhotos, chrome, requireRole, homeFor, HOME, LOGO, plan, publicUrl, profileHref, statusBadge, STATUS };
})();
