// Dine Oman: owner account (application status + profile completion after approval).
(function () {
  const cfg = window.DINE_CONFIG, data = window.DINE_DATA, api = window.DineAPI;
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = d => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
  const pkgName = id => (cfg.PACKAGES.find(p => p.id === id) || { name: id }).name;

  if (api.mode === "demo") $("demoBar").hidden = false;

  const qEmail = new URLSearchParams(location.search).get("email");
  if (qEmail) $("siEmail").value = qEmail;

  async function start() {
    const session = await api.getSession();
    $("loading").hidden = true;
    if (!session) { $("signinView").hidden = false; $("homeView").hidden = true; $("signOutBtn").hidden = true; return; }
    $("signinView").hidden = true; $("homeView").hidden = false; $("signOutBtn").hidden = false;
    $("whoami").textContent = "Signed in as " + session.email;
    await renderApps();
  }

  $("signinForm").addEventListener("submit", async e => {
    e.preventDefault();
    const email = $("siEmail").value.trim().toLowerCase();
    const ok = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email);
    $("siField").classList.toggle("invalid", !ok);
    if (!ok) return;
    const btn = $("siBtn"); btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Sending…';
    try {
      const r = await api.signIn(email, "account.html");
      if (r.sent) {
        $("siSent").hidden = false;
        $("siSent").textContent = `Check ${email}. We've sent you a sign-in link. Open it on this device to continue.`;
        btn.textContent = "Send again";
      } else { await start(); }
    } catch (err) {
      $("siSent").hidden = false; $("siSent").className = "note bad";
      $("siSent").textContent = "We couldn't send the link: " + err.message;
      btn.textContent = "Send sign-in link";
    }
    btn.disabled = false;
  });
  $("signOutBtn").addEventListener("click", async e => { e.preventDefault(); await api.signOut(); location.href = "account.html"; });

  async function renderApps() {
    const box = $("apps");
    box.innerHTML = "";
    let apps;
    try { apps = await api.getMyApplications(); }
    catch (err) { box.innerHTML = `<p class="note bad">We couldn't load your applications: ${esc(err.message)}</p>`; return; }
    if (!apps.length) {
      box.innerHTML = `<div class="panel" style="padding:28px;display:grid;gap:12px"><b>No applications for this email yet.</b><p class="muted">If you applied with a different email, sign out and use that one. Otherwise, <a href="register.html#apply">start an application</a>.</p></div>`;
      return;
    }
    apps.forEach(a => box.appendChild(renderApp(a)));
  }

  function renderApp(a) {
    const node = $("appTpl").content.firstElementChild.cloneNode(true);
    node.querySelector(".logo").src = a.logo_url;
    node.querySelector("h2").textContent = a.restaurant_name;
    node.querySelector(".meta").textContent = `${a.reference} · ${a.area}, ${a.governorate} · ${a.cuisine} · ${pkgName(a.package)} package`;
    const badge = node.querySelector(".badge");
    const live = a.status === "approved" && a.profile && a.profile.published;
    badge.className = "badge " + (live ? "live" : a.status);
    badge.textContent = live ? "Live on Dine Oman" : { pending: "Under review", approved: "Approved", rejected: "Not approved" }[a.status];

    const steps = node.querySelectorAll(".track li");
    node.querySelector(".t-sub").textContent = fmt(a.created_at);
    const msg = node.querySelector(".msg");
    if (a.status === "pending") {
      steps[1].classList.add("now");
      msg.innerHTML = `<p class="note wait">Your application is with our review team. We'll email <b>${esc(a.email)}</b> as soon as it's reviewed.</p>`;
    } else if (a.status === "approved") {
      steps[1].classList.add("on"); steps[2].classList.add("on");
      node.querySelector(".t-dec").textContent = "Approved " + fmt(a.reviewed_at);
      if (live) { steps[3].classList.add("on"); node.querySelector(".t-live").textContent = "Published " + fmt(a.profile.updated_at); }
      else steps[3].classList.add("now");
      msg.innerHTML = `<p class="note ok">${live ? "Your restaurant is live. Keep your hours and photos up to date below." : "Congratulations, you're approved. Complete your profile below to go live."}${a.admin_note ? `<br><b>Note from our team:</b> ${esc(a.admin_note)}` : ""}</p>`;
    } else {
      steps[1].classList.add("on"); steps[2].classList.add("stop");
      node.querySelector(".t-dec").textContent = "Not approved " + fmt(a.reviewed_at);
      msg.innerHTML = `<p class="note bad">We couldn't approve this application.${a.admin_note ? `<br><b>Reason:</b> ${esc(a.admin_note)}` : ""}<br>You can fix the details and <a href="register.html#apply">apply again</a>, or WhatsApp us on ${esc(cfg.SUPPORT_WHATSAPP)}.</p>`;
    }

    const kv = node.querySelector(".kv");
    [["Owner", a.owner_name], ["Phone", a.phone], ["WhatsApp", a.whatsapp], ["Instagram", "@" + a.instagram], ["Website", a.website], ["Location", a.location]]
      .forEach(([k, v]) => { kv.insertAdjacentHTML("beforeend", `<dt>${k}</dt><dd>${esc(v)}</dd>`); });

    if (a.status === "approved") node.querySelector(".profile-slot").appendChild(renderProfile(a));
    return node;
  }

  function renderProfile(a) {
    const p = a.profile || {};
    const form = $("profileTpl").content.firstElementChild.cloneNode(true);
    const el = n => form.querySelector(`[name="${n}"]`);
    if (a.profile) form.querySelector("h3").textContent = "Your restaurant profile";

    el("name_ar").value = p.name_ar || "";
    el("description_ar").value = p.description_ar || "";
    el("booking_phone").value = (p.booking_phone || a.phone || "").replace(/^\+968/, "");
    el("menu_url").value = p.menu_url && /^https?:/.test(p.menu_url) ? p.menu_url : "";
    data.priceRanges.forEach(r => el("price_range").add(new Option(r, r)));
    el("price_range").value = p.price_range || "";

    // Hours
    const hours = form.querySelector(".hours");
    const hv = p.hours || {};
    data.days.forEach(d => {
      const h = hv[d] || { open: "12:00", close: "23:00", closed: false };
      hours.insertAdjacentHTML("beforeend", `<div class="day" data-day="${d}"><b>${d}</b>
        <input class="control" type="time" aria-label="${d} opens" value="${h.open || ""}" ${h.closed ? "disabled" : ""}>
        <input class="control" type="time" aria-label="${d} closes" value="${h.close || ""}" ${h.closed ? "disabled" : ""}>
        <label class="check small"><input type="checkbox" ${h.closed ? "checked" : ""}> Closed</label></div>`);
    });
    hours.addEventListener("change", e => {
      if (e.target.type === "checkbox") e.target.closest(".day").querySelectorAll("input[type=time]").forEach(t => t.disabled = e.target.checked);
    });

    // Features
    const chips = form.querySelector(".chips");
    data.features.forEach(f => chips.insertAdjacentHTML("beforeend", `<label><input type="checkbox" value="${f}" ${(p.features || []).includes(f) ? "checked" : ""}><span>${f}</span></label>`));

    // Dishes
    const dishes = form.querySelector(".dishes");
    for (let i = 0; i < 3; i++) {
      const d = (p.dishes || [])[i] || {};
      dishes.insertAdjacentHTML("beforeend", `<div class="d"><input class="control" placeholder="Dish ${i + 1} name" maxlength="60" value="${esc(d.name || "")}"><div class="affix"><span>OMR</span><input class="control" inputmode="decimal" placeholder="0.000" value="${esc(d.price || "")}"></div></div>`);
    }

    // Gallery
    const gallery = form.querySelector(".gallery");
    let existing = [...(p.gallery || [])];
    let added = [];
    function drawGallery() {
      gallery.innerHTML = "";
      existing.forEach((src, i) => { const g = document.createElement("div"); g.className = "g"; g.innerHTML = `<img src="${esc(src)}" alt=""><button type="button" aria-label="Remove photo">×</button>`; g.querySelector("button").onclick = () => { existing.splice(i, 1); drawGallery(); }; gallery.appendChild(g); });
      added.forEach((f, i) => { const g = document.createElement("div"); g.className = "g"; g.innerHTML = `<img alt=""><button type="button" aria-label="Remove photo">×</button>`; g.querySelector("img").src = URL.createObjectURL(f); g.querySelector("button").onclick = () => { added.splice(i, 1); drawGallery(); }; gallery.appendChild(g); });
      if (existing.length + added.length < 12) {
        const d = document.createElement("label"); d.className = "drop";
        d.innerHTML = `<input type="file" accept="image/png,image/jpeg,image/webp" multiple aria-label="Add photos"><span class="ph"><b>+ Add</b>photos</span>`;
        d.querySelector("input").onchange = e => {
          const room = 12 - existing.length - added.length;
          const ok = [...e.target.files].filter(f => /^image\/(png|jpeg|webp)$/.test(f.type) && f.size <= 5 * 1048576);
          if (ok.length < e.target.files.length) toast("Some photos were skipped: use JPG, PNG or WebP up to 5 MB.", true);
          added = added.concat(ok.slice(0, room)); drawGallery();
        };
        gallery.appendChild(d);
      }
    }
    drawGallery();

    if (p.updated_at) form.querySelector(".saved-at").textContent = "Last published " + new Date(p.updated_at).toLocaleString("en-GB");

    form.addEventListener("submit", async e => {
      e.preventDefault();
      const errBox = form.querySelector(".form-err"); errBox.hidden = true;
      const hoursOut = {};
      let anyOpen = false;
      form.querySelectorAll(".day").forEach(r => {
        const [o, c] = r.querySelectorAll("input[type=time]");
        const closed = r.querySelector("input[type=checkbox]").checked;
        hoursOut[r.dataset.day] = { open: o.value, close: c.value, closed };
        if (!closed && o.value && c.value) anyOpen = true;
      });
      const menuFile = el("menu_file").files[0];
      const fields = [...form.querySelectorAll(".field")];
      const hoursField = fields.find(f => f.contains(hours));
      const priceField = fields.find(f => f.contains(el("price_range")));
      const menuField = fields.find(f => f.contains(el("menu_url")));
      const menuUrl = el("menu_url").value.trim();
      const hasMenu = !!menuFile || /^https?:\/\/\S+\.\S+/.test(menuUrl) || !!(p.menu_url && !menuUrl && a.profile);
      hoursField.classList.toggle("invalid", !anyOpen);
      priceField.classList.toggle("invalid", !el("price_range").value);
      menuField.classList.toggle("invalid", !hasMenu);
      if (menuFile && menuFile.size > 10 * 1048576) { menuField.classList.add("invalid"); menuField.querySelector(".err").textContent = "That menu file is over 10 MB."; }
      if (form.querySelector(".field.invalid")) { form.querySelector(".field.invalid").scrollIntoView({ behavior: "smooth", block: "center" }); return; }

      const profile = {
        name_ar: el("name_ar").value.trim() || null,
        description_ar: el("description_ar").value.trim() || null,
        booking_phone: el("booking_phone").value.replace(/\D/g, "") ? "+968" + el("booking_phone").value.replace(/\D/g, "") : null,
        hours: hoursOut,
        price_range: el("price_range").value,
        features: [...chips.querySelectorAll("input:checked")].map(i => i.value),
        dishes: [...dishes.querySelectorAll(".d")].map(d => { const [n, pr] = d.querySelectorAll("input"); return { name: n.value.trim(), price: pr.value.trim() }; }).filter(d => d.name),
        menu_url: menuUrl || p.menu_url || null,
        gallery: existing
      };
      const btn = form.querySelector("button[type=submit]");
      btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Publishing…';
      try {
        await api.saveProfile(a.id, profile, { gallery: added, menu: menuFile });
        toast("Profile published. Your restaurant is live.");
        await renderApps();
      } catch (err) {
        errBox.textContent = "We couldn't save your profile: " + err.message; errBox.hidden = false;
        btn.disabled = false; btn.textContent = "Save and publish profile";
      }
    });
    return form;
  }

  function toast(msg, bad) {
    const t = document.createElement("div");
    t.className = "toast" + (bad ? " bad" : ""); t.textContent = msg; t.setAttribute("role", "status");
    document.body.appendChild(t); setTimeout(() => t.remove(), 3800);
  }

  start();
})();
