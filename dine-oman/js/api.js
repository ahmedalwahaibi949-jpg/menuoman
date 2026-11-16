// Dine Oman data layer.
// LIVE: Supabase Auth + Postgres (row-level security in supabase/schema.sql is the real gatekeeper).
// DEMO: a self-contained imitation in localStorage, including a demo inbox for emails.
(function () {
  const cfg = window.DINE_CONFIG || {};
  const live = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);
  const BUCKET = "restaurant-media";
  const SITE = (cfg.SITE_URL || location.origin + location.pathname.replace(/[^/]*$/, "")).replace(/\/$/, "");
  const RESTAURANT_FIELDS = ["plan", "name", "name_ar", "category", "cuisine", "governorate", "city", "area", "address", "maps_url",
    "description", "description_ar", "contact_phone", "instagram", "website", "hours", "price_range", "features", "menu_url"];

  const uuid = () => crypto.randomUUID ? crypto.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
  const ext = f => ((/\.([a-z0-9]{2,5})$/i.exec(f.name || "") || [])[1] || (f.type.split("/")[1] || "bin").replace("jpeg", "jpg").replace("svg+xml", "svg")).toLowerCase();
  const pick = (o, keys) => Object.fromEntries(keys.filter(k => o[k] !== undefined).map(k => [k, o[k]]));
  const slugify = t => (t || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const T = (ar, en) => (window.t ? window.t(ar, en) : en);
  function friendly(msg) {
    const m = String(msg || "");
    if (/Invalid login credentials/i.test(m)) return T("البريد الإلكتروني أو كلمة المرور غير صحيحة.", "That email and password don't match.");
    if (/Email not confirmed/i.test(m)) return "EMAIL_NOT_CONFIRMED";
    if (/already registered|already been registered/i.test(m)) return T("يوجد حساب بهذا البريد الإلكتروني. سجّل الدخول أو أعد تعيين كلمة المرور.", "An account with this email already exists. Log in, or reset your password.");
    if (/Password should be|weak/i.test(m)) return T("اختر كلمة مرور أقوى: 8 أحرف على الأقل تحتوي على حروف وأرقام.", "Choose a stronger password: at least 8 characters with letters and numbers.");
    if (/rate limit|too many/i.test(m)) return T("محاولات كثيرة. انتظر دقيقة ثم حاول مرة أخرى.", "Too many attempts. Please wait a minute and try again.");
    return m;
  }
  const fail = e => { throw new Error(friendly(e && e.message ? e.message : e)); };

  // =====================================================================
  // LIVE
  // =====================================================================
  function liveApi() {
    const sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    async function upload(path, file) {
      const { error } = await sb.storage.from(BUCKET).upload(path, file, { upsert: false, contentType: file.type, cacheControl: "31536000" });
      if (error) fail(T("تعذّر رفع الملف: ", "Upload failed: ") + error.message);
      return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    }
    async function uid() { const { data } = await sb.auth.getSession(); return data.session ? data.session.user.id : null; }
    async function uploadRestaurantFiles(prefix, files) {
      const out = {};
      if (files.logo) out.logo_url = await upload(`${prefix}/logo.${ext(files.logo)}`, files.logo);
      if (files.cover) out.cover_url = await upload(`${prefix}/cover.${ext(files.cover)}`, files.cover);
      if (files.photos && files.photos.length) {
        out.new_photos = [];
        for (let i = 0; i < files.photos.length; i++) out.new_photos.push(await upload(`${prefix}/photo-${i + 1}.${ext(files.photos[i])}`, files.photos[i]));
      }
      if (files.menu) out.menu_url = await upload(`${prefix}/menu.${ext(files.menu)}`, files.menu);
      return out;
    }
    const q = async p => { const { data, error } = await p; if (error) fail(error); return data; };

    return {
      mode: "live",
      onAuthChange(cb) { sb.auth.onAuthStateChange((event, session) => cb(event, session)); },

      // ----- auth -----
      async signUpCustomer({ full_name, email, mobile, password }) {
        const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: `${SITE}/auth-callback.html`, data: { account_type: "customer", full_name, mobile } } });
        if (error) fail(error);
        return { needsVerification: !data.session };
      },
      async signUpOwner(owner, restaurant, files) {
        const draft = uuid();
        const up = await uploadRestaurantFiles(`pending/${draft}`, files);
        const r = { ...pick(restaurant, RESTAURANT_FIELDS), logo_url: up.logo_url, cover_url: up.cover_url, photos: up.new_photos || [] };
        const { data, error } = await sb.auth.signUp({
          email: owner.email, password: owner.password,
          options: { emailRedirectTo: `${SITE}/auth-callback.html`, data: { account_type: "owner", full_name: owner.full_name, mobile: owner.mobile, whatsapp: owner.whatsapp, restaurant: r } }
        });
        if (error) fail(error);
        return { needsVerification: !data.session };
      },
      async signIn(email, password) { const { error } = await sb.auth.signInWithPassword({ email, password }); if (error) fail(error); },
      async signInGoogle() {
        const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${SITE}/auth-callback.html` } });
        if (error) fail(error);
      },
      async resendVerification(email) { const { error } = await sb.auth.resend({ type: "signup", email, options: { emailRedirectTo: `${SITE}/auth-callback.html` } }); if (error) fail(error); },
      async sendPasswordReset(email) { const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${SITE}/reset-password.html` }); if (error) fail(error); },
      async setNewPassword(password) { const { error } = await sb.auth.updateUser({ password }); if (error) fail(error); },
      async changePassword(current, next) {
        const { data } = await sb.auth.getSession();
        if (!data.session) fail(T("سجّل الدخول مرة أخرى.", "Please log in again."));
        const check = await sb.auth.signInWithPassword({ email: data.session.user.email, password: current });
        if (check.error) fail(T("كلمة المرور الحالية غير صحيحة.", "Your current password is incorrect."));
        const { error } = await sb.auth.updateUser({ password: next }); if (error) fail(error);
      },
      async changeEmail(email) { const { error } = await sb.auth.updateUser({ email }, { emailRedirectTo: `${SITE}/auth-callback.html` }); if (error) fail(error); return { needsConfirmation: true }; },
      async signOut(everywhere) { await sb.auth.signOut({ scope: everywhere ? "global" : "local" }); },
      async session() { const { data } = await sb.auth.getSession(); return data.session; },
      async me() {
        const { data } = await sb.auth.getSession();
        if (!data.session) return null;
        const u = data.session.user;
        const prof = await q(sb.from("user_profiles").select("*").eq("id", u.id).maybeSingle());
        if (!prof) return null;
        const providers = (u.app_metadata && u.app_metadata.providers) || [u.app_metadata && u.app_metadata.provider].filter(Boolean);
        return { ...prof, email: u.email, pending_email: u.new_email || null, providers, has_password: providers.includes("email") };
      },
      async updateMe(fields) { const id = await uid(); await q(sb.from("user_profiles").update(pick(fields, ["full_name", "mobile", "whatsapp"])).eq("id", id)); },
      async requestDeletion(reason) { const id = await uid(); await q(sb.from("user_profiles").update({ deletion_requested_at: new Date().toISOString(), deletion_reason: reason || null }).eq("id", id)); },
      async cancelDeletion() { const id = await uid(); await q(sb.from("user_profiles").update({ deletion_requested_at: null, deletion_reason: null }).eq("id", id)); },

      // ----- restaurants -----
      async myRestaurants() { const id = await uid(); return q(sb.from("restaurants").select("*").eq("owner_id", id).order("created_at")); },
      async addBranch(restaurant, files) {
        const id = uuid(), me = await uid();
        const up = await uploadRestaurantFiles(`owners/${me}/${id}`, files);
        await q(sb.from("restaurants").insert({ id, owner_id: me, ...pick(restaurant, RESTAURANT_FIELDS), logo_url: up.logo_url, cover_url: up.cover_url, photos: up.new_photos || [] }));
        return { id };
      },
      async resubmit(id) { await q(sb.from("restaurants").update({ status: "pending" }).eq("id", id).eq("status", "rejected")); },
      async updateRestaurant(id, fields, files, keepPhotos) {
        const me = await uid();
        const up = await uploadRestaurantFiles(`owners/${me}/${id}/${Date.now()}`, files || {});
        const row = { ...pick(fields, RESTAURANT_FIELDS) };
        if (up.logo_url) row.logo_url = up.logo_url;
        if (up.cover_url) row.cover_url = up.cover_url;
        if (up.menu_url) row.menu_url = up.menu_url;
        if (keepPhotos) row.photos = keepPhotos.concat(up.new_photos || []);
        await q(sb.from("restaurants").update(row).eq("id", id));
      },
      async restaurantBySlug(slug) { return q(sb.from("restaurants").select("*").eq("slug", slug).eq("published", true).maybeSingle()); },
      async liveRestaurants() {
        const rows = await q(sb.from("restaurants").select("id,slug,name,name_ar,category,cuisine,governorate,city,area,logo_url,cover_url,plan,price_range").eq("status", "approved").eq("published", true));
        const rank = { featured: 0, premium: 1, standard: 2, free: 3 };
        return rows.sort((a, b) => rank[a.plan] - rank[b.plan] || a.name.localeCompare(b.name));
      },
      async reviewsFor(rid) { return q(sb.from("reviews").select("*").eq("restaurant_id", rid).order("created_at", { ascending: false })); },

      // ----- customer -----
      async favourites() { const id = await uid(); return (await q(sb.from("favourites").select("created_at, restaurant:restaurants(*)").eq("user_id", id).order("created_at", { ascending: false }))).filter(f => f.restaurant); },
      async isFavourite(rid) { const id = await uid(); if (!id) return false; return !!(await q(sb.from("favourites").select("restaurant_id").eq("user_id", id).eq("restaurant_id", rid).maybeSingle())); },
      async setFavourite(rid, on) {
        const id = await uid();
        if (on) await q(sb.from("favourites").upsert({ user_id: id, restaurant_id: rid }));
        else await q(sb.from("favourites").delete().eq("user_id", id).eq("restaurant_id", rid));
      },
      async recordView(rid) { const id = await uid(); if (id) await sb.from("recently_viewed").upsert({ user_id: id, restaurant_id: rid, viewed_at: new Date().toISOString() }); },
      async recentlyViewed() { const id = await uid(); return (await q(sb.from("recently_viewed").select("viewed_at, restaurant:restaurants(*)").eq("user_id", id).order("viewed_at", { ascending: false }).limit(24))).filter(v => v.restaurant); },
      async clearHistory() { const id = await uid(); await q(sb.from("recently_viewed").delete().eq("user_id", id)); },
      async myReviews() { const id = await uid(); return q(sb.from("reviews").select("*, restaurant:restaurants(name,slug,logo_url)").eq("user_id", id).order("created_at", { ascending: false })); },
      async saveReview(rid, rating, body) { const id = await uid(); await q(sb.from("reviews").upsert({ user_id: id, restaurant_id: rid, rating, body }, { onConflict: "user_id,restaurant_id" })); },
      async deleteReview(reviewId) { await q(sb.from("reviews").delete().eq("id", reviewId)); },

      // ----- admin (every call is also enforced by RLS) -----
      admin: {
        async restaurants() { return q(sb.from("restaurants").select("*, owner:user_profiles(full_name,email,mobile,whatsapp)").order("created_at", { ascending: false })); },
        async decide(id, status, note) { await q(sb.from("restaurants").update({ status, admin_note: note || null }).eq("id", id)); },
        async setPublished(id, published) { await q(sb.from("restaurants").update({ published }).eq("id", id)); },
        async users() { return q(sb.from("user_profiles").select("*").order("created_at", { ascending: false })); },
        async clearDeletion(userId) { await q(sb.from("user_profiles").update({ deletion_requested_at: null, deletion_reason: null }).eq("id", userId)); },
        async deleteUser(userId) { const { data, error } = await sb.functions.invoke("admin-delete-user", { body: { user_id: userId } }); if (error || (data && data.error)) fail((data && data.error) || error.message); },
        async reviews() { return q(sb.from("reviews").select("*, restaurant:restaurants(name,slug)").order("created_at", { ascending: false })); },
        async deleteReview(id) { await q(sb.from("reviews").delete().eq("id", id)); }
      }
    };
  }

  // =====================================================================
  // DEMO (localStorage). Mirrors the database rules so the flows behave the same.
  // =====================================================================
  function demoApi() {
    const KEY = "dine-oman-demo-v2";
    const ADMIN = { email: "admin@dineoman.demo", password: "DineAdmin2026" };
    const now = () => new Date().toISOString();
    const empty = () => ({ users: [], restaurants: [], favourites: [], views: [], reviews: [], mail: [], tokens: [], session: null });
    function load() { try { return JSON.parse(localStorage.getItem(KEY)) || empty(); } catch (e) { return empty(); } }
    function save(db) { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { fail(T("مساحة العرض التجريبي ممتلئة. أعد ضبط العرض أو استخدم صورًا أصغر.", "Demo storage is full. Reset the demo or use smaller images.")); } }
    async function hash(pw) {
      const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("dine-demo:" + pw));
      return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
    }
    async function ensureSeed() {
      const db = load();
      if (!db.users.some(u => u.role === "admin")) {
        db.users.push({ id: uuid(), email: ADMIN.email, pw: await hash(ADMIN.password), role: "admin", full_name: "Dine Oman Admin", mobile: null, whatsapp: null, email_confirmed: true, providers: ["email"], sessions: [], created_at: now() });
        save(db);
      }
    }
    const ready = ensureSeed();
    function shrink(file, max, type) {
      return new Promise((resolve, reject) => {
        if (file.type === "application/pdf") { const fr = new FileReader(); fr.onload = () => resolve(file.size < 400000 ? fr.result : "#demo-menu-pdf"); fr.readAsDataURL(file); return; }
        const img = new Image(), url = URL.createObjectURL(file);
        img.onload = () => { const s = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement("canvas"); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); resolve(c.toDataURL(type || "image/jpeg", .8)); };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read that image.")); };
        img.src = url;
      });
    }
    async function storeFiles(files) {
      const out = {};
      if (files.logo) out.logo_url = await shrink(files.logo, 300, "image/png");
      if (files.cover) out.cover_url = await shrink(files.cover, 1000);
      if (files.photos && files.photos.length) { out.new_photos = []; for (const f of files.photos) out.new_photos.push(await shrink(f, 640)); }
      if (files.menu) out.menu_url = await shrink(files.menu, 1200);
      return out;
    }
    function mail(db, to, subject, body, link, linkLabel) { db.mail.unshift({ id: uuid(), to: [].concat(to), subject, body, link, linkLabel, at: now(), read: false }); }
    function token(db, type, user_id, extra) { const t = uuid().replace(/-/g, ""); db.tokens.push({ t, type, user_id, extra: extra || null, at: Date.now() }); return t; }
    function current(db) {
      if (!db.session) return null;
      const u = db.users.find(x => x.id === db.session.user_id);
      if (!u || !(u.sessions || []).includes(db.session.sid)) { db.session = null; return null; }
      return u;
    }
    function requireUser(db, roles) { const u = current(db); if (!u) fail(T("سجّل الدخول مرة أخرى.", "Please log in again.")); if (roles && !roles.includes(u.role)) fail(T("ليس لديك صلاحية لهذا الإجراء.", "You don't have permission to do that.")); return u; }
    function startSession(db, u) { const sid = uuid(); u.sessions = (u.sessions || []).concat(sid).slice(-10); db.session = { user_id: u.id, sid }; }
    const adminsOf = db => db.users.filter(u => u.role === "admin").map(u => u.email);
    const PLAN = id => { const p = cfg.PLANS.find(x => x.id === id) || { name: id, ar: id }; return T(p.ar, p.name); };
    function notifyPending(db, r) {
      const o = db.users.find(u => u.id === r.owner_id);
      mail(db, o.email, T(`استلمنا طلبك · ${r.reference}`, `Application received · ${r.reference}`), T(`شكرًا لتسجيل ${r.name}. طلبك الآن قيد المراجعة.`, `Thank you for registering ${r.name}. Your application is now pending approval.`), `owner.html#r-${r.id}`, T("عرض حالة الطلب", "View application status"));
      mail(db, adminsOf(db), T(`طلب مطعم جديد: ${r.name}`, `New restaurant application: ${r.name}`), `${r.name} · ${r.area}, ${r.city} · ${o.full_name} (${o.email}) · ${PLAN(r.plan)}`, "admin.html#applications", T("مراجعة الطلب", "Review application"));
    }
    function newRestaurant(db, owner_id, r, files, status) {
      const row = { id: uuid(), owner_id, reference: "DO-" + uuid().replace(/-/g, "").slice(0, 6).toUpperCase(), status, slug: null, published: false,
        ...pick(r, RESTAURANT_FIELDS), plan: r.plan || "free", logo_url: files.logo_url, cover_url: files.cover_url, photos: files.new_photos || [],
        hours: r.hours || {}, features: r.features || [], admin_note: null, submitted_at: status === "pending" ? now() : null, reviewed_at: null, approved_at: null, created_at: now(), updated_at: now() };
      db.restaurants.push(row);
      return row;
    }
    function approve(db, r) {
      r.approved_at = r.approved_at || now(); r.published = true;
      if (!r.slug) {
        const base = slugify(r.name) || "restaurant"; let c = base, n = 1;
        const taken = s => db.restaurants.some(x => x.slug === s && x.id !== r.id);
        if (taken(c)) c = base + "-" + slugify(r.area);
        while (taken(c)) { n++; c = base + "-" + n; }
        r.slug = c;
      }
    }
    const withR = (db, rows, key) => rows.map(x => ({ ...x, restaurant: db.restaurants.find(r => r.id === x.restaurant_id && (r.published || false)) || null })).filter(x => x.restaurant);
    const listeners = [];

    return {
      mode: "demo",
      demoAdmin: ADMIN,
      onAuthChange(cb) { listeners.push(cb); },

      async signUpCustomer({ full_name, email, mobile, password }) {
        await ready; const db = load(); email = email.toLowerCase();
        if (db.users.some(u => u.email === email)) fail("already registered");
        const u = { id: uuid(), email, pw: await hash(password), role: "customer", full_name, mobile, whatsapp: null, email_confirmed: false, providers: ["email"], sessions: [], created_at: now() };
        db.users.push(u);
        mail(db, email, T("أكّد حسابك في داين عُمان", "Confirm your Dine Oman account"), T(`مرحبًا ${full_name.split(" ")[0]}، أكّد بريدك الإلكتروني لإكمال إنشاء حسابك.`, `Hello ${full_name.split(" ")[0]}, confirm your email to finish creating your account.`), `auth-callback.html?demo=verify&t=${token(db, "verify", u.id)}`, T("تأكيد البريد", "Confirm my email"));
        save(db); return { needsVerification: true };
      },
      async signUpOwner(owner, restaurant, files) {
        await ready; const db0 = load(); const email = owner.email.toLowerCase();
        if (db0.users.some(u => u.email === email)) fail("already registered");
        const stored = await storeFiles(files);
        const db = load();
        const u = { id: uuid(), email, pw: await hash(owner.password), role: "owner", full_name: owner.full_name, mobile: owner.mobile, whatsapp: owner.whatsapp, email_confirmed: false, providers: ["email"], sessions: [], created_at: now() };
        db.users.push(u);
        newRestaurant(db, u.id, restaurant, stored, "awaiting_verification");
        mail(db, email, T("أكّد بريدك لإرسال طلب مطعمك", "Confirm your email to submit your restaurant"), T(`مرحبًا ${owner.full_name.split(" ")[0]}، بعد تأكيد بريدك يُرسل طلب ${restaurant.name} لفريقنا للمراجعة.`, `Hello ${owner.full_name.split(" ")[0]}, confirm your email and your application for ${restaurant.name} goes to our team.`), `auth-callback.html?demo=verify&t=${token(db, "verify", u.id)}`, T("تأكيد البريد", "Confirm my email"));
        save(db); return { needsVerification: true };
      },
      async demoConsumeToken(t) {
        const db = load(); const tok = db.tokens.find(x => x.t === t);
        if (!tok) fail(T("انتهت صلاحية الرابط أو تم استخدامه.", "This link has expired or was already used."));
        const u = db.users.find(x => x.id === tok.user_id); if (!u) fail(T("الحساب غير موجود.", "Account not found."));
        db.tokens = db.tokens.filter(x => x !== tok);
        if (tok.type === "verify") {
          if (!u.email_confirmed) {
            u.email_confirmed = true;
            db.restaurants.filter(r => r.owner_id === u.id && r.status === "awaiting_verification").forEach(r => { r.status = "pending"; r.submitted_at = now(); notifyPending(db, r); });
          }
          startSession(db, u);
        } else if (tok.type === "recovery") { startSession(db, u); db.session.recovery = true; }
        else if (tok.type === "email_change") { if (db.users.some(x => x.email === tok.extra && x.id !== u.id)) fail("already registered"); u.email = tok.extra; u.pending_email = null; startSession(db, u); }
        save(db); return tok.type;
      },
      async signIn(email, password) {
        await ready; const db = load(); const u = db.users.find(x => x.email === email.toLowerCase());
        if (!u || !u.pw || u.pw !== await hash(password)) fail("Invalid login credentials");
        if (!u.email_confirmed) fail("Email not confirmed");
        startSession(db, u); save(db); listeners.forEach(cb => cb("SIGNED_IN"));
      },
      async signInGoogle() { fail(T("الدخول عبر Google يعمل بعد الإطلاق الفعلي. في العرض التجريبي استخدم البريد الإلكتروني.", "Google sign-in works once the site is live. In the demo, use email.")); },
      async resendVerification(email) {
        const db = load(); const u = db.users.find(x => x.email === email.toLowerCase());
        if (u && !u.email_confirmed) { mail(db, u.email, T("أكّد حسابك في داين عُمان", "Confirm your Dine Oman account"), T("هذا رابط تأكيد جديد.", "Here's a new confirmation link."), `auth-callback.html?demo=verify&t=${token(db, "verify", u.id)}`, T("تأكيد البريد", "Confirm my email")); save(db); }
      },
      async sendPasswordReset(email) {
        await ready; const db = load(); const u = db.users.find(x => x.email === email.toLowerCase());
        if (u) { mail(db, u.email, T("إعادة تعيين كلمة المرور", "Reset your Dine Oman password"), T("طلب أحدهم إعادة تعيين كلمة المرور. إن كنت أنت فاستخدم الرابط، وإلا فتجاهل الرسالة.", "Someone asked to reset your password. If it was you, use the link below. If not, ignore this email."), `auth-callback.html?demo=recovery&t=${token(db, "recovery", u.id)}`, T("تعيين كلمة مرور جديدة", "Reset password")); save(db); }
      },
      async setNewPassword(password) { const db = load(); const u = requireUser(db); u.pw = await hash(password); if (!u.providers.includes("email")) u.providers.push("email"); db.session.recovery = false; save(db); },
      async changePassword(cur, next) { const db = load(); const u = requireUser(db); if (u.pw !== await hash(cur)) fail(T("كلمة المرور الحالية غير صحيحة.", "Your current password is incorrect.")); u.pw = await hash(next); save(db); },
      async changeEmail(email) {
        const db = load(); const u = requireUser(db); email = email.toLowerCase();
        if (db.users.some(x => x.email === email)) fail("already registered");
        u.pending_email = email;
        mail(db, email, T("أكّد بريدك الإلكتروني الجديد", "Confirm your new email address"), T(`أكّد ${email} كبريد جديد لحسابك.`, `Confirm ${email} as the new email for your account.`), `auth-callback.html?demo=email&t=${token(db, "email_change", u.id, email)}`, T("تأكيد البريد الجديد", "Confirm new email"));
        save(db); return { needsConfirmation: true };
      },
      async signOut(everywhere) {
        const db = load(); const u = current(db);
        if (u) u.sessions = everywhere ? [] : (u.sessions || []).filter(s => s !== db.session.sid);
        db.session = null; save(db); listeners.forEach(cb => cb("SIGNED_OUT"));
      },
      async session() { await ready; const db = load(); return current(db) ? { user: { id: db.session.user_id }, recovery: !!db.session.recovery } : null; },
      async me() {
        await ready; const db = load(); const u = current(db); if (!u) return null;
        const { pw, sessions, ...rest } = u; return { ...rest, has_password: !!pw, session_count: (sessions || []).length };
      },
      async updateMe(f) { const db = load(); const u = requireUser(db); Object.assign(u, pick(f, ["full_name", "mobile", "whatsapp"])); save(db); },
      async requestDeletion(reason) { const db = load(); const u = requireUser(db); u.deletion_requested_at = now(); u.deletion_reason = reason || null; mail(db, adminsOf(db), T("طلب حذف حساب", "Account deletion request"), `${u.full_name || u.email} (${u.role})${reason ? " · " + reason : ""}`, "admin.html#users", T("المستخدمون", "Open users")); save(db); },
      async cancelDeletion() { const db = load(); const u = requireUser(db); u.deletion_requested_at = null; u.deletion_reason = null; save(db); },

      async myRestaurants() { const db = load(); const u = requireUser(db, ["owner", "admin"]); return db.restaurants.filter(r => r.owner_id === u.id); },
      async addBranch(r, files) { const stored = await storeFiles(files); const db = load(); const u = requireUser(db, ["owner"]); const row = newRestaurant(db, u.id, r, stored, "pending"); notifyPending(db, row); save(db); return { id: row.id }; },
      async resubmit(id) { const db = load(); const u = requireUser(db, ["owner"]); const r = db.restaurants.find(x => x.id === id && x.owner_id === u.id && x.status === "rejected"); if (!r) fail(T("يمكن إعادة إرسال الطلب المرفوض فقط.", "Only a rejected application can be resubmitted.")); r.status = "pending"; r.submitted_at = now(); notifyPending(db, r); save(db); },
      async updateRestaurant(id, fields, files, keepPhotos) {
        const stored = await storeFiles(files || {});
        const db = load(); const u = requireUser(db, ["owner", "admin"]);
        const r = db.restaurants.find(x => x.id === id && (x.owner_id === u.id || u.role === "admin")); if (!r) fail(T("المطعم غير موجود.", "Restaurant not found."));
        const f = pick(fields, RESTAURANT_FIELDS);
        if (!["awaiting_verification", "pending", "rejected"].includes(r.status) && u.role !== "admin") delete f.plan;
        Object.assign(r, f, stored.logo_url ? { logo_url: stored.logo_url } : {}, stored.cover_url ? { cover_url: stored.cover_url } : {}, stored.menu_url ? { menu_url: stored.menu_url } : {});
        if (keepPhotos) r.photos = keepPhotos.concat(stored.new_photos || []);
        r.updated_at = now(); save(db);
      },
      async restaurantBySlug(slug) { const db = load(); return db.restaurants.find(r => r.slug === slug && r.published) || null; },
      async liveRestaurants() { const rank = { featured: 0, premium: 1, standard: 2, free: 3 }; return load().restaurants.filter(r => r.published).sort((a, b) => rank[a.plan] - rank[b.plan] || a.name.localeCompare(b.name)); },
      async reviewsFor(rid) { return load().reviews.filter(r => r.restaurant_id === rid).sort((a, b) => b.created_at.localeCompare(a.created_at)); },

      async favourites() { const db = load(); const u = requireUser(db); return withR(db, db.favourites.filter(f => f.user_id === u.id)).reverse(); },
      async isFavourite(rid) { const db = load(); const u = current(db); return !!u && db.favourites.some(f => f.user_id === u.id && f.restaurant_id === rid); },
      async setFavourite(rid, on) { const db = load(); const u = requireUser(db); db.favourites = db.favourites.filter(f => !(f.user_id === u.id && f.restaurant_id === rid)); if (on) db.favourites.push({ user_id: u.id, restaurant_id: rid, created_at: now() }); save(db); },
      async recordView(rid) { const db = load(); const u = current(db); if (!u) return; db.views = db.views.filter(v => !(v.user_id === u.id && v.restaurant_id === rid)); db.views.push({ user_id: u.id, restaurant_id: rid, viewed_at: now() }); save(db); },
      async recentlyViewed() { const db = load(); const u = requireUser(db); return withR(db, db.views.filter(v => v.user_id === u.id)).sort((a, b) => b.viewed_at.localeCompare(a.viewed_at)).slice(0, 24); },
      async clearHistory() { const db = load(); const u = requireUser(db); db.views = db.views.filter(v => v.user_id !== u.id); save(db); },
      async myReviews() { const db = load(); const u = requireUser(db); return db.reviews.filter(r => r.user_id === u.id).map(r => ({ ...r, restaurant: db.restaurants.find(x => x.id === r.restaurant_id) })); },
      async saveReview(rid, rating, body) {
        const db = load(); const u = requireUser(db, ["customer"]);
        const n = (u.full_name || "Guest").split(" "); const author_name = n[0] + (n[1] ? " " + n[1][0] + "." : "");
        const ex = db.reviews.find(r => r.user_id === u.id && r.restaurant_id === rid);
        if (ex) Object.assign(ex, { rating, body, author_name, updated_at: now() });
        else db.reviews.push({ id: uuid(), user_id: u.id, restaurant_id: rid, rating, body, author_name, created_at: now(), updated_at: now() });
        save(db);
      },
      async deleteReview(id) { const db = load(); const u = requireUser(db); db.reviews = db.reviews.filter(r => !(r.id === id && (r.user_id === u.id || u.role === "admin"))); save(db); },

      admin: {
        async restaurants() { const db = load(); requireUser(db, ["admin"]); return db.restaurants.map(r => ({ ...r, owner: (({ full_name, email, mobile, whatsapp }) => ({ full_name, email, mobile, whatsapp }))(db.users.find(u => u.id === r.owner_id) || {}) })).sort((a, b) => b.created_at.localeCompare(a.created_at)); },
        async decide(id, status, note) {
          const db = load(); requireUser(db, ["admin"]); const r = db.restaurants.find(x => x.id === id);
          r.status = status; r.admin_note = note || null; r.reviewed_at = now();
          if (status === "approved") approve(db, r); else r.published = false;
          const o = db.users.find(u => u.id === r.owner_id);
          if (status === "approved") mail(db, o.email, T(`تمت الموافقة على ${r.name}`, `${r.name} is approved and live`), T(`صفحة مطعمك منشورة الآن: /restaurant/${r.slug}`, `Your public page is live: /restaurant/${r.slug}`) + (note ? " · " + note : ""), `restaurant.html?slug=${r.slug}`, T("عرض الصفحة", "View public page"));
          else mail(db, o.email, T("تحديث على طلبك", "Update on your Dine Oman application"), T(`لم نتمكن من الموافقة على ${r.name} بعد.`, `We couldn't approve ${r.name} yet.`) + (note ? " · " + note : ""), `owner.html#r-${r.id}`, T("عرض الطلب", "View application"));
          save(db);
        },
        async setPublished(id, p) { const db = load(); requireUser(db, ["admin"]); const r = db.restaurants.find(x => x.id === id); if (r.status === "approved") r.published = p; save(db); },
        async users() { const db = load(); requireUser(db, ["admin"]); return db.users.map(({ pw, sessions, ...u }) => u).sort((a, b) => b.created_at.localeCompare(a.created_at)); },
        async clearDeletion(id) { const db = load(); requireUser(db, ["admin"]); const u = db.users.find(x => x.id === id); u.deletion_requested_at = null; u.deletion_reason = null; save(db); },
        async deleteUser(id) {
          const db = load(); requireUser(db, ["admin"]); const u = db.users.find(x => x.id === id);
          if (!u) fail(T("المستخدم غير موجود.", "User not found.")); if (u.role === "admin") fail(T("لا يمكن حذف حساب مدير من هنا.", "Admin accounts can't be deleted here."));
          const rids = db.restaurants.filter(r => r.owner_id === id).map(r => r.id);
          db.users = db.users.filter(x => x.id !== id);
          db.restaurants = db.restaurants.filter(r => r.owner_id !== id);
          db.favourites = db.favourites.filter(f => f.user_id !== id && !rids.includes(f.restaurant_id));
          db.views = db.views.filter(v => v.user_id !== id && !rids.includes(v.restaurant_id));
          db.reviews = db.reviews.filter(r => r.user_id !== id && !rids.includes(r.restaurant_id));
          save(db);
        },
        async reviews() { const db = load(); requireUser(db, ["admin"]); return db.reviews.map(r => ({ ...r, restaurant: db.restaurants.find(x => x.id === r.restaurant_id) })).sort((a, b) => b.created_at.localeCompare(a.created_at)); },
        async deleteReview(id) { const db = load(); requireUser(db, ["admin"]); db.reviews = db.reviews.filter(r => r.id !== id); save(db); }
      },

      // Demo inbox
      inbox() { return load().mail; },
      markRead() { const db = load(); db.mail.forEach(m => m.read = true); save(db); },
      unread() { return load().mail.filter(m => !m.read).length; },
      reset() { try { localStorage.removeItem(KEY); } catch (e) {} }
    };
  }

  window.DineAPI = live ? liveApi() : demoApi();
})();
