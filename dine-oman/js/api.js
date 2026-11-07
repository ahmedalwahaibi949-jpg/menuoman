// Dine Oman backend adapter.
// Live mode: Supabase (database, storage, email sign-in). Demo mode: this browser's localStorage.
(function () {
  const cfg = window.DINE_CONFIG || {};
  const live = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && window.supabase);
  const BUCKET = "restaurant-media";

  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15);
      return (c === "x" ? r : (r & 3) | 8).toString(16);
    });
  }
  function referenceFor(id) { return "DO-" + id.replace(/-/g, "").slice(0, 6).toUpperCase(); }
  function ext(file) {
    const m = /\.([a-z0-9]+)$/i.exec(file.name || "");
    return (m ? m[1] : (file.type.split("/")[1] || "bin")).toLowerCase();
  }

  // ---------- LIVE (Supabase) ----------
  const sb = live ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

  async function upload(path, file) {
    const { error } = await sb.storage.from(BUCKET).upload(path, file, { upsert: false, contentType: file.type, cacheControl: "31536000" });
    if (error) throw new Error("Upload failed: " + error.message);
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  const liveApi = {
    mode: "live",
    async submitApplication(fields, files) {
      const id = uuid();
      const reference = referenceFor(id);
      const logo_url = await upload(`applications/${id}/logo.${ext(files.logo)}`, files.logo);
      const cover_url = await upload(`applications/${id}/cover.${ext(files.cover)}`, files.cover);
      // No .select(): anonymous applicants may insert but not read applications back.
      const { error } = await sb.from("applications").insert({ id, reference, ...fields, logo_url, cover_url });
      if (error) throw new Error(error.message);
      return { id, reference };
    },
    async signIn(email, nextPage) {
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${cfg.SITE_URL}/${nextPage || "account.html"}`, shouldCreateUser: true }
      });
      if (error) throw new Error(error.message);
      return { sent: true };
    },
    async getSession() {
      const { data } = await sb.auth.getSession();
      return data.session ? { email: data.session.user.email } : null;
    },
    async signOut() { await sb.auth.signOut(); },
    async isAdmin() {
      const { data, error } = await sb.rpc("is_admin");
      return !error && data === true;
    },
    async getMyApplications() {
      // RLS returns only applications whose email matches the signed-in user.
      const { data, error } = await sb.from("applications").select("*, profile:profiles(*)").order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data.map(a => ({ ...a, profile: Array.isArray(a.profile) ? a.profile[0] || null : a.profile }));
    },
    async listApplications() {
      const { data, error } = await sb.from("applications").select("*, profile:profiles(published, updated_at)").order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data.map(a => ({ ...a, profile: Array.isArray(a.profile) ? a.profile[0] || null : a.profile }));
    },
    async decide(id, status, note) {
      const { error } = await sb.from("applications").update({ status, admin_note: note || null, reviewed_at: new Date().toISOString() }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    async saveProfile(appId, profile, files) {
      const gallery = [...(profile.gallery || [])];
      for (const f of files.gallery || []) gallery.push(await upload(`profiles/${appId}/gallery-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext(f)}`, f));
      let menu_url = profile.menu_url || null;
      if (files.menu) menu_url = await upload(`profiles/${appId}/menu-${Date.now()}.${ext(files.menu)}`, files.menu);
      const row = { ...profile, gallery, menu_url, application_id: appId, published: true, updated_at: new Date().toISOString() };
      const { error } = await sb.from("profiles").upsert(row);
      if (error) throw new Error(error.message);
      return row;
    }
  };

  // ---------- DEMO (localStorage) ----------
  const KEY = "dine-oman-demo-v1";
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || { applications: [], profiles: {}, session: null }; }
    catch (e) { return { applications: [], profiles: {}, session: null }; }
  }
  function save(db) {
    try { localStorage.setItem(KEY, JSON.stringify(db)); }
    catch (e) { throw new Error("This browser's demo storage is full. Clear demo data and try smaller images."); }
  }
  // Shrinks an image so demo data fits in browser storage.
  function shrink(file, max, type) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL(type || "image/jpeg", 0.82));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read that image.")); };
      img.src = url;
    });
  }
  const demoApi = {
    mode: "demo",
    async submitApplication(fields, files) {
      const id = uuid();
      const reference = referenceFor(id);
      const logo_url = await shrink(files.logo, 320, "image/png");
      const cover_url = await shrink(files.cover, 900);
      const db = load();
      db.applications.unshift({ id, reference, ...fields, logo_url, cover_url, status: "pending", admin_note: null, created_at: new Date().toISOString(), reviewed_at: null });
      save(db);
      return { id, reference };
    },
    async signIn(email) { const db = load(); db.session = { email: email.toLowerCase() }; save(db); return { sent: false }; },
    async getSession() { return load().session; },
    async signOut() { const db = load(); db.session = null; save(db); },
    async isAdmin() { return true; },
    async getMyApplications() {
      const db = load();
      if (!db.session) return [];
      return db.applications.filter(a => a.email.toLowerCase() === db.session.email).map(a => ({ ...a, profile: db.profiles[a.id] || null }));
    },
    async listApplications() { const db = load(); return db.applications.map(a => ({ ...a, profile: db.profiles[a.id] || null })); },
    async decide(id, status, note) {
      const db = load();
      const a = db.applications.find(x => x.id === id);
      if (!a) throw new Error("Application not found.");
      Object.assign(a, { status, admin_note: note || null, reviewed_at: new Date().toISOString() });
      save(db);
    },
    async saveProfile(appId, profile, files) {
      const gallery = [...(profile.gallery || [])];
      for (const f of files.gallery || []) gallery.push(await shrink(f, 700));
      const row = { ...profile, gallery, menu_url: files.menu ? "(menu file uploaded: " + files.menu.name + ")" : (profile.menu_url || null), application_id: appId, published: true, updated_at: new Date().toISOString() };
      const db = load(); db.profiles[appId] = row; save(db);
      return row;
    },
    clear() { try { localStorage.removeItem(KEY); } catch (e) {} }
  };

  window.DineAPI = live ? liveApi : demoApi;
})();
