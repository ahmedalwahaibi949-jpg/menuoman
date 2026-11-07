// Dine Oman: restaurant fields, shared by owner sign-up, "add a branch" and profile editing.
// mount(container, { sections: ["info","branding","profile","plan"], initial, editing }) → controller
(function () {
  const U = window.DineUI, D = window.DINE_DATA, cfg = window.DINE_CONFIG;
  const PHOTO_LIMIT = { free: 4, standard: 12, premium: 24, featured: 24 };
  const opt = (v, label, sel) => `<option value="${U.esc(v)}" ${sel ? "selected" : ""}>${U.esc(label)}</option>`;

  function mount(root, { sections = ["info", "branding", "plan"], initial = {}, editing = false, planLocked = false } = {}) {
    const r = initial;
    const html = [];
    if (sections.includes("info")) html.push(`
      <section class="rf-sec" data-sec="info">
        <div class="field" data-f="name"><label for="rf-name">Restaurant name <span class="ar">اسم المطعم</span></label><input class="control" id="rf-name" maxlength="80" value="${U.esc(r.name || "")}" placeholder="e.g. Bait Al Luban"><span class="err">Enter the restaurant's name.</span></div>
        <div class="row2">
          <div class="field" data-f="category"><label for="rf-category">Restaurant category <span class="ar">التصنيف</span></label><select class="control" id="rf-category"><option value="">Choose a category</option>${D.categories.map(c => opt(c, c, r.category === c)).join("")}</select><span class="err">Choose a category.</span></div>
          <div class="field" data-f="cuisine"><label for="rf-cuisine">Cuisine type <span class="ar">نوع المطبخ</span></label><select class="control" id="rf-cuisine"><option value="">Choose a cuisine</option>${D.cuisines.map(c => opt(c, c, r.cuisine === c)).join("")}</select><span class="err">Choose a cuisine.</span></div>
        </div>
        <div class="row2">
          <div class="field" data-f="governorate"><label for="rf-governorate">Governorate <span class="ar">المحافظة</span></label><select class="control" id="rf-governorate"><option value="">Choose a governorate</option>${D.governorates.map(g => opt(g.en, `${g.en} · ${g.ar}`, r.governorate === g.en)).join("")}</select><span class="err">Choose a governorate.</span></div>
          <div class="field" data-f="city"><label for="rf-city">City / wilayat <span class="ar">الولاية</span></label><select class="control" id="rf-city"><option value="">Choose a governorate first</option></select><span class="err">Choose a city.</span></div>
        </div>
        <div class="row2">
          <div class="field" data-f="area"><label for="rf-area">Area <span class="ar">المنطقة</span></label><input class="control" id="rf-area" maxlength="80" value="${U.esc(r.area || "")}" placeholder="e.g. Al Khuwair"><span class="err">Enter the neighbourhood or area.</span></div>
          <div class="field" data-f="contact_phone"><label for="rf-phone">Contact number <span class="ar">رقم التواصل</span></label><div class="affix"><span>+968</span><input class="control" id="rf-phone" inputmode="numeric" maxlength="9" value="${U.esc((r.contact_phone || "").replace(/^\+968/, ""))}" placeholder="2412 3456"></div><span class="err">Enter an 8-digit Omani number.</span></div>
        </div>
        <div class="field" data-f="address"><label for="rf-address">Full address <span class="ar">العنوان</span></label><input class="control" id="rf-address" maxlength="200" value="${U.esc(r.address || "")}" placeholder="Building, street or way number, landmark"><span class="err">Enter the full address (at least 5 characters).</span></div>
        <div class="field" data-f="maps_url"><label for="rf-maps">Google Maps location <span class="ar">موقع خرائط جوجل</span></label>
          <div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px"><input class="control" id="rf-maps" inputmode="url" value="${U.esc(r.maps_url || "")}" placeholder="https://maps.app.goo.gl/… or 23.5880, 58.3829"><a class="btn btn-line" style="padding:0 14px;font-size:14px" href="https://www.google.com/maps" target="_blank" rel="noopener">Open Maps ↗</a></div>
          <span class="hint">In Google Maps, find your restaurant, tap Share, then Copy link.</span><span class="err">Paste a Google Maps link or coordinates.</span></div>
        <div class="field" data-f="description"><label for="rf-description">Restaurant description <span class="ar">الوصف</span></label><textarea class="control" id="rf-description" maxlength="800" placeholder="What you serve, what you're known for, and what first-time guests should order.">${U.esc(r.description || "")}</textarea><span class="hint"><span id="rf-count">0</span> / 800 · at least 40 characters</span><span class="err">Write at least 40 characters.</span></div>
        <div class="row2">
          <div class="field" data-f="instagram"><label for="rf-instagram">Instagram account <span class="ar">إنستغرام</span></label><div class="affix"><span>@</span><input class="control" id="rf-instagram" autocapitalize="off" spellcheck="false" maxlength="60" value="${U.esc(r.instagram || "")}" placeholder="yourrestaurant"></div><span class="err">Enter a valid Instagram username.</span></div>
          <div class="field" data-f="website"><label for="rf-website">Website <span class="ar">الموقع الإلكتروني</span></label><input class="control" id="rf-website" inputmode="url" autocapitalize="off" spellcheck="false" value="${U.esc(r.website || "")}" placeholder="yourrestaurant.com"><span class="err">Enter a valid website address.</span></div>
        </div>
      </section>`);
    if (sections.includes("branding")) html.push(`
      <section class="rf-sec" data-sec="branding">
        <div class="row2" style="grid-template-columns:minmax(0,.7fr) minmax(0,1.3fr)">
          <div class="field" data-f="logo"><span class="label">Restaurant logo <span class="ar">الشعار</span></span>
            <label class="drop logo" id="rf-logo"><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" aria-label="Upload logo"><span class="ph"><b>Upload logo</b>PNG, JPG, SVG · max 2 MB</span></label><span class="err">Upload your logo.</span></div>
          <div class="field" data-f="cover"><span class="label">Cover image <span class="ar">صورة الغلاف</span></span>
            <label class="drop" id="rf-cover"><input type="file" accept="image/png,image/jpeg,image/webp" aria-label="Upload cover image"><span class="ph"><b>Upload cover image</b>Landscape, 1600 × 900 or larger · max 5 MB</span></label><span class="err">Upload a cover image.</span></div>
        </div>
        <div class="field" data-f="photos"><span class="label">Food photography <span class="ar">صور الأطباق</span></span><div class="thumbs" id="rf-photos"></div><span class="hint" id="rf-photo-hint"></span><span class="err">Add at least one food photo.</span></div>
      </section>`);
    if (sections.includes("profile")) {
      const h = r.hours || {};
      html.push(`
      <section class="rf-sec" data-sec="profile">
        <div class="row2">
          <div class="field"><label for="rf-name-ar">Name in Arabic <span class="ar">الاسم بالعربي</span></label><input class="control" id="rf-name-ar" dir="rtl" maxlength="80" value="${U.esc(r.name_ar || "")}"></div>
          <div class="field"><label for="rf-price">Price range <span class="ar">متوسط الأسعار</span></label><select class="control" id="rf-price"><option value="">Not set</option>${D.priceRanges.map(p => opt(p, p, r.price_range === p)).join("")}</select></div>
        </div>
        <div class="field"><label for="rf-desc-ar">Description in Arabic <span class="ar">الوصف بالعربي</span></label><textarea class="control" id="rf-desc-ar" dir="rtl" maxlength="800">${U.esc(r.description_ar || "")}</textarea></div>
        <div class="field"><span class="label">Opening hours <span class="ar">أوقات العمل</span></span><div class="hours" id="rf-hours">${D.days.map(d => { const x = h[d] || { open: "12:00", close: "23:00", closed: false }; return `<div class="day" data-day="${d}"><b>${d}</b><input class="control" type="time" aria-label="${d} opens" value="${x.open || ""}" ${x.closed ? "disabled" : ""}><input class="control" type="time" aria-label="${d} closes" value="${x.close || ""}" ${x.closed ? "disabled" : ""}><label class="check small"><input type="checkbox" ${x.closed ? "checked" : ""}> Closed</label></div>`; }).join("")}</div></div>
        <div class="field"><span class="label">Features <span class="ar">المميزات</span></span><div class="chips" id="rf-features">${D.features.map(f => `<label><input type="checkbox" value="${U.esc(f)}" ${(r.features || []).includes(f) ? "checked" : ""}><span>${U.esc(f)}</span></label>`).join("")}</div></div>
        <div class="field"><label for="rf-menu">Menu link <span class="ar">رابط المنيو</span></label><input class="control" id="rf-menu" inputmode="url" value="${U.esc(r.menu_url && /^https?:/.test(r.menu_url) ? r.menu_url : "")}" placeholder="https://…">
          <label class="check small"><span>Or upload a PDF or image (max 10 MB):</span><input type="file" id="rf-menu-file" accept="application/pdf,image/png,image/jpeg,image/webp" style="width:auto"></label>
          ${r.menu_url ? `<span class="hint">Current menu: <a href="${U.esc(r.menu_url)}" target="_blank" rel="noopener">open</a></span>` : ""}</div>
      </section>`);
    }
    if (sections.includes("plan")) html.push(`
      <section class="rf-sec" data-sec="plan">
        <div class="plans" role="radiogroup" aria-label="Subscription plan">${cfg.PLANS.map(p => `
          <label class="plan">${p.popular ? '<span class="pop">Most popular</span>' : ""}<input type="radio" name="rf-plan" value="${p.id}" ${(r.plan || "free") === p.id ? "checked" : ""} ${planLocked ? "disabled" : ""}>
            <span class="nm">${p.name}<span class="ar-d">${p.ar}</span></span><span class="pr">${p.price} <small>${p.period}</small></span>
            <span class="small muted">${p.blurb}</span><ul>${p.features.map(f => `<li>${f}</li>`).join("")}</ul></label>`).join("")}</div>
        <p class="small muted">${planLocked ? "Your plan is set. To change it, WhatsApp us on " + U.esc(cfg.SUPPORT_WHATSAPP) + "." : "No payment now. Paid plans are billed only after your restaurant is approved, and you can change plan before then."}</p>
      </section>`);
    root.innerHTML = html.join("");

    // Sections may be moved elsewhere in the page (e.g. wizard steps), so look things up across them.
    const secs = [...root.querySelectorAll(".rf-sec")];
    const $ = s => { for (const el of secs) { const m = el.matches(s) ? el : el.querySelector(s); if (m) return m; } return null; };
    const $$ = s => secs.flatMap(el => [...el.querySelectorAll(s)]);
    const on = (t, fn) => secs.forEach(el => el.addEventListener(t, fn));
    const field = name => $(`[data-f="${name}"]`);
    const listeners = [];
    const changed = () => listeners.forEach(cb => cb());
    on("input", changed); on("change", changed);

    // City list follows governorate.
    function fillCities() {
      const sel = $("#rf-city"); if (!sel) return;
      const g = D.governorates.find(x => x.en === $("#rf-governorate").value);
      sel.innerHTML = g ? `<option value="">Choose a city</option>` + g.cities.map(c => opt(c, c, r.city === c)).join("") : `<option value="">Choose a governorate first</option>`;
    }
    if ($("#rf-governorate")) { fillCities(); $("#rf-governorate").addEventListener("change", () => { r.city = ""; fillCities(); }); }
    const count = () => { if ($("#rf-count")) $("#rf-count").textContent = $("#rf-description").value.length; };
    if ($("#rf-description")) { count(); $("#rf-description").addEventListener("input", count); }
    if ($("#rf-hours")) $("#rf-hours").addEventListener("change", e => { if (e.target.type === "checkbox") e.target.closest(".day").querySelectorAll("input[type=time]").forEach(t => t.disabled = e.target.checked); });

    let logo, cover, photos;
    const planNow = () => ($("input[name=rf-plan]:checked") || {}).value || r.plan || "free";
    if (sections.includes("branding")) {
      logo = U.bindImage($("#rf-logo"), { max: 2, types: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"], onChange: changed });
      cover = U.bindImage($("#rf-cover"), { max: 5, onChange: changed });
      if (r.logo_url) logo.set(r.logo_url);
      if (r.cover_url) cover.set(r.cover_url);
      const limit = () => editing ? PHOTO_LIMIT[planNow()] : Math.min(8, PHOTO_LIMIT[planNow()]);
      photos = U.bindPhotos($("#rf-photos"), { limit: limit(), existing: r.photos || [], onChange: () => { $("#rf-photo-hint").textContent = `${photos ? photos.count() : 0} of ${limit()} photos on the ${U.plan(planNow()).name} plan. Bright, close-up dish photos work best.`; changed(); } });
      on("change", e => { if (e.target.name === "rf-plan") photos.setLimit(limit()); });
      photos.setLimit(limit()); // redraw now that `photos` exists, so the counter is right
    }

    // ----- validation -----
    const v = id => ($("#" + id) || {}).value || "";
    const rules = {
      name: () => v("rf-name").trim().length >= 2,
      category: () => !!v("rf-category"),
      cuisine: () => !!v("rf-cuisine"),
      governorate: () => !!v("rf-governorate"),
      city: () => !!v("rf-city"),
      area: () => v("rf-area").trim().length >= 2,
      contact_phone: () => U.V.phone(v("rf-phone")),
      address: () => v("rf-address").trim().length >= 5,
      maps_url: () => U.V.maps(v("rf-maps")),
      description: () => v("rf-description").trim().length >= 40,
      instagram: () => U.V.instagram(v("rf-instagram")),
      website: () => U.V.url(v("rf-website")),
      logo: () => !!(logo.get() || r.logo_url),
      cover: () => !!(cover.get() || r.cover_url),
      photos: () => photos.count() > 0
    };
    const secRules = { info: ["name", "category", "cuisine", "governorate", "city", "area", "contact_phone", "address", "maps_url", "description", "instagram", "website"], branding: ["logo", "cover", "photos"], profile: [], plan: [] };
    // Live re-check of fields already flagged.
    on("input", e => { const f = e.target.closest("[data-f]"); if (f && f.classList.contains("invalid") && rules[f.dataset.f]) U.mark(f, rules[f.dataset.f]()); });
    on("change", e => { const f = e.target.closest("[data-f]"); if (f && f.classList.contains("invalid") && rules[f.dataset.f]) U.mark(f, rules[f.dataset.f]()); });
    on("focusout", e => { const f = e.target.closest("[data-f]"); if (f && rules[f.dataset.f] && e.target.value) U.mark(f, rules[f.dataset.f]()); });

    function validate(sec) {
      const names = (sec ? [sec] : sections).flatMap(s => secRules[s] || []);
      let ok = true;
      names.forEach(n => { const good = U.mark(field(n), rules[n]()); ok = ok && good; });
      if (!ok) { const bad = $(".field.invalid"); if (bad) U.firstInvalid(bad.parentElement); }
      return ok;
    }
    function values() {
      const out = {};
      if (sections.includes("info")) Object.assign(out, {
        name: v("rf-name").trim(), category: v("rf-category"), cuisine: v("rf-cuisine"), governorate: v("rf-governorate"), city: v("rf-city"),
        area: v("rf-area").trim(), contact_phone: U.omani(v("rf-phone")), address: v("rf-address").trim(), maps_url: v("rf-maps").trim(),
        description: v("rf-description").trim(), instagram: U.normIg(v("rf-instagram")), website: U.normUrl(v("rf-website"))
      });
      if (sections.includes("profile")) {
        const hours = {};
        $$("#rf-hours .day").forEach(d => { const [o, c] = d.querySelectorAll("input[type=time]"); hours[d.dataset.day] = { open: o.value, close: c.value, closed: d.querySelector("input[type=checkbox]").checked }; });
        Object.assign(out, { name_ar: v("rf-name-ar").trim() || null, description_ar: v("rf-desc-ar").trim() || null, price_range: v("rf-price") || null, hours,
          features: $$("#rf-features input:checked").map(i => i.value), menu_url: U.normUrl(v("rf-menu")) || r.menu_url || null });
      }
      if (sections.includes("plan") && !planLocked) out.plan = planNow();
      return out;
    }
    function files() {
      const f = {};
      if (logo && logo.get()) f.logo = logo.get();
      if (cover && cover.get()) f.cover = cover.get();
      if (photos) f.photos = photos.files();
      const m = $("#rf-menu-file"); if (m && m.files[0]) f.menu = m.files[0];
      return f;
    }
    return {
      validate, values, files, onChange: cb => listeners.push(cb),
      keptPhotos: () => photos ? photos.kept() : undefined,
      previews: () => ({ logo: logo && logo.previewUrl(), cover: cover && cover.previewUrl() }),
      plan: planNow
    };
  }
  window.DineRestaurantForm = { mount, PHOTO_LIMIT };
})();
