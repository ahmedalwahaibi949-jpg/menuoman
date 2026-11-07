// Dine Oman: restaurant registration form.
(function () {
  const cfg = window.DINE_CONFIG, data = window.DINE_DATA, api = window.DineAPI;
  const $ = id => document.getElementById(id);
  const form = $("appForm");
  const files = { logo: null, cover: null };
  const LIMITS = { logo: 2 * 1024 * 1024, cover: 5 * 1024 * 1024 };
  const TYPES = { logo: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"], cover: ["image/png", "image/jpeg", "image/webp"] };

  // ----- Demo banner -----
  if (api.mode === "demo") {
    $("demoBar").hidden = false;
    $("clearDemo").addEventListener("click", () => { api.clear(); toast("Demo data cleared."); });
  }

  // ----- Populate selects and packages -----
  data.cuisines.forEach(c => $("cuisine").add(new Option(c, c)));
  data.governorates.forEach(g => $("governorate").add(new Option(`${g.en} · ${g.ar}`, g.en)));
  function fillAreas() {
    const g = data.governorates.find(x => x.en === $("governorate").value);
    $("areaList").innerHTML = "";
    (g ? g.areas : data.governorates.flatMap(x => x.areas)).forEach(a => $("areaList").appendChild(new Option(a)));
  }
  fillAreas();
  $("governorate").addEventListener("change", fillAreas);

  const pkgList = $("pkgList");
  cfg.PACKAGES.forEach((p, i) => {
    const card = document.createElement("label");
    card.className = "pkg-card";
    card.innerHTML = `
      ${p.popular ? '<span class="pop">Most popular</span>' : ""}
      <input type="radio" name="package" value="${p.id}" ${i === 0 ? "checked" : ""}>
      <div class="top"><span class="name">${p.name}<span class="ar-d">${p.ar}</span></span><span class="radio"></span></div>
      <div class="price">${p.price} <small>${p.period}</small></div>
      <p class="small muted">${p.blurb}</p>
      <ul>${p.features.map(f => `<li>${f}</li>`).join("")}</ul>`;
    pkgList.appendChild(card);
  });
  // Pre-select a package from ?package=featured
  const qp = new URLSearchParams(location.search).get("package");
  if (qp) { const r = form.querySelector(`input[name=package][value="${CSS.escape(qp)}"]`); if (r) r.checked = true; }

  // ----- Normalisers & validators -----
  const digits = s => (s || "").replace(/\D/g, "").replace(/^968/, "").replace(/^00968/, "");
  const normIg = s => (s || "").trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/[/?].*$/, "");
  function normUrl(s) {
    s = (s || "").trim();
    if (!s) return "";
    if (!/^https?:\/\//i.test(s)) s = "https://" + s;
    return s;
  }
  function validUrl(s) {
    try { const u = new URL(s); return /^https?:$/.test(u.protocol) && /\.[a-z]{2,}$/i.test(u.hostname); } catch (e) { return false; }
  }
  function validLocation(s) {
    s = (s || "").trim();
    const coords = /^\s*(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/.exec(s);
    if (coords) { const lat = +coords[1], lng = +coords[2]; return lat >= 16 && lat <= 27 && lng >= 51 && lng <= 60.5; }
    return validUrl(normUrl(s)) && /(google\.[a-z.]+\/maps|maps\.google|goo\.gl\/maps|maps\.app\.goo\.gl|g\.co\/kgs|waze\.com|maps\.apple\.com)/i.test(s);
  }

  const rules = {
    restaurant_name: v => v.trim().length >= 2,
    cuisine: v => !!v,
    description: v => v.trim().length >= 40,
    owner_name: v => v.trim().length >= 3,
    email: v => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()),
    phone: v => /^[2-9]\d{7}$/.test(digits(v)),
    whatsapp: v => /^[79]\d{7}$/.test(digits(v)),
    governorate: v => !!v,
    area: v => v.trim().length >= 2,
    location: v => validLocation(v),
    instagram: v => /^[a-z0-9._]{1,30}$/i.test(normIg(v)),
    website: v => validUrl(normUrl(v))
  };

  function setInvalid(name, bad, msg) {
    const f = form.querySelector(`[data-f="${name}"]`);
    if (!f) return;
    f.classList.toggle("invalid", bad);
    if (msg) { const e = f.querySelector(".err"); if (e) e.textContent = msg; }
    const ctl = f.querySelector(".control");
    if (ctl) ctl.setAttribute("aria-invalid", bad ? "true" : "false");
  }
  function checkField(name) {
    const ok = rules[name]($(name).value);
    setInvalid(name, !ok);
    return ok;
  }
  Object.keys(rules).forEach(name => {
    const el = $(name);
    el.addEventListener("blur", () => { if (el.value) checkField(name); });
    el.addEventListener("input", () => { if (el.closest(".field").classList.contains("invalid")) checkField(name); update(); });
    el.addEventListener("change", update);
  });

  $("phone").addEventListener("input", () => { if ($("sameWa").checked) { $("whatsapp").value = $("phone").value; } });
  $("sameWa").addEventListener("change", e => {
    $("whatsapp").value = e.target.checked ? $("phone").value : "";
    $("whatsapp").readOnly = e.target.checked;
    update();
  });
  $("description").addEventListener("input", () => { $("descCount").textContent = $("description").value.length; });

  // ----- File uploads -----
  function bindFile(kind) {
    const input = $(kind), drop = $(kind + "Drop");
    const label = kind === "logo" ? "logo" : "cover photo";
    function take(file) {
      if (!file) return;
      if (!TYPES[kind].includes(file.type)) { files[kind] = null; setInvalid(kind, true, `That file type isn't supported. Upload a ${kind === "logo" ? "PNG, JPG, WebP or SVG" : "JPG, PNG or WebP"} image.`); return; }
      if (file.size > LIMITS[kind]) { files[kind] = null; setInvalid(kind, true, `That ${label} is ${(file.size / 1048576).toFixed(1)} MB. The limit is ${LIMITS[kind] / 1048576} MB.`); return; }
      files[kind] = file;
      setInvalid(kind, false);
      refreshSummary();
      const url = URL.createObjectURL(file);
      let img = drop.querySelector("img.preview");
      if (!img) { img = document.createElement("img"); img.className = "preview"; img.alt = ""; drop.appendChild(img); const r = document.createElement("span"); r.className = "replace"; r.textContent = "Replace"; drop.appendChild(r); }
      img.src = url;
      if (kind === "cover") {
        const probe = new Image();
        probe.onload = () => { if (probe.width < 1200) toast("Tip: a wider cover photo (1600 px or more) will look sharper."); };
        probe.src = url;
      }
      update();
    }
    input.addEventListener("change", () => take(input.files[0]));
    ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
    ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, () => drop.classList.remove("over")));
    drop.addEventListener("drop", e => { e.preventDefault(); take(e.dataTransfer.files[0]); });
  }
  bindFile("logo"); bindFile("cover");

  // ----- Live preview -----
  const required = [...Object.keys(rules), "logo", "cover"];
  function update() {
    const v = n => $(n).value.trim();
    $("pvName").textContent = v("restaurant_name") || "Restaurant name";
    const g = data.governorates.find(x => x.en === v("governorate"));
    $("pvArea").textContent = [v("area"), g && g.en].filter(Boolean).join(", ") || "Area, governorate";
    $("pvCuisine").textContent = v("cuisine") || "Cuisine";
    $("pvDesc").textContent = v("description") || "Your description appears here.";
    const ig = normIg(v("instagram"));
    $("pvIg").hidden = !ig; $("pvIg").textContent = "@" + ig;
    const web = v("website").replace(/^https?:\/\//, "").replace(/\/$/, "");
    $("pvWeb").hidden = !web; $("pvWeb").textContent = web;
    const pv = $("pvLogo");
    const logoImg = $("logoDrop").querySelector("img.preview");
    if (files.logo && logoImg) pv.innerHTML = `<img src="${logoImg.src}" alt="">`;
    else pv.textContent = (v("restaurant_name")[0] || "?").toUpperCase();
    const coverImg = $("coverDrop").querySelector("img.preview");
    $("pvCover").hidden = !(files.cover && coverImg);
    if (files.cover && coverImg) $("pvCover").src = coverImg.src;
    $("pvCoverPh").hidden = !!files.cover;
    const pkg = cfg.PACKAGES.find(p => p.id === (form.querySelector("input[name=package]:checked") || {}).value);
    $("pvPkg").hidden = !pkg || pkg.id === "basic";
    if (pkg) $("pvPkg").textContent = pkg.name;
    const done = required.filter(n => n === "logo" || n === "cover" ? files[n] : rules[n]($(n).value)).length;
    const pct = Math.round(done / required.length * 100);
    $("bar").style.width = pct + "%";
    $("pct").textContent = pct + "% complete";
  }
  pkgList.addEventListener("change", () => { setInvalid("package", false); update(); refreshSummary(); });
  $("consent").addEventListener("change", e => { if (e.target.checked) setInvalid("consent", false); refreshSummary(); });
  form.addEventListener("input", refreshSummary);
  form.addEventListener("change", refreshSummary);
  // Keeps the "fix N fields" message in step with the fields still marked.
  function refreshSummary() {
    if ($("formError").hidden || busy) return;
    const n = form.querySelectorAll(".field.invalid").length;
    if (!n) $("formError").hidden = true;
    else if (/^Please fix/.test($("formError").textContent)) $("formError").textContent = `Please fix ${n} field${n > 1 ? "s" : ""} marked in red.`;
  }
  update();

  // ----- Submit -----
  let busy = false;
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (busy) return;
    $("formError").hidden = true;
    let firstBad = null;
    Object.keys(rules).forEach(n => { if (!checkField(n) && !firstBad) firstBad = n; });
    ["logo", "cover"].forEach(n => { if (!files[n]) { setInvalid(n, true, n === "logo" ? "Upload your logo (an image up to 2 MB)." : "Upload a cover photo (JPG, PNG or WebP up to 5 MB)."); if (!firstBad) firstBad = n; } });
    const pkg = form.querySelector("input[name=package]:checked");
    setInvalid("package", !pkg); if (!pkg && !firstBad) firstBad = "package";
    const consent = $("consent").checked;
    setInvalid("consent", !consent); if (!consent && !firstBad) firstBad = "consent";
    if (firstBad) {
      const f = form.querySelector(`[data-f="${firstBad}"]`);
      f.scrollIntoView({ behavior: "smooth", block: "center" });
      const ctl = f.querySelector("input,select,textarea"); if (ctl) setTimeout(() => ctl.focus({ preventScroll: true }), 350);
      const count = form.querySelectorAll(".field.invalid").length;
      $("formError").textContent = `Please fix ${count} field${count > 1 ? "s" : ""} marked in red.`;
      $("formError").hidden = false;
      return;
    }

    const fields = {
      restaurant_name: $("restaurant_name").value.trim(),
      owner_name: $("owner_name").value.trim(),
      email: $("email").value.trim().toLowerCase(),
      phone: "+968" + digits($("phone").value),
      whatsapp: "+968" + digits($("whatsapp").value),
      governorate: $("governorate").value,
      area: $("area").value.trim(),
      location: $("location").value.trim(),
      cuisine: $("cuisine").value,
      description: $("description").value.trim(),
      instagram: normIg($("instagram").value),
      website: normUrl($("website").value),
      package: pkg.value
    };

    busy = true;
    const btn = $("submitBtn");
    btn.disabled = true;
    btn.innerHTML = '<span class="spin"></span> Uploading photos and submitting…';
    try {
      const res = await api.submitApplication(fields, files);
      showDone(fields, res);
    } catch (err) {
      $("formError").textContent = "We couldn't submit your application: " + (err.message || "please try again.") + " Your details are still here, so you can try again.";
      $("formError").hidden = false;
      btn.disabled = false;
      btn.textContent = "Submit application";
    } finally { busy = false; }
  });

  function showDone(fields, res) {
    $("formView").hidden = true;
    const v = $("doneView"); v.hidden = false;
    $("doneName").textContent = fields.restaurant_name;
    $("doneRef").textContent = res.reference;
    $("donePkg").textContent = cfg.PACKAGES.find(p => p.id === fields.package).name;
    $("doneEmail").textContent = fields.email;
    $("supportWa").textContent = cfg.SUPPORT_WHATSAPP;
    $("doneMsg").textContent = api.mode === "demo"
      ? "Demo mode: the application is saved in this browser. In live mode a confirmation email is sent and the review team is notified. Open the admin page to approve it."
      : "We've emailed you a confirmation and notified our review team. You'll get another email as soon as your application is reviewed.";
    $("trackBtn").href = "account.html?email=" + encodeURIComponent(fields.email);
    document.getElementById("apply").scrollIntoView({ behavior: "smooth" });
    v.focus({ preventScroll: true });
  }

  function toast(msg, bad) {
    const t = document.createElement("div");
    t.className = "toast" + (bad ? " bad" : ""); t.textContent = msg; t.setAttribute("role", "status");
    document.body.appendChild(t); setTimeout(() => t.remove(), 3800);
  }
})();
