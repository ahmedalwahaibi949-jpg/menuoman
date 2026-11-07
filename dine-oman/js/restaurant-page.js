// Dine Oman: public restaurant profile. Works at restaurant.html?slug=… and at /restaurant/<slug> (via the site's 404.html).
(async function () {
  const api = window.DineAPI, U = window.DineUI, D = window.DINE_DATA, $ = U.$, esc = U.esc;
  const slug = new URLSearchParams(location.search).get("slug") || (decodeURIComponent(location.pathname).match(/\/restaurant\/([a-z0-9-]+)\/?$/) || [])[1];
  const me = await U.chrome();
  const root = $("#page");

  const r = slug ? await api.restaurantBySlug(slug).catch(() => null) : null;
  if (!r) {
    document.title = "Restaurant not found · Dine Oman";
    root.innerHTML = `<div class="container" style="padding-block:80px"><div class="card empty"><b>We couldn't find that restaurant</b><span>The link may be wrong, or the page isn't published.</span><a class="btn btn-dark" href="restaurants.html">Discover restaurants</a></div></div>`;
    return;
  }

  // SEO basics
  document.title = `${r.name} · ${r.area}, ${r.city} · Dine Oman`;
  const meta = (n, c, prop) => { let m = document.querySelector(`meta[${prop ? "property" : "name"}="${n}"]`); if (!m) { m = document.createElement("meta"); m.setAttribute(prop ? "property" : "name", n); document.head.appendChild(m); } m.content = c; };
  meta("description", r.description.slice(0, 160)); meta("og:title", r.name, true); meta("og:image", r.cover_url, true);
  const canon = document.createElement("link"); canon.rel = "canonical"; canon.href = U.publicUrl(r.slug); document.head.appendChild(canon);

  const isCustomer = me && me.role === "customer";
  if (isCustomer) api.recordView(r.id).catch(() => {});

  // Open now? Uses Oman time (UTC+4).
  function openState() {
    const h = r.hours || {};
    if (!Object.keys(h).length) return null;
    const om = new Date(Date.now() + (new Date().getTimezoneOffset() + 240) * 60000);
    const day = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][om.getDay()];
    const t = h[day]; if (!t || t.closed || !t.open || !t.close) return { open: false, label: "Closed today" };
    const mins = om.getHours() * 60 + om.getMinutes(), toM = s => { const [a, b] = s.split(":").map(Number); return a * 60 + b; };
    const o = toM(t.open), c = toM(t.close);
    const open = c > o ? mins >= o && mins < c : mins >= o || mins < c;
    return { open, label: open ? `Open now · until ${t.close}` : `Closed · opens ${t.open}` };
  }
  const st = openState();
  const [reviews, fav] = await Promise.all([api.reviewsFor(r.id), isCustomer ? api.isFavourite(r.id) : false]);
  const avg = reviews.length ? reviews.reduce((s, x) => s + x.rating, 0) / reviews.length : 0;
  const mine = me ? reviews.find(x => x.user_id === me.id) : null;
  const mapHref = /^https?:/.test(r.maps_url) ? r.maps_url : "https://www.google.com/maps?q=" + encodeURIComponent(r.maps_url);
  const wa = r.contact_phone.replace(/\D/g, "");
  const phone = r.contact_phone.replace(/^\+968(\d{4})(\d{4})$/, "+968 $1 $2");

  root.innerHTML = `
    <section class="rp-hero"><img src="${esc(r.cover_url)}" alt="${esc(r.name)}"></section>
    <div class="container rp">
      <div class="rp-head card">
        <img class="rp-logo" src="${esc(r.logo_url)}" alt="${esc(r.name)} logo">
        <div style="min-width:0">
          <p class="eyebrow" style="color:var(--teal-2)">${esc(r.category)} · ${esc(r.cuisine)}${r.plan === "featured" ? ' · <span class="badge live" style="padding:2px 8px">Featured</span>' : ""}</p>
          <h1>${esc(r.name)}</h1>${r.name_ar ? `<p class="ar-d rp-ar">${esc(r.name_ar)}</p>` : ""}
          <p class="muted">${esc(r.area)}, ${esc(r.city)}, ${esc(r.governorate)}${r.price_range ? " · " + esc(r.price_range) : ""}</p>
          <div class="rp-tags">${st ? `<span class="chip" style="background:${st.open ? "var(--ok-bg)" : "var(--soft)"};color:${st.open ? "var(--ok)" : "var(--muted)"}">${esc(st.label)}</span>` : ""}${reviews.length ? `<span class="chip"><span class="stars">★</span> ${avg.toFixed(1)} · ${reviews.length} review${reviews.length > 1 ? "s" : ""}</span>` : ""}</div>
        </div>
        <div class="rp-acts">
          <button class="btn ${fav ? "btn-dark" : "btn-line"}" id="fav" aria-pressed="${fav}">${fav ? "♥ Saved" : "♡ Save"}</button>
          <a class="btn btn-primary" href="${esc(mapHref)}" target="_blank" rel="noopener">Directions</a>
        </div>
      </div>

      <div class="rp-grid">
        <div class="stack" style="min-width:0">
          <div class="card"><h2>About</h2><p style="margin-top:10px;white-space:pre-wrap">${esc(r.description)}</p>${r.description_ar ? `<p class="ar" style="margin-top:14px;text-align:right;white-space:pre-wrap;color:var(--muted)">${esc(r.description_ar)}</p>` : ""}
            ${(r.features || []).length ? `<div class="chips" style="margin-top:16px">${r.features.map(f => `<span class="chip">${esc(f)}</span>`).join("")}</div>` : ""}</div>
          ${(r.photos || []).length ? `<div class="card"><h2>Photos</h2><div class="rp-photos">${r.photos.map((p, i) => `<button class="rp-ph" data-i="${i}" aria-label="Open photo ${i + 1}"><img src="${esc(p)}" alt="" loading="lazy"></button>`).join("")}</div></div>` : ""}
          <div class="card" id="reviews">
            <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:baseline"><h2>Reviews</h2>${reviews.length ? `<span><span class="stars">${U.stars(Math.round(avg))}</span> <b>${avg.toFixed(1)}</b> <span class="muted">from ${reviews.length}</span></span>` : ""}</div>
            <div id="review">${isCustomer ? reviewForm() : `<div class="alert info small" style="margin-top:14px">${me ? "Reviews are written by customer accounts." : `<a href="login.html?next=${encodeURIComponent("restaurant.html?slug=" + r.slug)}">Log in</a> or <a href="signup.html">create a free account</a> to write a review.`}</div>`}</div>
            <div class="rp-reviews">${reviews.length ? reviews.map(x => `<article><div><b>${esc(x.author_name || "Guest")}</b> <span class="stars" aria-label="${x.rating} out of 5">${U.stars(x.rating)}</span> <span class="small muted">${U.date(x.created_at)}</span></div><p>${esc(x.body)}</p></article>`).join("") : `<p class="muted" style="margin-top:12px">No reviews yet. Be the first to share your experience.</p>`}</div>
          </div>
        </div>
        <aside class="stack">
          <div class="card"><h2>Contact</h2><dl class="rp-kv">
            <dt>Address</dt><dd>${esc(r.address)}<br>${esc(r.area)}, ${esc(r.city)}</dd>
            <dt>Phone</dt><dd><span class="sel">${esc(phone)}</span> · <a href="tel:${esc(r.contact_phone)}">Call</a> · <a href="https://wa.me/${wa}" target="_blank" rel="noopener">WhatsApp</a></dd>
            <dt>Instagram</dt><dd><a href="https://instagram.com/${esc(r.instagram)}" target="_blank" rel="noopener">@${esc(r.instagram)}</a></dd>
            <dt>Website</dt><dd><a href="${esc(r.website)}" target="_blank" rel="noopener">${esc(r.website.replace(/^https?:\/\//, "").replace(/\/$/, ""))}</a></dd>
            ${r.menu_url ? `<dt>Menu</dt><dd><a href="${esc(r.menu_url)}" target="_blank" rel="noopener">View menu ↗</a></dd>` : ""}
          </dl></div>
          ${Object.keys(r.hours || {}).length ? `<div class="card"><h2>Opening hours</h2><table class="rp-hours">${D.days.map(d => { const h = r.hours[d] || {}; return `<tr><th>${d}</th><td>${h.closed || !h.open ? "Closed" : `${esc(h.open)} – ${esc(h.close)}`}</td></tr>`; }).join("")}</table></div>` : ""}
          <div class="card small muted">Is this your restaurant? <a href="login.html">Log in</a> to update it.</div>
        </aside>
      </div>
    </div>
    <dialog class="lightbox" id="lb"><img id="lbImg" alt=""><button type="button" id="lbClose" aria-label="Close">×</button></dialog>`;

  function reviewForm() {
    return `<form id="rvForm" class="stack" novalidate style="margin-top:14px;padding:16px;background:var(--soft);border-radius:12px">
      <b>${mine ? "Edit your review" : "Write a review"}</b>
      <div class="rate" role="radiogroup" aria-label="Rating">${[1, 2, 3, 4, 5].map(n => `<label><input type="radio" name="rating" value="${n}" ${mine && mine.rating === n ? "checked" : ""}><span aria-hidden="true">★</span><span class="sr">${n} star${n > 1 ? "s" : ""}</span></label>`).join("")}</div>
      <div class="field"><label for="rvBody" class="sr">Your review</label><textarea class="control" id="rvBody" maxlength="1000" placeholder="What did you order? How was the food, service and setting?">${esc(mine ? mine.body : "")}</textarea><span class="err">Pick a rating and write at least 10 characters.</span></div>
      <button class="btn btn-dark" style="justify-self:start" id="rvBtn">${mine ? "Update review" : "Post review"}</button></form>`;
  }

  $("#fav").onclick = async () => {
    if (!me) { location.href = "login.html?next=" + encodeURIComponent("restaurant.html?slug=" + r.slug); return; }
    if (!isCustomer) return U.toast("Favourites are for customer accounts.", true);
    const on = $("#fav").getAttribute("aria-pressed") !== "true";
    await api.setFavourite(r.id, on);
    $("#fav").setAttribute("aria-pressed", on); $("#fav").className = "btn " + (on ? "btn-dark" : "btn-line"); $("#fav").textContent = on ? "♥ Saved" : "♡ Save";
    U.toast(on ? "Saved to your favourites." : "Removed from favourites.");
  };
  if ($("#rvForm")) $("#rvForm").onsubmit = async e => {
    e.preventDefault();
    const rating = +(($("#rvForm").querySelector("input[name=rating]:checked") || {}).value || 0), body = $("#rvBody").value.trim();
    if (!U.mark($("#rvBody").closest(".field"), rating > 0 && body.length >= 10)) return;
    const btn = $("#rvBtn"); U.busy(btn, true, "Posting…");
    try { await api.saveReview(r.id, rating, body); U.toast("Thanks for your review."); location.reload(); }
    catch (err) { U.busy(btn, false); U.toast(err.message, true); }
  };
  const lb = $("#lb");
  root.querySelectorAll(".rp-ph").forEach(b => b.onclick = () => { $("#lbImg").src = r.photos[+b.dataset.i]; lb.showModal ? lb.showModal() : lb.setAttribute("open", ""); });
  $("#lbClose").onclick = () => lb.close ? lb.close() : lb.removeAttribute("open");
  lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });
  if (location.hash === "#review" && $("#rvBody")) setTimeout(() => $("#rvBody").focus(), 200);
})();
