// Data layer. LIVE: Supabase (auth + Postgres with row-level security, see supabase/schema.sql).
// DEMO: the same API backed by localStorage, so the whole site can be tried before Supabase is connected.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { DEFAULTS, type Content } from "./content";
import type { Menu, Settings } from "../boards/boards";

export type Role = "customer" | "admin";
export type User = { id: string; email: string; full_name: string; company: string; phone: string; role: Role; created_at: string };
export type Enquiry = { id: string; full_name: string; company: string; email: string; phone: string; service: string; budget: string; description: string; status: "new" | "contacted" | "won" | "closed"; created_at: string };
export type ProjectRec = { id: string; customer_id: string; title: string; service: string; status: "planning" | "design" | "development" | "review" | "live"; progress: number; summary: string; updates: { at: string; text: string }[]; created_at: string };
export type RequestRec = { id: string; customer_id: string; project_id: string | null; subject: string; body: string; status: "open" | "in_progress" | "done"; created_at: string };
export type Invoice = { id: string; customer_id: string; project_id: string | null; number: string; amount: number; status: "due" | "paid"; due_date: string; created_at: string };
export type Message = { id: string; customer_id: string; body: string; from_admin: boolean; created_at: string };
export type BoardData = { menu: Menu; settings: Settings };
/** A restaurant's menu: one record feeds the TV screens, the promo slides and the QR menu. */
export type BoardRec = { id: string; owner_id: string; restaurant: string; draft: BoardData; published: BoardData | null; published_at: string | null; status: "trial" | "active" | "paused"; paid_until: string | null; created_at: string };
export type Payment = { id: string; board_id: string; owner_id: string; months: number; amount: number; receipt: string; status: "pending" | "approved" | "rejected"; created_at: string };
export const TRIAL_DAYS = 14;
/** Whether a restaurant's screens and QR menu are shown. The database applies the same rule in board_live(). */
export function boardAccess(b: Pick<BoardRec, "status" | "paid_until" | "created_at">, at = Date.now()): { live: boolean; kind: "paid" | "trial" | "expired" | "paused"; until: string | null } {
  if (b.status === "paused") return { live: false, kind: "paused", until: null };
  if (b.paid_until && Date.parse(b.paid_until) > at) return { live: true, kind: "paid", until: b.paid_until };
  if (b.status === "active" && !b.paid_until) return { live: true, kind: "paid", until: null };
  const trialEnd = Date.parse(b.created_at) + TRIAL_DAYS * 86400000;
  if (trialEnd > at) return { live: true, kind: "trial", until: new Date(trialEnd).toISOString() };
  return { live: false, kind: "expired", until: null };
}
export type Tables = { enquiries: Enquiry; projects: ProjectRec; requests: RequestRec; invoices: Invoice; messages: Message; profiles: User; boards: BoardRec };
export type TableName = keyof Tables;

const URL_ = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY_ = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const LIVE = Boolean(URL_ && KEY_);
export const DEMO_ADMIN = { email: "admin@fikra.demo", password: "FikraAdmin2026" };

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
const now = () => new Date().toISOString();
const listeners = new Set<() => void>();
export const onAuthChange = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
const emit = () => listeners.forEach(f => f());

export function friendly(e: unknown): string {
  const m = e instanceof Error ? e.message : String(e);
  if (/Invalid login credentials/i.test(m)) return "auth.invalid";
  if (/already registered|already exists/i.test(m)) return "auth.exists";
  if (/Email not confirmed/i.test(m)) return "auth.unconfirmed";
  if (/permission|row-level|not allowed|denied/i.test(m)) return "auth.denied";
  return m;
}

// ---------------------------------------------------------------- LIVE
let sb: SupabaseClient | null = null;
if (LIVE) {
  sb = createClient(URL_!, KEY_!);
  sb.auth.onAuthStateChange(() => emit());
}

// ---------------------------------------------------------------- DEMO
type DemoUser = User & { pw: string };
type DemoDb = { users: DemoUser[]; session: string | null; content: Partial<Content>; views: { path: string; at: string }[] } & { [K in Exclude<TableName, "profiles">]: Tables[K][] } & { payments: Payment[] };
const DKEY = "fikra-demo-v1";
const empty = (): DemoDb => ({ users: [], session: null, content: {}, views: [], enquiries: [], projects: [], requests: [], invoices: [], messages: [], boards: [], payments: [] });
function load(): DemoDb { try { return { ...empty(), ...(JSON.parse(localStorage.getItem(DKEY) || "null") || {}) }; } catch { return empty(); } }
function save(db: DemoDb) { try { localStorage.setItem(DKEY, JSON.stringify(db)); } catch { throw new Error("Demo storage is full."); } }
async function hash(pw: string) {
  if (!crypto.subtle) return "plain:" + pw;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("fikra:" + pw));
  return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, "0")).join("");
}
let seeded: Promise<void> | null = null;
function seed() {
  return (seeded ??= (async () => {
    const db = load();
    if (!db.users.some(u => u.role === "admin")) {
      db.users.push({ id: uid(), email: DEMO_ADMIN.email, pw: await hash(DEMO_ADMIN.password), full_name: "FIKRA Admin", company: "FIKRA DIGITAL", phone: "", role: "admin", created_at: now() });
      save(db);
    }
  })());
}
const pub = ({ pw: _pw, ...u }: DemoUser): User => u;
function demoMe(db = load()): User | null { const u = db.users.find(x => x.id === db.session); return u ? pub(u) : null; }

// Who may do what in demo mode. Mirrors the database policies.
function canRead(t: TableName, me: User | null, row: { customer_id?: string; id?: string; owner_id?: string }) {
  if (me?.role === "admin") return true;
  if (!me) return false;
  if (t === "enquiries") return false;
  if (t === "profiles") return row.id === me.id;
  if (t === "boards") return row.owner_id === me.id;
  return row.customer_id === me.id;
}

function shrinkImage(file: File, max: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); resolve(c.toDataURL("image/jpeg", 0.78)); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read that image.")); };
    img.src = url;
  });
}

// ---------------------------------------------------------------- API
export const api = {
  async me(): Promise<User | null> {
    if (!sb) { await seed(); return demoMe(); }
    const { data } = await sb.auth.getSession();
    if (!data.session) return null;
    const { data: p } = await sb.from("profiles").select("*").eq("id", data.session.user.id).maybeSingle();
    return (p as User) ?? null;
  },
  async signUp(f: { full_name: string; company: string; phone: string; email: string; password: string }): Promise<{ needsVerification: boolean }> {
    const email = f.email.trim().toLowerCase();
    if (!sb) {
      await seed(); const db = load();
      if (db.users.some(u => u.email === email)) throw new Error("already registered");
      const u: DemoUser = { id: uid(), email, pw: await hash(f.password), full_name: f.full_name, company: f.company, phone: f.phone, role: "customer", created_at: now() };
      db.users.push(u); db.session = u.id; save(db); emit();
      return { needsVerification: false };
    }
    const { data, error } = await sb.auth.signUp({ email, password: f.password, options: { data: { full_name: f.full_name, company: f.company, phone: f.phone }, emailRedirectTo: location.origin + location.pathname + "#/portal" } });
    if (error) throw error;
    return { needsVerification: !data.session };
  },
  async signIn(email: string, password: string) {
    if (!sb) {
      await seed(); const db = load();
      const u = db.users.find(x => x.email === email.trim().toLowerCase());
      if (!u || u.pw !== (await hash(password))) throw new Error("Invalid login credentials");
      db.session = u.id; save(db); emit(); return;
    }
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },
  async signOut() {
    if (!sb) { const db = load(); db.session = null; save(db); emit(); return; }
    await sb.auth.signOut();
  },
  async resetPassword(email: string) {
    if (!sb) return; // demo: nothing to send
    await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname + "#/portal" });
  },

  // ----- content (public read, admin write)
  async content(): Promise<Content> {
    let over: Partial<Content> = {};
    if (!sb) over = load().content;
    else {
      const { data } = await sb.from("content").select("key,value");
      (data || []).forEach((r: { key: string; value: unknown }) => { (over as Record<string, unknown>)[r.key] = r.value; });
    }
    return { ...DEFAULTS, ...over };
  },
  async setContent<K extends keyof Content>(key: K, value: Content[K]) {
    if (!sb) { const db = load(); if (demoMe(db)?.role !== "admin") throw new Error("permission denied"); db.content = { ...db.content, [key]: value }; save(db); return; }
    const { error } = await sb.from("content").upsert({ key, value, updated_at: now() });
    if (error) throw error;
  },

  // ----- enquiries (anyone can send one)
  async sendEnquiry(e: Omit<Enquiry, "id" | "status" | "created_at">) {
    const row: Enquiry = { ...e, id: uid(), status: "new", created_at: now() };
    if (!sb) { const db = load(); db.enquiries.unshift(row); save(db); return; }
    const { error } = await sb.from("enquiries").insert({ ...e, id: row.id }); // no select: visitors cannot read enquiries back
    if (error) throw error;
  },

  // ----- generic rows
  async list<T extends TableName>(t: T): Promise<Tables[T][]> {
    if (!sb) {
      const db = load(), me = demoMe(db);
      const rows = (t === "profiles" ? db.users.map(pub) : db[t as Exclude<TableName, "profiles">]) as unknown as Tables[T][];
      return rows.filter(r => canRead(t, me, r as never)).sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
    }
    const { data, error } = await sb.from(t).select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as Tables[T][];
  },
  async insert<T extends Exclude<TableName, "profiles" | "enquiries" | "boards">>(t: T, row: Omit<Tables[T], "id" | "created_at">): Promise<void> {
    if (!sb) {
      const db = load(), me = demoMe(db);
      if (!me) throw new Error("permission denied");
      const r = row as unknown as { customer_id: string; from_admin?: boolean };
      const own = r.customer_id === me.id;
      const ok = me.role === "admin" || (own && (t === "requests" || (t === "messages" && !r.from_admin)));
      if (!ok) throw new Error("permission denied");
      (db[t] as unknown[]).unshift({ ...row, id: uid(), created_at: now() }); save(db); return;
    }
    const { error } = await sb.from(t).insert(row);
    if (error) throw error;
  },
  async update<T extends TableName>(t: T, id: string, patch: Partial<Tables[T]>): Promise<void> {
    if (!sb) {
      const db = load(), me = demoMe(db);
      if (!me) throw new Error("permission denied");
      if (t === "profiles") {
        const u = db.users.find(x => x.id === id); if (!u || (me.role !== "admin" && me.id !== id)) throw new Error("permission denied");
        const { role: _r, id: _i, email: _e, ...safe } = patch as Partial<User>;
        Object.assign(u, me.role === "admin" ? patch : safe);
      } else {
        if (me.role !== "admin") throw new Error("permission denied");
        const r = (db[t as Exclude<TableName, "profiles">] as { id: string }[]).find(x => x.id === id); if (r) Object.assign(r, patch);
      }
      save(db); emit(); return;
    }
    const { error } = await sb.from(t).update(patch).eq("id", id);
    if (error) throw error;
  },
  async remove<T extends Exclude<TableName, "profiles">>(t: T, id: string): Promise<void> {
    if (!sb) {
      const db = load(); if (demoMe(db)?.role !== "admin") throw new Error("permission denied");
      (db[t] as { id: string }[]) = (db[t] as { id: string }[]).filter(x => x.id !== id) as never; save(db); return;
    }
    const { error } = await sb.from(t).delete().eq("id", id);
    if (error) throw error;
  },

  // ----- restaurant menu boards
  async boardMine(): Promise<BoardRec | null> {
    if (!sb) { const db = load(), me = demoMe(db); return me ? db.boards.find(x => x.owner_id === me.id) || null : null; }
    const { data: s } = await sb.auth.getSession(); if (!s.session) return null;
    const { data, error } = await sb.from("boards").select("*").eq("owner_id", s.session.user.id).order("created_at").limit(1).maybeSingle();
    if (error) throw error; return (data as BoardRec) ?? null;
  },
  async boardSave(id: string | null, restaurant: string, draft: BoardData): Promise<BoardRec> {
    if (!sb) {
      const db = load(), me = demoMe(db); if (!me) throw new Error("permission denied");
      let r = id ? db.boards.find(x => x.id === id && x.owner_id === me.id) : undefined;
      if (r) Object.assign(r, { restaurant, draft });
      else { r = { id: uid(), owner_id: me.id, restaurant, draft, published: null, published_at: null, status: "trial", paid_until: null, created_at: now() }; db.boards.push(r); }
      save(db); return r;
    }
    const { data: s } = await sb.auth.getSession(); if (!s.session) throw new Error("permission denied");
    const q = id ? sb.from("boards").update({ restaurant, draft }).eq("id", id).select().single() : sb.from("boards").insert({ owner_id: s.session.user.id, restaurant, draft }).select().single();
    const { data, error } = await q; if (error) throw error; return data as BoardRec;
  },
  async boardPublish(id: string): Promise<void> {
    if (!sb) { const db = load(), me = demoMe(db); const r = db.boards.find(x => x.id === id && x.owner_id === me?.id); if (!r) throw new Error("permission denied"); r.published = JSON.parse(JSON.stringify(r.draft)); r.published_at = now(); save(db); return; }
    const { error } = await sb.rpc("board_publish", { board: id }); if (error) throw error;
  },
  /** Public: the published menu only. Used by TV display mode and the QR menu. */
  async boardPublic(id: string): Promise<{ restaurant: string; data: BoardData; published_at: string } | "expired" | null> {
    if (!sb) { const r = load().boards.find(x => x.id === id); if (!r?.published) return null; return boardAccess(r).live ? { restaurant: r.restaurant, data: r.published, published_at: r.published_at! } : "expired"; }
    const { data, error } = await sb.rpc("board_public", { board: id }); if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data; if (!row) return null;
    return row.live && row.published ? { restaurant: row.restaurant, data: row.published, published_at: row.published_at } : "expired";
  },

  // ----- subscription payments by bank transfer
  /** The restaurant sends a transfer receipt. It stays pending until the administrator confirms it. */
  async paymentSubmit(boardId: string, months: number, amount: number, file: File): Promise<void> {
    if (!sb) {
      const db = load(), me = demoMe(db); if (!me || !db.boards.some(x => x.id === boardId && x.owner_id === me.id)) throw new Error("permission denied");
      db.payments.push({ id: uid(), board_id: boardId, owner_id: me.id, months, amount, receipt: await shrinkImage(file, 1100), status: "pending", created_at: now() }); save(db); return;
    }
    const { data: s } = await sb.auth.getSession(); if (!s.session) throw new Error("permission denied");
    const path = `${s.session.user.id}/${uid()}.${(file.name.split(".").pop() || "jpg").toLowerCase()}`;
    const up = await sb.storage.from("receipts").upload(path, file, { contentType: file.type }); if (up.error) throw up.error;
    const { error } = await sb.from("board_payments").insert({ board_id: boardId, months, amount, receipt: path }); if (error) throw error;
  },
  async paymentsMine(): Promise<Payment[]> {
    if (!sb) { const db = load(), me = demoMe(db); return me ? db.payments.filter(p => p.owner_id === me.id).reverse() : []; }
    const { data: s } = await sb.auth.getSession(); if (!s.session) return [];
    const { data, error } = await sb.from("board_payments").select("*").eq("owner_id", s.session.user.id).order("created_at", { ascending: false }); if (error) throw error; return (data as Payment[]) || [];
  },
  /** Administrator only: every payment. */
  async paymentsAll(): Promise<Payment[]> {
    if (!sb) { const db = load(); return demoMe(db)?.role === "admin" ? [...db.payments].reverse() : []; }
    const { data, error } = await sb.from("board_payments").select("*").order("created_at", { ascending: false }); if (error) throw error; return (data as Payment[]) || [];
  },
  /** Administrator only: confirming extends the restaurant's paid period by the months paid for. */
  async paymentDecide(id: string, approve: boolean): Promise<void> {
    if (!sb) {
      const db = load(); if (demoMe(db)?.role !== "admin") throw new Error("permission denied");
      const p = db.payments.find(x => x.id === id); if (!p || p.status !== "pending") throw new Error("not pending");
      p.status = approve ? "approved" : "rejected";
      const b = db.boards.find(x => x.id === p.board_id);
      if (approve && b) { const from = new Date(Math.max(Date.now(), b.paid_until ? Date.parse(b.paid_until) : 0)); from.setMonth(from.getMonth() + p.months); b.paid_until = from.toISOString(); b.status = "active"; }
      save(db); return;
    }
    const { error } = await sb.rpc("payment_decide", { pid: id, approve }); if (error) throw error;
  },
  /** A viewable address for a receipt (private in the live database, so a short-lived link is made). */
  async receiptUrl(receipt: string): Promise<string> {
    if (!sb || receipt.startsWith("data:")) return receipt;
    const { data, error } = await sb.storage.from("receipts").createSignedUrl(receipt, 600); if (error) throw error; return data.signedUrl;
  },
  /** Stores a menu photo and returns its address. */
  async uploadPhoto(file: File): Promise<string> {
    if (!sb) return shrinkImage(file, 900);
    const { data: s } = await sb.auth.getSession(); if (!s.session) throw new Error("permission denied");
    const path = `${s.session.user.id}/${uid()}.${(file.name.split(".").pop() || "jpg").toLowerCase()}`;
    const { error } = await sb.storage.from("menu-photos").upload(path, file, { contentType: file.type, cacheControl: "31536000" }); if (error) throw error;
    return sb.storage.from("menu-photos").getPublicUrl(path).data.publicUrl;
  },

  // ----- basic analytics
  async track(path: string) {
    if (!sb) { try { const db = load(); db.views.push({ path, at: now() }); if (db.views.length > 2000) db.views = db.views.slice(-2000); save(db); } catch { /* ignore */ } return; }
    void sb.from("page_views").insert({ path });
  },
  async views(): Promise<{ path: string; at: string }[]> {
    if (!sb) { const db = load(); return demoMe(db)?.role === "admin" ? db.views : []; }
    const since = new Date(Date.now() - 30 * 864e5).toISOString();
    const { data } = await sb.from("page_views").select("path, created_at").gte("created_at", since).limit(5000);
    return (data || []).map((r: { path: string; created_at: string }) => ({ path: r.path, at: r.created_at }));
  },
  resetDemo() { try { localStorage.removeItem(DKEY); } catch { /* ignore */ } seeded = null; emit(); }
};
