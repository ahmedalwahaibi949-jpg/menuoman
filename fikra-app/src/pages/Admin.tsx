import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useI18n, useSeo, type Bi } from "../lib/i18n";
import { useApp } from "../lib/app";
import { Link } from "react-router-dom";
import { api, type BoardRec, type Enquiry, type Invoice, type Message, type ProjectRec, type RequestRec, type User } from "../lib/store";
import { DESIGNS, GROUPS, designById } from "../boards/boards";
import { AdminPayments } from "../boards/Billing";
import { planOf } from "../lib/content";
import type { Content, Testimonial } from "../lib/content";
import { Field, useToast } from "../components/ui";
import { Empty, fmtDate, STATUS_LABEL } from "./Portal";

function BiInput({ label, value, onChange, area }: { label: string; value: Bi; onChange: (v: Bi) => void; area?: boolean }) {
  const C = area ? "textarea" : "input";
  return (
    <div><span className="label">{label}</span>
      <div className="grid gap-2 sm:grid-cols-2">
        <C className={`input ${area ? "min-h-[90px] py-2.5" : ""}`} dir="ltr" value={value.en} onChange={(e: { target: { value: string } }) => onChange({ ...value, en: e.target.value })} aria-label={`${label} (English)`} placeholder="English" />
        <C className={`input ${area ? "min-h-[90px] py-2.5" : ""}`} dir="rtl" value={value.ar} onChange={(e: { target: { value: string } }) => onChange({ ...value, ar: e.target.value })} aria-label={`${label} (عربي)`} placeholder="عربي" />
      </div></div>
  );
}

export default function Admin() {
  const { t, lang, L } = useI18n(); const { user, ready, content, reloadContent } = useApp(); const { toast, node } = useToast();
  useSeo(t("Admin · FIKRA DIGITAL", "الإدارة · فكرة الرقمية"));
  const S = STATUS_LABEL(t);
  const [tab, setTab] = useState("overview");
  const [enq, setEnq] = useState<Enquiry[]>([]); const [users, setUsers] = useState<User[]>([]); const [projects, setProjects] = useState<ProjectRec[]>([]);
  const [requests, setRequests] = useState<RequestRec[]>([]); const [invoices, setInvoices] = useState<Invoice[]>([]); const [messages, setMessages] = useState<Message[]>([]); const [views, setViews] = useState<{ path: string; at: string }[]>([]); const [boards, setBoards] = useState<BoardRec[]>([]);
  const [draft, setDraft] = useState<Content>(content);
  const [sel, setSel] = useState<string | null>(null);
  const [np, setNp] = useState({ customer_id: "", title: "", service: "", summary: "" });
  const [ni, setNi] = useState({ number: "", amount: "", due_date: "" }); const [reply, setReply] = useState(""); const [upd, setUpd] = useState<Record<string, string>>({});
  const isAdmin = user?.role === "admin";

  const load = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const [a, b, c, d, e, f, g] = await Promise.all([api.list("enquiries"), api.list("profiles"), api.list("projects"), api.list("requests"), api.list("invoices"), api.list("messages"), api.views()]);
      setBoards(await api.list("boards"));
      setEnq(a); setUsers(b); setProjects(c); setRequests(d); setInvoices(e); setMessages(f); setViews(g);
    } catch { toast(t("Could not load data.", "تعذّر تحميل البيانات."), true); }
  }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setDraft(content); }, [content]);

  const customers = useMemo(() => users.filter(u => u.role === "customer"), [users]);
  const name = (id: string) => users.find(u => u.id === id)?.full_name || "—";
  const pageStats = useMemo(() => { const m = new Map<string, number>(); views.forEach(v => m.set(v.path, (m.get(v.path) || 0) + 1)); return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8); }, [views]);
  const svcStats = useMemo(() => { const m = new Map<string, number>(); enq.forEach(v => m.set(v.service, (m.get(v.service) || 0) + 1)); return [...m.entries()].sort((a, b) => b[1] - a[1]); }, [enq]);

  if (!ready) return <div className="container-x py-28 text-center text-slate">{t("Loading…", "جارٍ التحميل…")}</div>;
  if (!user) return <Navigate to="/portal" replace />;
  if (!isAdmin) return <Navigate to="/portal" replace />; // customers never see this page; the database refuses their queries too

  const act = async (fn: () => Promise<void>, ok: string) => { try { await fn(); toast(ok); await load(); } catch { toast(t("That didn't work. Try again.", "لم ينجح ذلك. حاول مجددًا."), true); } };
  const saveContent = async <K extends keyof Content>(k: K) => { try { await api.setContent(k, draft[k]); await reloadContent(); toast(t("Saved. The website is updated.", "تم الحفظ وتحديث الموقع.")); } catch { toast(t("Could not save.", "تعذّر الحفظ."), true); } };
  const tabs = [["overview", t("Overview", "نظرة عامة"), 0], ["enquiries", t("Enquiries", "الطلبات الواردة"), enq.filter(e => e.status === "new").length], ["customers", t("Customers", "العملاء"), 0], ["projects", t("Projects", "المشاريع"), 0], ["boards", t("Menu boards", "شاشات المنيو"), 0],
    ["portfolio", t("Portfolio", "الأعمال"), 0], ["services", t("Services", "الخدمات"), 0], ["pricing", t("Pricing", "الأسعار"), 0], ["testimonials", t("Testimonials", "آراء العملاء"), 0], ["content", t("Website content", "محتوى الموقع"), 0]] as const;
  const Sel = ({ value, opts, onChange }: { value: string; opts: string[]; onChange: (v: string) => void }) => <select className="input !min-h-[40px] !w-auto !py-1 !text-[14px]" value={value} onChange={e => onChange(e.target.value)}>{opts.map(o => <option key={o} value={o}>{S[o] || o}</option>)}</select>;
  const cust = customers.find(c => c.id === sel);

  return (
    <div className="container-x py-10">
      {node}
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">{t("Administrator", "المدير")}</p><h1 className="mt-1 font-display text-[clamp(26px,3.6vw,38px)] font-extrabold">{t("Dashboard", "لوحة التحكم")}</h1></div>
        <button className="text-[15px] text-slate underline underline-offset-4" onClick={() => api.signOut()}>{t("Log out", "تسجيل الخروج")}</button></div>
      <div className="mt-7 flex gap-6 overflow-x-auto border-b border-navy/10" role="tablist">{tabs.map(([k, l, n]) => (
        <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-[15px] font-semibold ${tab === k ? "border-navy text-ink" : "border-transparent text-slate hover:text-ink"}`}>{l}{n > 0 && <span className="ms-2 rounded-full bg-teal px-2 text-[12px] text-navy">{n}</span>}</button>))}</div>

      <div className="py-8">
        {tab === "overview" && <div className="grid gap-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[[t("New enquiries", "طلبات جديدة"), enq.filter(e => e.status === "new").length], [t("Customers", "العملاء"), customers.length], [t("Active projects", "مشاريع نشطة"), projects.filter(p => p.status !== "live").length], [t("Page views (30 days)", "مشاهدات (30 يومًا)"), views.length]].map(([l, n]) => (
            <div key={String(l)} className="card p-6"><span className="text-[13.5px] text-slate">{l}</span><b className="mt-1 block font-display text-[36px] font-extrabold tabular-nums">{n}</b></div>))}</div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card p-7"><h2 className="text-[19px] font-bold">{t("Most viewed pages", "الصفحات الأكثر مشاهدة")}</h2>
              {pageStats.length ? <ul className="mt-5 grid gap-3">{pageStats.map(([p, n]) => <li key={p}><div className="flex justify-between text-[14.5px]"><span className="ltr">{p}</span><b className="tabular-nums">{n}</b></div><div className="mt-1 h-2 rounded-full bg-mist"><div className="h-full rounded-full bg-teal" style={{ width: `${(n / pageStats[0][1]) * 100}%` }} /></div></li>)}</ul> : <p className="mt-3 text-slate">{t("No visits recorded yet.", "لا توجد زيارات مسجلة بعد.")}</p>}</div>
            <div className="card p-7"><h2 className="text-[19px] font-bold">{t("Enquiries by service", "الطلبات حسب الخدمة")}</h2>
              {svcStats.length ? <ul className="mt-5 grid gap-3">{svcStats.map(([p, n]) => <li key={p}><div className="flex justify-between text-[14.5px]"><span>{p}</span><b className="tabular-nums">{n}</b></div><div className="mt-1 h-2 rounded-full bg-mist"><div className="h-full rounded-full bg-navy" style={{ width: `${(n / svcStats[0][1]) * 100}%` }} /></div></li>)}</ul> : <p className="mt-3 text-slate">{t("No enquiries yet.", "لا توجد طلبات بعد.")}</p>}</div>
          </div></div>}

        {tab === "enquiries" && (enq.length ? <div className="grid gap-4">{enq.map(e => (
          <article key={e.id} className="card p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-[19px] font-bold">{e.full_name}{e.company && <span className="font-normal text-slate"> · {e.company}</span>}</h2>
            <p className="text-[14.5px] text-slate"><a className="ltr underline" href={`mailto:${e.email}`}>{e.email}</a> · <a className="ltr underline" href={`https://wa.me/${e.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener">{e.phone}</a> · {fmtDate(e.created_at, lang)}</p></div>
            <div className="flex items-center gap-3"><Sel value={e.status} opts={["new", "contacted", "won", "closed"]} onChange={v => act(() => api.update("enquiries", e.id, { status: v as Enquiry["status"] }), t("Status updated.", "تم تحديث الحالة."))} /><button className="text-[14px] text-red-700 underline" onClick={() => act(() => api.remove("enquiries", e.id), t("Deleted.", "تم الحذف."))}>{t("Delete", "حذف")}</button></div></div>
            <p className="mt-3 flex flex-wrap gap-2"><span className="chip bg-teal-soft text-teal-700">{e.service}</span><span className="chip bg-mist text-slate">{e.budget}</span></p><p className="mt-3 whitespace-pre-wrap">{e.description}</p></article>))}</div>
          : <Empty title={t("No enquiries yet", "لا توجد طلبات بعد")} text={t("Messages from the contact form appear here.", "تظهر هنا الرسائل الواردة من نموذج التواصل.")} />)}

        {tab === "customers" && <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <div className="grid content-start gap-2">{customers.length ? customers.map(c => <button key={c.id} onClick={() => setSel(c.id)} className={`card p-4 text-start transition ${sel === c.id ? "!border-teal-600" : ""}`}><b>{c.full_name}</b><span className="block text-[14px] text-slate">{c.company || "—"} · <span className="ltr">{c.email}</span></span></button>) : <Empty title={t("No customers yet", "لا يوجد عملاء بعد")} text={t("Customers appear after they register in the client portal.", "يظهر العملاء بعد تسجيلهم في بوابة العملاء.")} />}</div>
          {cust && <div className="grid content-start gap-6">
            <div className="card p-6"><h2 className="text-[21px] font-bold">{cust.full_name}</h2><p className="text-slate">{cust.company} · <span className="ltr">{cust.phone}</span> · {t("joined", "انضم")} {fmtDate(cust.created_at, lang)}</p>
              <p className="mt-3 text-[14.5px]">{projects.filter(p => p.customer_id === cust.id).length} {t("projects", "مشاريع")} · {requests.filter(r => r.customer_id === cust.id).length} {t("requests", "طلبات")}</p></div>
            <div className="card p-6"><h3 className="font-bold">{t("Requests", "الطلبات")}</h3>{requests.filter(r => r.customer_id === cust.id).length ? <ul className="mt-3 grid gap-3">{requests.filter(r => r.customer_id === cust.id).map(r => <li key={r.id} className="flex items-start justify-between gap-3 border-t border-navy/10 pt-3"><span><b>{r.subject}</b><span className="block text-[14.5px] text-slate">{r.body}</span></span><Sel value={r.status} opts={["open", "in_progress", "done"]} onChange={v => act(() => api.update("requests", r.id, { status: v as RequestRec["status"] }), t("Updated.", "تم التحديث."))} /></li>)}</ul> : <p className="mt-2 text-slate">{t("None.", "لا يوجد.")}</p>}</div>
            <div className="card p-6"><h3 className="font-bold">{t("Invoices", "الفواتير")}</h3>
              <ul className="mt-3 grid gap-2">{invoices.filter(i => i.customer_id === cust.id).map(i => <li key={i.id} className="flex items-center justify-between gap-3 text-[15px]"><span><b className="ltr">{i.number}</b> · {i.amount.toFixed(3)} {t("OMR", "ر.ع")} · {fmtDate(i.due_date, lang)}</span><Sel value={i.status} opts={["due", "paid"]} onChange={v => act(() => api.update("invoices", i.id, { status: v as Invoice["status"] }), t("Updated.", "تم التحديث."))} /></li>)}</ul>
              <form className="mt-4 grid gap-2 border-t border-navy/10 pt-4 sm:grid-cols-[1fr_1fr_1fr_auto]" onSubmit={e => { e.preventDefault(); if (!ni.number || !(+ni.amount > 0) || !ni.due_date) return toast(t("Fill number, amount and due date.", "أدخل الرقم والمبلغ وتاريخ الاستحقاق."), true); void act(() => api.insert("invoices", { customer_id: cust.id, project_id: null, number: ni.number, amount: +ni.amount, status: "due", due_date: ni.due_date }), t("Invoice added.", "تمت إضافة الفاتورة.")); setNi({ number: "", amount: "", due_date: "" }); }}>
                <input className="input ltr" placeholder="INV-001" value={ni.number} onChange={e => setNi({ ...ni, number: e.target.value })} aria-label={t("Invoice number", "رقم الفاتورة")} /><input className="input ltr" type="number" step="0.001" min="0" placeholder={t("Amount", "المبلغ")} value={ni.amount} onChange={e => setNi({ ...ni, amount: e.target.value })} aria-label={t("Amount", "المبلغ")} /><input className="input ltr" type="date" value={ni.due_date} onChange={e => setNi({ ...ni, due_date: e.target.value })} aria-label={t("Due date", "تاريخ الاستحقاق")} /><button className="btn-dark !min-h-[50px] !px-5">{t("Add", "إضافة")}</button></form></div>
            <div className="card p-6"><h3 className="font-bold">{t("Support messages", "رسائل الدعم")}</h3>
              <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">{[...messages].reverse().filter(m => m.customer_id === cust.id).map(m => <p key={m.id} className={`max-w-[85%] rounded-2xl px-4 py-2 text-[15px] ${m.from_admin ? "ms-auto bg-navy text-paper" : "bg-mist"}`}>{m.body}</p>)}</div>
              <form className="mt-3 flex gap-2" onSubmit={e => { e.preventDefault(); if (!reply.trim()) return; void act(() => api.insert("messages", { customer_id: cust.id, body: reply.trim(), from_admin: true }), t("Reply sent.", "تم إرسال الرد.")); setReply(""); }}><input className="input" value={reply} onChange={e => setReply(e.target.value)} placeholder={t("Reply", "رد")} aria-label={t("Reply", "رد")} /><button className="btn-dark !px-5">{t("Send", "إرسال")}</button></form></div>
          </div>}
        </div>}

        {tab === "projects" && <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <form className="card grid content-start gap-4 p-7" onSubmit={e => { e.preventDefault(); if (!np.customer_id || np.title.trim().length < 3) return toast(t("Choose a customer and enter a title.", "اختر عميلًا وأدخل عنوانًا."), true); void act(() => api.insert("projects", { customer_id: np.customer_id, title: np.title.trim(), service: np.service, status: "planning", progress: 0, summary: np.summary, updates: [] }), t("Project created.", "تم إنشاء المشروع.")); setNp({ customer_id: "", title: "", service: "", summary: "" }); }}>
            <h2 className="text-[21px] font-bold">{t("New project", "مشروع جديد")}</h2>
            <Field label={t("Customer", "العميل")}><select className="input" value={np.customer_id} onChange={e => setNp({ ...np, customer_id: e.target.value })}><option value="">{t("Choose", "اختر")}</option>{customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}</select></Field>
            <Field label={t("Title", "العنوان")}><input className="input" value={np.title} onChange={e => setNp({ ...np, title: e.target.value })} /></Field>
            <Field label={t("Service", "الخدمة")}><select className="input" value={np.service} onChange={e => setNp({ ...np, service: e.target.value })}><option value="">—</option>{content.services.map(s => <option key={s.slug} value={s.title.en}>{L(s.title)}</option>)}</select></Field>
            <Field label={t("Summary", "ملخص")}><textarea className="input min-h-[80px] py-2.5" value={np.summary} onChange={e => setNp({ ...np, summary: e.target.value })} /></Field>
            <button className="btn-dark justify-self-start">{t("Create project", "إنشاء المشروع")}</button></form>
          <div className="grid content-start gap-4">{projects.length ? projects.map(p => (
            <article key={p.id} className="card p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-[19px] font-bold">{p.title}</h3><p className="text-[14.5px] text-slate">{name(p.customer_id)} · {p.service}</p></div>
              <div className="flex items-center gap-3"><Sel value={p.status} opts={["planning", "design", "development", "review", "live"]} onChange={v => act(() => api.update("projects", p.id, { status: v as ProjectRec["status"] }), t("Status updated.", "تم تحديث الحالة."))} /><button className="text-[14px] text-red-700 underline" onClick={() => act(() => api.remove("projects", p.id), t("Deleted.", "تم الحذف."))}>{t("Delete", "حذف")}</button></div></div>
              <label className="mt-4 block"><span className="flex justify-between text-[14px]"><span className="text-slate">{t("Progress", "نسبة الإنجاز")}</span><b className="tabular-nums">{p.progress}%</b></span>
                <input type="range" min={0} max={100} step={5} defaultValue={p.progress} className="mt-2 w-full accent-[#00B3A5]" onChange={e => { const v = +e.target.value; setProjects(ps => ps.map(x => x.id === p.id ? { ...x, progress: v } : x)); }} onMouseUp={e => act(() => api.update("projects", p.id, { progress: +(e.target as HTMLInputElement).value }), t("Progress updated.", "تم تحديث النسبة."))} onTouchEnd={e => act(() => api.update("projects", p.id, { progress: +(e.target as HTMLInputElement).value }), t("Progress updated.", "تم تحديث النسبة."))} onKeyUp={e => act(() => api.update("projects", p.id, { progress: +(e.target as HTMLInputElement).value }), t("Progress updated.", "تم تحديث النسبة."))} /></label>
              <form className="mt-3 flex gap-2" onSubmit={e => { e.preventDefault(); const tx = (upd[p.id] || "").trim(); if (!tx) return; void act(() => api.update("projects", p.id, { updates: [...p.updates, { at: new Date().toISOString(), text: tx }] }), t("Update posted to the client.", "تم نشر التحديث للعميل.")); setUpd({ ...upd, [p.id]: "" }); }}>
                <input className="input" value={upd[p.id] || ""} onChange={e => setUpd({ ...upd, [p.id]: e.target.value })} placeholder={t("Post an update for the client", "انشر تحديثًا للعميل")} aria-label={t("Update", "تحديث")} /><button className="btn-line !px-5">{t("Post", "نشر")}</button></form>
              {p.updates.length > 0 && <p className="mt-2 text-[13.5px] text-slate">{p.updates.length} {t("updates posted", "تحديثات منشورة")}</p>}</article>)) : <Empty title={t("No projects yet", "لا توجد مشاريع بعد")} text={t("Create one for a registered customer.", "أنشئ مشروعًا لعميل مسجّل.")} />}</div>
        </div>}

        {tab === "boards" && <div className="grid gap-6">
          <AdminPayments boards={boards} users={users} toast={toast} reload={load} />
          <section className="card p-6"><h2 className="text-[19px] font-bold">{t("Restaurants", "المطاعم")}</h2>
            {boards.length ? <div className="mt-4 overflow-x-auto"><table className="tbl"><thead><tr><th>{t("Restaurant", "المطعم")}</th><th>{t("Owner", "المالك")}</th><th>{t("Design", "التصميم")}</th><th>{t("Screens", "الشاشات")}</th><th>{t("Published", "النشر")}</th><th>{t("Subscription", "الاشتراك")}</th><th>{t("Paid until", "مدفوع حتى")}</th><th></th></tr></thead>
              <tbody>{boards.map(b => <tr key={b.id}><td className="font-semibold">{b.restaurant}</td><td>{name(b.owner_id)}</td><td>{L(designById(b.draft.settings.designId)?.name)}</td><td className="tabular-nums">{b.draft.settings.screens}</td><td>{b.published_at ? fmtDate(b.published_at, lang) : "—"}</td>
                <td><select className="input !min-h-[40px] !w-auto !py-1 !text-[14px]" value={b.status} onChange={e => act(() => api.update("boards", b.id, { status: e.target.value as BoardRec["status"] }), t("Subscription updated.", "تم تحديث الاشتراك."))}><option value="trial">{t("Trial", "تجريبي")}</option><option value="active">{t("Active", "نشط")}</option><option value="paused">{t("Paused", "موقوف")}</option></select></td>
                <td>{b.paid_until ? fmtDate(b.paid_until, lang) : "—"}</td>
                <td>{b.published_at && <Link className="underline" to={`/display/${b.id}`} target="_blank">{t("Open display", "فتح العرض")}</Link>}</td></tr>)}</tbody></table></div>
              : <p className="mt-2 text-slate">{t("No restaurants yet. They appear when a customer saves a menu in the restaurant dashboard.", "لا توجد مطاعم بعد. تظهر عندما يحفظ عميل منيو في لوحة المطعم.")}</p>}</section>
          {(() => { const pl = planOf(draft); const setPlan = (p: typeof pl) => setDraft(d => ({ ...d, boards: { ...d.boards, plan: p } })); return (
          <section className="card grid gap-4 p-6"><h2 className="text-[19px] font-bold">{t("Self-service plan and bank details", "الباقة الذاتية وبيانات البنك")}</h2>
            <p className="-mt-2 text-[14.5px] text-slate">{t("Restaurants see these when they subscribe. Leave the account number empty to hide transfer payment.", "تظهر للمطاعم عند الاشتراك. اترك رقم الحساب فارغًا لإخفاء الدفع بالتحويل.")}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("Monthly price (OMR)", "السعر الشهري (ر.ع)")} hint={t("12 months are charged as 10", "تُحتسب 12 شهرًا بسعر 10")}><input className="input ltr" type="number" min="1" step="0.5" value={pl.monthly} onChange={e => setPlan({ ...pl, monthly: +e.target.value })} /></Field>
              <Field label={t("Bank name", "اسم البنك")}><input className="input" value={pl.bank.bank} onChange={e => setPlan({ ...pl, bank: { ...pl.bank, bank: e.target.value } })} /></Field>
              <Field label={t("Account holder name", "اسم صاحب الحساب")}><input className="input" value={pl.bank.holder} onChange={e => setPlan({ ...pl, bank: { ...pl.bank, holder: e.target.value } })} /></Field>
              <Field label={t("Account number or IBAN", "رقم الحساب أو الآيبان")}><input className="input ltr" value={pl.bank.account} onChange={e => setPlan({ ...pl, bank: { ...pl.bank, account: e.target.value } })} /></Field></div></section>); })()}
          <section className="card grid gap-4 p-6"><h2 className="text-[19px] font-bold">{t("Pricing shown on design pages", "السعر المعروض في صفحات التصاميم")}</h2>
            <div className="grid gap-4 sm:grid-cols-2"><Field label={t("Design and setup from (OMR)", "التصميم والإعداد من (ر.ع)")} hint={t("Empty shows “quoted per restaurant”", "الفارغ يعرض «يُسعَّر لكل مطعم»")}><input className="input ltr" type="number" min="0" value={draft.boards.pricing.setup ?? ""} onChange={e => setDraft(d => ({ ...d, boards: { ...d.boards, pricing: { ...d.boards.pricing, setup: e.target.value === "" ? null : +e.target.value } } }))} /></Field>
              <Field label={t("Per screen monthly (OMR)", "لكل شاشة شهريًا (ر.ع)")}><input className="input ltr" type="number" min="0" value={draft.boards.pricing.monthly ?? ""} onChange={e => setDraft(d => ({ ...d, boards: { ...d.boards, pricing: { ...d.boards.pricing, monthly: e.target.value === "" ? null : +e.target.value } } }))} /></Field></div></section>
          <section className="card p-6"><h2 className="text-[19px] font-bold">{t("Designs shown in the gallery", "التصاميم المعروضة")}</h2><p className="mt-1 text-[14.5px] text-slate">{t("Untick a design to hide it. New layouts are added in code (src/boards/boards.ts).", "أزل العلامة لإخفاء التصميم. تُضاف التصاميم الجديدة في الكود.")}</p>
            {GROUPS.map(g => <div key={g.id} className="mt-4"><b className="text-[13px] uppercase tracking-wide text-slate">{L(g.label)}</b><div className="mt-2 flex flex-wrap gap-2">{DESIGNS.filter(z => z.group === g.id).map(z => { const on = !draft.boards.hidden.includes(z.id); return (
              <button key={z.id} aria-pressed={on} onClick={() => setDraft(d => ({ ...d, boards: { ...d.boards, hidden: on ? [...d.boards.hidden, z.id] : d.boards.hidden.filter(x => x !== z.id) } }))} className={`rounded-full px-4 py-2 text-[14px] font-semibold ${on ? "bg-navy text-paper" : "bg-mist text-slate line-through"}`}>{L(z.name)}</button>); })}</div></div>)}</section>
          <button className="btn-dark justify-self-start" onClick={() => saveContent("boards")}>{t("Save menu board settings", "حفظ إعدادات الشاشات")}</button></div>}

        {tab === "portfolio" && <div className="grid gap-4">{draft.projects.map((p, i) => (
          <div key={p.slug} className="card grid gap-4 p-6"><div className="flex items-center justify-between gap-3"><b className="ltr">{p.slug}</b><label className="flex items-center gap-2 text-[15px]"><input type="checkbox" className="h-4 w-4 accent-[#00B3A5]" checked={p.published} onChange={e => setDraft(d => ({ ...d, projects: d.projects.map((x, j) => j === i ? { ...x, published: e.target.checked } : x) }))} />{t("Published", "منشور")}</label></div>
            <BiInput label={t("Title", "العنوان")} value={p.title} onChange={v => setDraft(d => ({ ...d, projects: d.projects.map((x, j) => j === i ? { ...x, title: v } : x) }))} />
            <BiInput label={t("Summary", "الملخص")} value={p.summary} onChange={v => setDraft(d => ({ ...d, projects: d.projects.map((x, j) => j === i ? { ...x, summary: v } : x) }))} />
            <BiInput area label={t("Design concept", "فكرة التصميم")} value={p.concept} onChange={v => setDraft(d => ({ ...d, projects: d.projects.map((x, j) => j === i ? { ...x, concept: v } : x) }))} /></div>))}
          <button className="btn-dark justify-self-start" onClick={() => saveContent("projects")}>{t("Save portfolio", "حفظ الأعمال")}</button></div>}

        {tab === "services" && <div className="grid gap-4">{draft.services.map((s, i) => { const up = (patch: Partial<typeof s>) => setDraft(d => ({ ...d, services: d.services.map((x, j) => j === i ? { ...x, ...patch } : x) })); return (
          <div key={s.slug} className="card grid gap-4 p-6"><b className="font-display text-teal-700">{s.n}</b>
            <BiInput label={t("Title", "العنوان")} value={s.title} onChange={v => up({ title: v })} /><BiInput label={t("Short description", "وصف قصير")} value={s.short} onChange={v => up({ short: v })} /><BiInput area label={t("Description", "الوصف")} value={s.description} onChange={v => up({ description: v })} />
            <div className="grid gap-4 sm:grid-cols-[200px_1fr]"><Field label={t("Starting price (OMR)", "السعر يبدأ من (ر.ع)")} hint={t("Leave empty for “request a quote”", "اتركه فارغًا لـ «اطلب عرض سعر»")}><input className="input ltr" type="number" min="0" value={s.priceFrom ?? ""} onChange={e => up({ priceFrom: e.target.value === "" ? null : +e.target.value })} /></Field><BiInput label={t("Price note", "ملاحظة السعر")} value={s.priceNote} onChange={v => up({ priceNote: v })} /></div></div>); })}
          <button className="btn-dark justify-self-start" onClick={() => saveContent("services")}>{t("Save services", "حفظ الخدمات")}</button></div>}

        {tab === "pricing" && <div className="grid gap-4">{draft.pricing.packs.map((p, i) => { const up = (patch: Partial<typeof p>) => setDraft(d => ({ ...d, pricing: { ...d.pricing, packs: d.pricing.packs.map((x, j) => j === i ? { ...x, ...patch } : x) } })); return (
          <div key={p.id} className="card grid gap-4 p-6"><div className="grid gap-4 sm:grid-cols-[1fr_180px]"><BiInput label={t("Package name", "اسم الباقة")} value={p.name} onChange={v => up({ name: v })} /><Field label={t("Price (OMR)", "السعر (ر.ع)")}><input className="input ltr" type="number" min="0" value={p.price} onChange={e => up({ price: +e.target.value })} /></Field></div>
            <BiInput label={t("Description", "الوصف")} value={p.blurb} onChange={v => up({ blurb: v })} />
            <Field label={t("Features, one per line: English | Arabic", "المزايا، سطر لكل ميزة: English | عربي")}><textarea className="input min-h-[150px] py-2.5" dir="ltr" value={p.features.map(f => `${f.en} | ${f.ar}`).join("\n")} onChange={e => up({ features: e.target.value.split("\n").filter(x => x.trim()).map(l => { const [en, ar] = l.split("|").map(x => x.trim()); return { en: en || "", ar: ar || en || "" }; }) })} /></Field></div>); })}
          <div className="card p-6"><BiInput area label={t("Custom SaaS note", "ملاحظة مشاريع SaaS")} value={draft.pricing.saasNote} onChange={v => setDraft(d => ({ ...d, pricing: { ...d.pricing, saasNote: v } }))} /></div>
          <button className="btn-dark justify-self-start" onClick={() => saveContent("pricing")}>{t("Save pricing", "حفظ الأسعار")}</button></div>}

        {tab === "testimonials" && <div className="grid gap-4">
          <p className="rounded-2xl bg-[#FFF5DC] p-4 text-[14.5px] text-[#6E4A00]">{t("Only add words a real client actually gave you, with their permission. Nothing is shown on the website until you publish it.", "أضف فقط كلامًا قاله عميل حقيقي وبإذنه. لا يظهر شيء في الموقع قبل نشره.")}</p>
          {draft.testimonials.map((q, i) => { const up = (patch: Partial<Testimonial>) => setDraft(d => ({ ...d, testimonials: d.testimonials.map((x, j) => j === i ? { ...x, ...patch } : x) })); return (
            <div key={q.id} className="card grid gap-4 p-6"><div className="grid gap-4 sm:grid-cols-2"><Field label={t("Client name", "اسم العميل")}><input className="input" value={q.name} onChange={e => up({ name: e.target.value })} /></Field><Field label={t("Company", "الشركة")}><input className="input" value={q.company} onChange={e => up({ company: e.target.value })} /></Field></div>
              <BiInput area label={t("Quote", "النص")} value={q.quote} onChange={v => up({ quote: v })} />
              <div className="flex items-center justify-between"><label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 accent-[#00B3A5]" checked={q.published} onChange={e => up({ published: e.target.checked })} />{t("Published", "منشور")}</label><button className="text-[14px] text-red-700 underline" onClick={() => setDraft(d => ({ ...d, testimonials: d.testimonials.filter((_, j) => j !== i) }))}>{t("Remove", "إزالة")}</button></div></div>); })}
          <div className="flex gap-3"><button className="btn-line" onClick={() => setDraft(d => ({ ...d, testimonials: [...d.testimonials, { id: String(Date.now()), name: "", company: "", quote: { en: "", ar: "" }, published: false }] }))}>{t("Add testimonial", "إضافة رأي")}</button><button className="btn-dark" onClick={() => saveContent("testimonials")}>{t("Save testimonials", "حفظ الآراء")}</button></div></div>}

        {tab === "content" && <div className="grid gap-4">
          <div className="card grid gap-4 p-6"><h2 className="text-[19px] font-bold">{t("Contact details", "بيانات التواصل")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">{(["whatsapp", "email", "instagram", "linkedin"] as const).map(k => <Field key={k} label={k[0].toUpperCase() + k.slice(1)}><input className="input ltr" value={draft.site[k]} onChange={e => setDraft(d => ({ ...d, site: { ...d.site, [k]: e.target.value, placeholder: false } }))} /></Field>)}</div>
            <button className="btn-dark justify-self-start" onClick={() => saveContent("site")}>{t("Save contact details", "حفظ بيانات التواصل")}</button></div>
          <div className="card grid gap-4 p-6"><h2 className="text-[19px] font-bold">{t("About page", "صفحة من نحن")}</h2>
            {(["intro", "mission", "vision", "approach"] as const).map(k => <BiInput key={k} area label={{ intro: t("Introduction", "المقدمة"), mission: t("Mission", "الرسالة"), vision: t("Vision", "الرؤية"), approach: t("Approach", "الأسلوب") }[k]} value={draft.about[k]} onChange={v => setDraft(d => ({ ...d, about: { ...d.about, [k]: v } }))} />)}
            <button className="btn-dark justify-self-start" onClick={() => saveContent("about")}>{t("Save about page", "حفظ الصفحة")}</button></div></div>}
      </div>
    </div>
  );
}
