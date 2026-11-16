// Dine Oman: restaurant fields, shared by owner sign-up, "add a branch" and profile editing.
// mount(container, { sections: ["info","branding","profile","plan"], initial, editing, planLocked }) → controller
(function () {
  const U = window.DineUI, D = window.DINE_DATA, cfg = window.DINE_CONFIG, t = window.t, L = D.label;
  const PHOTO_LIMIT = { free: 4, standard: 12, premium: 24, featured: 24 };
  const opt = (v, label, sel) => `<option value="${U.esc(v)}" ${sel ? "selected" : ""}>${U.esc(label)}</option>`;
  const field = (f, label, control, err, hint) => `<div class="field" data-f="${f}"><label for="rf-${f}">${label}</label>${control}${hint ? `<span class="hint">${hint}</span>` : ""}<span class="err">${err}</span></div>`;

  function mount(root, { sections = ["info", "branding", "plan"], initial = {}, editing = false, planLocked = false } = {}) {
    const r = initial;
    const html = [];
    if (sections.includes("info")) html.push(`
      <section class="rf-sec form" data-sec="info">
        <div class="field" data-f="name"><label for="rf-name">${t("اسم المطعم", "Restaurant name")}</label><input class="input" id="rf-name" maxlength="80" value="${U.esc(r.name || "")}"><span class="err">${t("أدخل اسم المطعم.", "Enter the restaurant's name.")}</span></div>
        <div class="two">
          <div class="field" data-f="category"><label for="rf-category">${t("التصنيف", "Category")}</label><select class="input" id="rf-category"><option value="">${t("اختر", "Choose")}</option>${D.categories.map(c => opt(c, L(c), r.category === c)).join("")}</select><span class="err">${t("اختر التصنيف.", "Choose a category.")}</span></div>
          <div class="field" data-f="cuisine"><label for="rf-cuisine">${t("نوع المطبخ", "Cuisine")}</label><select class="input" id="rf-cuisine"><option value="">${t("اختر", "Choose")}</option>${D.cuisines.map(c => opt(c, L(c), r.cuisine === c)).join("")}</select><span class="err">${t("اختر نوع المطبخ.", "Choose a cuisine.")}</span></div>
        </div>
        <div class="two">
          <div class="field" data-f="governorate"><label for="rf-governorate">${t("المحافظة", "Governorate")}</label><select class="input" id="rf-governorate"><option value="">${t("اختر", "Choose")}</option>${D.governorates.map(g => opt(g.en, L(g.en), r.governorate === g.en)).join("")}</select><span class="err">${t("اختر المحافظة.", "Choose a governorate.")}</span></div>
          <div class="field" data-f="city"><label for="rf-city">${t("الولاية", "City")}</label><select class="input" id="rf-city"></select><span class="err">${t("اختر الولاية.", "Choose a city.")}</span></div>
        </div>
        <div class="two">
          <div class="field" data-f="area"><label for="rf-area">${t("المنطقة", "Area")}</label><input class="input" id="rf-area" maxlength="80" value="${U.esc(r.area || "")}" placeholder="${t("مثال: الخوير", "e.g. Al Khuwair")}"><span class="err">${t("أدخل المنطقة.", "Enter the area.")}</span></div>
          <div class="field" data-f="contact_phone"><label for="rf-phone">${t("رقم التواصل", "Contact number")}</label><div class="affix"><span>+968</span><input class="input" id="rf-phone" inputmode="numeric" maxlength="9" value="${U.esc((r.contact_phone || "").replace(/^\+968/, ""))}"></div><span class="err">${t("أدخل رقمًا عُمانيًا من 8 أرقام.", "Enter an 8-digit Omani number.")}</span></div>
        </div>
        ${field("address", t("العنوان", "Full address"), `<input class="input" id="rf-address" maxlength="200" value="${U.esc(r.address || "")}">`, t("أدخل العنوان كاملًا.", "Enter the full address."))}
        ${field("maps_url", t("موقع خرائط Google", "Google Maps location"), `<input class="input ltr" id="rf-maps" inputmode="url" value="${U.esc(r.maps_url || "")}" placeholder="https://maps.app.goo.gl/…">`, t("الصق رابط خرائط Google أو الإحداثيات.", "Paste a Google Maps link or coordinates."),
          t(`من <a href="https://www.google.com/maps" target="_blank" rel="noopener">خرائط Google</a>: ابحث عن مطعمك ثم مشاركة ثم نسخ الرابط.`, `In <a href="https://www.google.com/maps" target="_blank" rel="noopener">Google Maps</a>, find your restaurant, then Share, then Copy link.`))}
        ${field("description", t("وصف المطعم", "Description"), `<textarea class="input" id="rf-description" maxlength="800">${U.esc(r.description || "")}</textarea>`, t("اكتب 40 حرفًا على الأقل.", "Write at least 40 characters."), t("ماذا تقدّمون، وبماذا تشتهرون؟", "What do you serve, and what are you known for?"))}
        <div class="two">
          <div class="field" data-f="instagram"><label for="rf-instagram">${t("إنستغرام", "Instagram")}</label><div class="affix"><span>@</span><input class="input" id="rf-instagram" autocapitalize="off" spellcheck="false" maxlength="60" value="${U.esc(r.instagram || "")}"></div><span class="err">${t("أدخل اسم حساب صحيح.", "Enter a valid username.")}</span></div>
          ${field("website", t("الموقع الإلكتروني", "Website"), `<input class="input ltr" id="rf-website" inputmode="url" autocapitalize="off" spellcheck="false" value="${U.esc(r.website || "")}" placeholder="example.com">`, t("أدخل عنوانًا صحيحًا.", "Enter a valid website address."))}
        </div>
      </section>`);
    if (sections.includes("branding")) html.push(`
      <section class="rf-sec form" data-sec="branding">
        <div class="two" style="grid-template-columns:minmax(0,1fr) minmax(0,2fr)">
          <div class="field" data-f="logo"><span class="label">${t("الشعار", "Logo")}</span><label class="drop logo" id="rf-logo"><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" aria-label="${t("رفع الشعار", "Upload logo")}"><span class="ph"><b>${t("رفع الشعار", "Upload logo")}</b>${t("حتى 2 ميجابايت", "Up to 2 MB")}</span></label><span class="err">${t("ارفع الشعار.", "Upload your logo.")}</span></div>
          <div class="field" data-f="cover"><span class="label">${t("صورة الغلاف", "Cover image")}</span><label class="drop" id="rf-cover"><input type="file" accept="image/png,image/jpeg,image/webp" aria-label="${t("رفع صورة الغلاف", "Upload cover image")}"><span class="ph"><b>${t("رفع صورة الغلاف", "Upload cover image")}</b>${t("صورة عرضية · حتى 5 ميجابايت", "Landscape · up to 5 MB")}</span></label><span class="err">${t("ارفع صورة الغلاف.", "Upload a cover image.")}</span></div>
        </div>
        <div class="field" data-f="photos"><span class="label">${t("صور الأطباق", "Food photos")}</span><div class="thumbs" id="rf-photos"></div><span class="err">${t("أضف صورة واحدة على الأقل.", "Add at least one photo.")}</span></div>
      </section>`);
    if (sections.includes("profile")) {
      const h = r.hours || {};
      html.push(`
      <section class="rf-sec form" data-sec="profile">
        <div class="two">
          <div class="field"><label for="rf-name-ar">${t("الاسم بالعربي", "Name in Arabic")}</label><input class="input" id="rf-name-ar" dir="rtl" maxlength="80" value="${U.esc(r.name_ar || "")}"></div>
          <div class="field"><label for="rf-price">${t("متوسط الأسعار", "Price range")}</label><select class="input" id="rf-price"><option value="">${t("غير محدد", "Not set")}</option>${D.priceRanges.map(p => opt(p, L(p), r.price_range === p)).join("")}</select></div>
        </div>
        <div class="field"><label for="rf-desc-ar">${t("الوصف بالعربي", "Description in Arabic")}</label><textarea class="input" id="rf-desc-ar" dir="rtl" maxlength="800">${U.esc(r.description_ar || "")}</textarea></div>
        <div class="field"><span class="label">${t("أوقات العمل", "Opening hours")}</span><div class="hours-edit" id="rf-hours">${D.days.map(d => { const x = h[d] || { open: "12:00", close: "23:00", closed: false }; return `<div class="day" data-day="${d}"><b>${L(d)}</b><input class="input" type="time" aria-label="${L(d)} ${t("يفتح", "opens")}" value="${x.open || ""}" ${x.closed ? "disabled" : ""}><input class="input" type="time" aria-label="${L(d)} ${t("يغلق", "closes")}" value="${x.close || ""}" ${x.closed ? "disabled" : ""}><label class="check"><input type="checkbox" ${x.closed ? "checked" : ""}> ${t("مغلق", "Closed")}</label></div>`; }).join("")}</div></div>
        <div class="field"><span class="label">${t("المميزات", "Features")}</span><div class="chips" id="rf-features">${D.features.map(f => `<label><input type="checkbox" value="${U.esc(f)}" ${(r.features || []).includes(f) ? "checked" : ""}><span>${U.esc(L(f))}</span></label>`).join("")}</div></div>
        <div class="field"><label for="rf-menu">${t("رابط المنيو", "Menu link")}</label><input class="input ltr" id="rf-menu" inputmode="url" value="${U.esc(r.menu_url && /^https?:/.test(r.menu_url) ? r.menu_url : "")}" placeholder="https://">
          <span class="hint">${t("أو ارفع ملف PDF أو صورة:", "Or upload a PDF or image:")} <input type="file" id="rf-menu-file" accept="application/pdf,image/png,image/jpeg,image/webp"></span></div>
      </section>`);
    }
    if (sections.includes("plan")) html.push(`
      <section class="rf-sec form" data-sec="plan">
        <div class="plans" role="radiogroup" aria-label="${t("الباقة", "Plan")}">${cfg.PLANS.map(p => { const P = U.plan(p.id); return `
          <label class="plan"><input type="radio" name="rf-plan" value="${p.id}" ${(r.plan || "free") === p.id ? "checked" : ""} ${planLocked ? "disabled" : ""}>
            <span><b>${P.label}</b><span class="d">${P.lineLabel}</span></span><span class="p">${P.priceLabel}</span></label>`; }).join("")}</div>
        <p class="hint">${planLocked ? t(`لتغيير الباقة تواصل معنا عبر واتساب ${cfg.SUPPORT_WHATSAPP}.`, `To change plan, WhatsApp us on ${cfg.SUPPORT_WHATSAPP}.`) : t("لا دفع الآن. الباقات المدفوعة تبدأ بعد الموافقة على مطعمك.", "No payment now. Paid plans start after your restaurant is approved.")}</p>
      </section>`);
    root.innerHTML = html.join("");

    // Sections may be moved into other containers (wizard steps), so look things up across them.
    const secs = [...root.querySelectorAll(".rf-sec")];
    const $ = s => { for (const el of secs) { const m = el.matches(s) ? el : el.querySelector(s); if (m) return m; } return null; };
    const $$ = s => secs.flatMap(el => [...el.querySelectorAll(s)]);
    const on = (ev, fn) => secs.forEach(el => el.addEventListener(ev, fn));
    const fieldEl = name => $(`[data-f="${name}"]`);
    const listeners = [];
    const changed = () => listeners.forEach(cb => cb());
    on("input", changed); on("change", changed);

    function fillCities() {
      const sel = $("#rf-city"); if (!sel) return;
      const g = D.governorates.find(x => x.en === $("#rf-governorate").value);
      sel.innerHTML = `<option value="">${g ? t("اختر", "Choose") : t("اختر المحافظة أولًا", "Choose a governorate first")}</option>` + (g ? g.cities.map(c => opt(c, L(c), r.city === c)).join("") : "");
    }
    if ($("#rf-governorate")) { fillCities(); $("#rf-governorate").addEventListener("change", () => { r.city = ""; fillCities(); }); }
    if ($("#rf-hours")) $("#rf-hours").addEventListener("change", e => { if (e.target.type === "checkbox") e.target.closest(".day").querySelectorAll("input[type=time]").forEach(x => x.disabled = e.target.checked); });

    let logo, cover, photos;
    const planNow = () => ($("input[name=rf-plan]:checked") || {}).value || r.plan || "free";
    if (sections.includes("branding")) {
      logo = U.bindImage($("#rf-logo"), { max: 2, types: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"], onChange: changed });
      cover = U.bindImage($("#rf-cover"), { max: 5, onChange: changed });
      if (r.logo_url) logo.set(r.logo_url);
      if (r.cover_url) cover.set(r.cover_url);
      const limit = () => editing ? PHOTO_LIMIT[planNow()] : Math.min(8, PHOTO_LIMIT[planNow()]);
      photos = U.bindPhotos($("#rf-photos"), { limit: limit(), existing: r.photos || [], onChange: changed });
      on("change", e => { if (e.target.name === "rf-plan") photos.setLimit(limit()); });
    }

    const v = id => ($("#" + id) || {}).value || "";
    const rules = {
      name: () => v("rf-name").trim().length >= 2, category: () => !!v("rf-category"), cuisine: () => !!v("rf-cuisine"),
      governorate: () => !!v("rf-governorate"), city: () => !!v("rf-city"), area: () => v("rf-area").trim().length >= 2,
      contact_phone: () => U.V.phone(v("rf-phone")), address: () => v("rf-address").trim().length >= 5, maps_url: () => U.V.maps(v("rf-maps")),
      description: () => v("rf-description").trim().length >= 40, instagram: () => U.V.instagram(v("rf-instagram")), website: () => U.V.url(v("rf-website")),
      logo: () => !!(logo.get() || r.logo_url), cover: () => !!(cover.get() || r.cover_url), photos: () => photos.count() > 0
    };
    const secRules = { info: ["name", "category", "cuisine", "governorate", "city", "area", "contact_phone", "address", "maps_url", "description", "instagram", "website"], branding: ["logo", "cover", "photos"], profile: [], plan: [] };
    const recheck = e => { const f = e.target.closest("[data-f]"); if (f && f.classList.contains("invalid") && rules[f.dataset.f]) U.mark(f, rules[f.dataset.f]()); };
    on("input", recheck); on("change", recheck);
    on("focusout", e => { const f = e.target.closest("[data-f]"); if (f && rules[f.dataset.f] && e.target.value) U.mark(f, rules[f.dataset.f]()); });

    function validate(sec) {
      const names = (sec ? [sec] : sections).flatMap(s => secRules[s] || []);
      let ok = true;
      names.forEach(n => { const good = U.mark(fieldEl(n), rules[n]()); ok = ok && good; });
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
    return { validate, values, files, onChange: cb => listeners.push(cb), keptPhotos: () => photos ? photos.kept() : undefined, plan: planNow };
  }
  window.DineRestaurantForm = { mount, PHOTO_LIMIT };
})();
