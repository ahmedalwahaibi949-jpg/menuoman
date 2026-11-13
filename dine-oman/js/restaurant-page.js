// Dine Oman: public restaurant profile. Works at restaurant.html?slug=… and at /restaurant/<slug> (via the site's 404.html).
(async function () {
  const api = window.DineAPI, U = window.DineUI, D = window.DINE_DATA, $ = U.$, esc = U.esc, L = U.L, t = window.t;
  const slug = new URLSearchParams(location.search).get("slug") || (decodeURIComponent(location.pathname).match(/\/restaurant\/([a-z0-9-]+)\/?$/) || [])[1];
  const me = await U.chrome();
  const root = $("#page");
  const r = slug ? await api.restaurantBySlug(slug).catch(() => null) : null;
  if (!r) {
    document.title = t("المطعم غير موجود · داين عُمان", "Restaurant not found · Dine Oman");
    root.innerHTML = `<div class="wrap page"><div class="empty"><b>${t("لم نجد هذا المطعم", "We couldn't find that restaurant")}</b><span>${t("قد يكون الرابط غير صحيح أو الصفحة غير منشورة.", "The link may be wrong, or the page isn't published.")}</span><a class="link" href="restaurants.html">${t("استكشف المطاعم", "Discover restaurants")}</a></div></div>`;
    return;
  }
  const name = U.rname(r), desc = window.DINE_LANG === "ar" && r.description_ar ? r.description_ar : r.description;
  document.title = `${name} · ${t("داين عُمان", "Dine Oman")}`;
  const meta = (n, c, prop) => { let m = document.querySelector(`meta[${prop ? "property" : "name"}="${n}"]`); if (!m) { m = document.createElement("meta"); m.setAttribute(prop ? "property" : "name", n); document.head.appendChild(m); } m.content = c; };
  meta("description", r.description.slice(0, 160)); meta("og:title", r.name, true); meta("og:image", r.cover_url, true);
  const canon = document.createElement("link"); canon.rel = "canonical"; canon.href = U.publicUrl(r.slug); document.head.appendChild(canon);

  const isCustomer = me && me.role === "customer";
  if (isCustomer) api.recordView(r.id).catch(() => {});

  // Open now? In Oman time (UTC+4).
  function openState() {
    const h = r.hours || {}; if (!Object.keys(h).length) return null;
    const om = new Date(Date.now() + (new Date().getTimezoneOffset() + 240) * 60000);
    const x = h[["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][om.getDay()]];
    if (!x || x.closed || !x.open || !x.close) return { open: false, label: t("مغلق اليوم", "Closed today") };
    const mins = om.getHours() * 60 + om.getMinutes(), m = s => { const [a, b] = s.split(":").map(Number); return a * 60 + b; };
    const o = m(x.open), c = m(x.close), open = c > o ? mins >= o && mins < c : mins >= o || mins < c;
    return { open, label: open ? t(`مفتوح الآن حتى ${x.close}`, `Open now until ${x.close}`) : t(`مغلق · يفتح ${x.open}`, `Closed · opens ${x.open}`) };
  }
  const st = openState();
  const [reviews, fav] = await Promise.all([api.reviewsFor(r.id), isCustomer ? api.isFavourite(r.id) : false]);
  const avg = reviews.length ? reviews.reduce((s, x) => s + x.rating, 0) / reviews.length : 0;
  const mine = me ? reviews.find(x => x.user_id === me.id) : null;
  const mapHref = /^https?:/.test(r.maps_url) ? r.maps_url : "https://www.google.com/maps?q=" + encodeURIComponent(r.maps_url);
  const sub = [L(r.category), L(r.cuisine), `${r.area}${U.SEP}${L(r.city)}`, r.price_range ? L(r.price_range) : ""].filter(Boolean).join(" · ");
  const next = encodeURIComponent("restaurant.html?slug=" + r.slug);

  root.innerHTML = `<div class="wrap" style="padding-bottom:80px">
    <div class="cover"><img src="${esc(r.cover_url)}" alt="${esc(name)}"></div>
    <div class="r-head">
      <img class="lg" src="${esc(r.logo_url)}" alt="">
      <div style="min-width:0"><h1>${esc(name)}</h1><p class="muted">${esc(sub)}</p>
        <p class="small" style="margin-top:4px">${st ? `<span style="color:${st.open ? "var(--ok)" : "var(--muted)"}">${esc(st.label)}</span>` : ""}${st && reviews.length ? " · " : ""}${reviews.length ? `<a href="#reviews" style="color:inherit"><span class="stars">★</span> ${avg.toFixed(1)} (${reviews.length})</a>` : ""}</p></div>
      <div class="acts"><button class="heart" id="fav" aria-pressed="${fav}" aria-label="${t("حفظ في المفضلة", "Save to favourites")}">${U.HEART}</button><a class="btn" href="${esc(mapHref)}" target="_blank" rel="noopener">${t("الاتجاهات", "Directions")}</a></div>
    </div>
    <div class="r-body">
      <div style="min-width:0">
        <section class="r-sec"><h2>${t("نبذة", "About")}</h2><p style="white-space:pre-wrap">${esc(desc)}</p>
          ${(r.features || []).length ? `<div class="chips" style="margin-top:16px">${r.features.map(f => `<span class="chip">${esc(L(f))}</span>`).join("")}</div>` : ""}</section>
        ${(r.photos || []).length ? `<section class="r-sec"><h2>${t("الصور", "Photos")}</h2><div class="photos">${r.photos.map((p, i) => `<button data-i="${i}" aria-label="${t("صورة", "Photo")} ${i + 1}"><img src="${esc(p)}" alt="" loading="lazy"></button>`).join("")}</div></section>` : ""}
        <section class="r-sec" id="reviews"><h2>${t("التقييمات", "Reviews")}</h2>
          <div id="review">${isCustomer ? reviewForm() : `<p class="muted">${me ? t("التقييمات متاحة لحسابات الزبائن.", "Reviews are written by customer accounts.") : t(`<a href="login.html?next=${next}">سجّل الدخول</a> لكتابة تقييم.`, `<a href="login.html?next=${next}">Log in</a> to write a review.`)}</p>`}</div>
          <div class="rlist" style="margin-top:12px">${reviews.length ? reviews.map(x => `<div class="review"><b>${esc(x.author_name || t("زائر", "Guest"))}</b> <span class="stars">${U.stars(x.rating)}</span> <span class="small muted">${U.date(x.created_at)}</span><p>${esc(x.body)}</p></div>`).join("") : `<p class="muted">${t("لا توجد تقييمات بعد.", "No reviews yet.")}</p>`}</div>
        </section>
      </div>
      <aside>
        <section class="r-sec"><h2>${t("التواصل", "Contact")}</h2><dl class="kv" style="font-size:15.5px">
          <dt>${t("العنوان", "Address")}</dt><dd>${esc(r.address)}</dd>
          <dt>${t("الهاتف", "Phone")}</dt><dd><a class="ltr" href="tel:${esc(r.contact_phone)}">${esc(U.fmtPhone(r.contact_phone))}</a></dd>
          <dt>${t("واتساب", "WhatsApp")}</dt><dd><a href="https://wa.me/${esc(r.contact_phone.replace(/\D/g, ""))}" target="_blank" rel="noopener">${t("مراسلة", "Message")}</a></dd>
          <dt>${t("إنستغرام", "Instagram")}</dt><dd><a class="ltr" href="https://instagram.com/${esc(r.instagram)}" target="_blank" rel="noopener">@${esc(r.instagram)}</a></dd>
          <dt>${t("الموقع", "Website")}</dt><dd><a class="ltr" href="${esc(r.website)}" target="_blank" rel="noopener">${esc(r.website.replace(/^https?:\/\//, "").replace(/\/$/, ""))}</a></dd>
          ${r.menu_url ? `<dt>${t("المنيو", "Menu")}</dt><dd><a href="${esc(r.menu_url)}" target="_blank" rel="noopener">${t("عرض المنيو", "View menu")}</a></dd>` : ""}
        </dl></section>
        ${Object.keys(r.hours || {}).length ? `<section class="r-sec"><h2>${t("أوقات العمل", "Opening hours")}</h2><table class="hours">${D.days.map(d => { const h = r.hours[d] || {}; return `<tr><th>${L(d)}</th><td>${h.closed || !h.open ? t("مغلق", "Closed") : `${esc(h.open)} – ${esc(h.close)}`}</td></tr>`; }).join("")}</table></section>` : ""}
      </aside>
    </div></div>
    <dialog class="lightbox" id="lb"><img id="lbImg" alt=""><button type="button" id="lbClose" aria-label="${t("إغلاق", "Close")}">×</button></dialog>`;

  function reviewForm() {
    return `<form id="rvForm" class="form" novalidate style="margin-bottom:12px">
      <div class="rate" role="radiogroup" aria-label="${t("التقييم", "Rating")}">${[1, 2, 3, 4, 5].map(n => `<label><input type="radio" name="rating" value="${n}" ${mine && mine.rating === n ? "checked" : ""}><span aria-hidden="true">★</span><b class="sr">${n}</b></label>`).join("")}</div>
      <div class="field"><label for="rvBody" class="sr">${t("تقييمك", "Your review")}</label><textarea class="input" id="rvBody" maxlength="1000" placeholder="${t("كيف كان الأكل والخدمة والمكان؟", "How was the food, service and setting?")}">${esc(mine ? mine.body : "")}</textarea><span class="err">${t("اختر عدد النجوم واكتب 10 أحرف على الأقل.", "Pick a rating and write at least 10 characters.")}</span></div>
      <div><button class="btn" id="rvBtn">${mine ? t("تحديث التقييم", "Update review") : t("نشر التقييم", "Post review")}</button></div></form>`;
  }

  $("#fav").onclick = async () => {
    if (!me) { location.href = "login.html?next=" + next; return; }
    if (!isCustomer) return U.toast(t("المفضلة متاحة لحسابات الزبائن.", "Favourites are for customer accounts."), true);
    const on = $("#fav").getAttribute("aria-pressed") !== "true";
    await api.setFavourite(r.id, on);
    $("#fav").setAttribute("aria-pressed", on);
    U.toast(on ? t("أُضيف إلى المفضلة.", "Saved to favourites.") : t("أُزيل من المفضلة.", "Removed from favourites."));
  };
  if ($("#rvForm")) $("#rvForm").onsubmit = async e => {
    e.preventDefault();
    const rating = +(($("#rvForm").querySelector("input[name=rating]:checked") || {}).value || 0), body = $("#rvBody").value.trim();
    if (!U.mark($("#rvBody").closest(".field"), rating > 0 && body.length >= 10)) return;
    const btn = $("#rvBtn"); U.busy(btn, true);
    try { await api.saveReview(r.id, rating, body); U.toast(t("شكرًا لتقييمك.", "Thanks for your review.")); location.reload(); }
    catch (err) { U.busy(btn, false); U.toast(err.message, true); }
  };
  const lb = $("#lb");
  root.querySelectorAll(".photos button").forEach(b => b.onclick = () => { $("#lbImg").src = r.photos[+b.dataset.i]; lb.showModal ? lb.showModal() : lb.setAttribute("open", ""); });
  $("#lbClose").onclick = () => lb.close ? lb.close() : lb.removeAttribute("open");
  lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });
  if (location.hash === "#review" && $("#rvBody")) setTimeout(() => $("#rvBody").focus(), 200);
})();
