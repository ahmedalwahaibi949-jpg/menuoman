import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useI18n, useSeo } from "../lib/i18n";
import { useApp } from "../lib/app";
import { api, DEMO_ADMIN, friendly, LIVE, type Invoice, type Message, type ProjectRec, type RequestRec } from "../lib/store";
import { Field, useToast } from "../components/ui";
import { waLink } from "../components/Layout";

export function useAuthErrors() {
  const { t } = useI18n();
  return (e: unknown) => ({
    "auth.invalid": t("That email and password don't match.", "البريد الإلكتروني أو كلمة المرور غير صحيحة."),
    "auth.exists": t("An account with this email already exists. Log in instead.", "يوجد حساب بهذا البريد. سجّل الدخول."),
    "auth.unconfirmed": t("Confirm your email first using the link we sent you.", "أكّد بريدك أولًا من الرابط الذي أرسلناه."),
    "auth.denied": t("You don't have permission to do that.", "ليس لديك صلاحية لهذا الإجراء.")
  } as Record<string, string>)[friendly(e)] || friendly(e);
}

export const STATUS_LABEL = (t: (a: string, b: string) => string): Record<string, string> => ({
  planning: t("Planning", "التخطيط"), design: t("Design", "التصميم"), development: t("Development", "التطوير"), review: t("Review", "المراجعة"), live: t("Live", "منشور"),
  open: t("Open", "مفتوح"), in_progress: t("In progress", "قيد التنفيذ"), done: t("Done", "منجز"), due: t("Due", "مستحقة"), paid: t("Paid", "مدفوعة"),
  new: t("New", "جديد"), contacted: t("Contacted", "تم التواصل"), won: t("Won", "تم الاتفاق"), closed: t("Closed", "مغلق")
});
export const fmtDate = (d: string, lang: string) => new Date(d).toLocaleDateString(lang === "ar" ? "ar-OM" : "en-GB", { day: "numeric", month: "short", year: "numeric", numberingSystem: "latn" } as Intl.DateTimeFormatOptions);

function Auth() {
  const { t } = useI18n(); const { refreshUser } = useApp(); const msg = useAuthErrors();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [f, setF] = useState({ full_name: "", company: "", phone: "", email: "", password: "" });
  const [err, setErr] = useState<Record<string, string>>({}); const [note, setNote] = useState(""); const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => { setF(v => ({ ...v, [k]: e.target.value })); setErr(v => ({ ...v, [k]: "", form: "" })); };
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setNote("");
    const er: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(f.email.trim())) er.email = t("Enter a valid email address.", "أدخل بريدًا إلكترونيًا صحيحًا.");
    if (mode === "register") {
      if (f.full_name.trim().length < 3) er.full_name = t("Enter your full name.", "أدخل اسمك الكامل.");
      if (f.phone.replace(/\D/g, "").length < 8) er.phone = t("Enter a phone number with at least 8 digits.", "أدخل رقم هاتف من 8 أرقام على الأقل.");
      if (f.password.length < 8 || !/[a-z]/i.test(f.password) || !/\d/.test(f.password)) er.password = t("At least 8 characters with letters and numbers.", "8 أحرف على الأقل تحتوي على حروف وأرقام.");
    } else if (!f.password) er.password = t("Enter your password.", "أدخل كلمة المرور.");
    setErr(er); if (Object.keys(er).length) return;
    setBusy(true);
    try {
      if (mode === "register") { const r = await api.signUp(f); if (r.needsVerification) { setNote(t("Check your email and open the confirmation link, then log in.", "تحقق من بريدك وافتح رابط التأكيد ثم سجّل الدخول.")); setMode("login"); } }
      else await api.signIn(f.email, f.password);
      await refreshUser();
    } catch (ex) { setErr({ form: msg(ex) }); }
    setBusy(false);
  }
  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-16">
      <form onSubmit={submit} noValidate className="card grid w-full max-w-[460px] gap-5 p-8 sm:p-10">
        <div><p className="eyebrow">{t("Client portal", "بوابة العملاء")}</p><h1 className="mt-2 font-display text-[30px] font-extrabold">{mode === "login" ? t("Log in", "تسجيل الدخول") : t("Create your account", "إنشاء حساب")}</h1>
          <p className="mt-1 text-slate">{t("Follow your projects, invoices and requests in one place.", "تابع مشاريعك وفواتيرك وطلباتك في مكان واحد.")}</p></div>
        {note && <p className="rounded-xl bg-teal-soft p-3 text-[15px]" role="status">{note}</p>}
        {mode === "register" && <>
          <Field label={t("Full name", "الاسم الكامل")} error={err.full_name}><input className="input" value={f.full_name} onChange={set("full_name")} autoComplete="name" /></Field>
          <Field label={t("Company name", "اسم الشركة")} hint={t("Optional", "اختياري")}><input className="input" value={f.company} onChange={set("company")} autoComplete="organization" /></Field>
          <Field label={t("Phone number", "رقم الهاتف")} error={err.phone}><input className="input ltr" type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" placeholder="+968" /></Field></>}
        <Field label={t("Email", "البريد الإلكتروني")} error={err.email}><input className="input ltr" type="email" value={f.email} onChange={set("email")} autoComplete="email" /></Field>
        <Field label={t("Password", "كلمة المرور")} error={err.password}><input className="input" type="password" value={f.password} onChange={set("password")} autoComplete={mode === "login" ? "current-password" : "new-password"} /></Field>
        {err.form && <p className="rounded-xl bg-red-50 p-3 text-[15px] text-red-800" role="alert">{err.form}</p>}
        <button className="btn-dark" disabled={busy}>{busy ? t("Please wait…", "لحظة…") : mode === "login" ? t("Log in", "دخول") : t("Create account", "إنشاء الحساب")}</button>
        <p className="text-center text-[15px] text-slate">{mode === "login" ? t("New client?", "عميل جديد؟") : t("Already have an account?", "لديك حساب؟")}{" "}
          <button type="button" className="font-semibold text-teal-700 underline underline-offset-4" onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr({}); }}>{mode === "login" ? t("Create an account", "أنشئ حسابًا") : t("Log in", "سجّل الدخول")}</button></p>
        {mode === "login" && LIVE && <button type="button" className="text-center text-[14px] text-slate underline underline-offset-4" onClick={async () => { if (!f.email) return setErr({ email: t("Enter your email first.", "أدخل بريدك أولًا.") }); await api.resetPassword(f.email); setNote(t("If that email has an account, a reset link is on its way.", "إذا كان للبريد حساب فسيصله رابط إعادة التعيين.")); }}>{t("Forgot password?", "نسيت كلمة المرور؟")}</button>}
        {!LIVE && <p className="text-center text-[13px] text-slate">{t("Demo admin", "حساب الإدارة التجريبي")}: <span className="ltr">{DEMO_ADMIN.email} / {DEMO_ADMIN.password}</span></p>}
      </form>
    </div>
  );
}

export default function Portal() {
  const { t, lang } = useI18n(); const { user, ready, content, refreshUser } = useApp(); const { toast, node } = useToast();
  useSeo(t("Client Portal · FIKRA DIGITAL", "بوابة العملاء · فكرة الرقمية"));
  const [tab, setTab] = useState("projects");
  const [projects, setProjects] = useState<ProjectRec[]>([]); const [requests, setRequests] = useState<RequestRec[]>([]); const [invoices, setInvoices] = useState<Invoice[]>([]); const [messages, setMessages] = useState<Message[]>([]);
  const [rq, setRq] = useState({ subject: "", body: "", project_id: "" }); const [text, setText] = useState("");
  const [prof, setProf] = useState({ full_name: "", company: "", phone: "" });
  const S = STATUS_LABEL(t);
  const loadAll = useCallback(async () => {
    if (!user || user.role !== "customer") return;
    const [p, r, i, m] = await Promise.all([api.list("projects"), api.list("requests"), api.list("invoices"), api.list("messages")]);
    setProjects(p); setRequests(r); setInvoices(i); setMessages([...m].reverse());
  }, [user]);
  useEffect(() => { void loadAll(); if (user) setProf({ full_name: user.full_name, company: user.company, phone: user.phone }); }, [loadAll, user]);

  if (!ready) return <div className="container-x py-28 text-center text-slate">{t("Loading…", "جارٍ التحميل…")}</div>;
  if (!user) return <Auth />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;

  const tabs = [["projects", t("My projects", "مشاريعي"), projects.length], ["requests", t("Requests", "الطلبات"), requests.filter(r => r.status !== "done").length], ["invoices", t("Invoices", "الفواتير"), invoices.filter(i => i.status === "due").length], ["support", t("Support", "الدعم"), 0], ["account", t("Account", "الحساب"), 0]] as const;
  const chip = (s: string) => <span className={`chip ${["live", "done", "paid"].includes(s) ? "bg-teal-soft text-teal-700" : ["due", "open"].includes(s) ? "bg-[#FFF5DC] text-[#8A5A00]" : "bg-mist text-slate"}`}>{S[s] || s}</span>;

  return (
    <div className="container-x py-12">
      {node}
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">{t("Client portal", "بوابة العملاء")}</p><h1 className="mt-1 font-display text-[clamp(28px,4vw,40px)] font-extrabold">{t("Hello", "مرحبًا")} {user.full_name.split(" ")[0]}</h1></div>
        <button className="text-[15px] text-slate underline underline-offset-4" onClick={() => api.signOut()}>{t("Log out", "تسجيل الخروج")}</button></div>
      <div className="mt-8 flex gap-6 overflow-x-auto border-b border-navy/10" role="tablist">{tabs.map(([k, l, n]) => (
        <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-[15.5px] font-semibold ${tab === k ? "border-navy text-ink" : "border-transparent text-slate hover:text-ink"}`}>{l}{n > 0 && <span className="ms-2 rounded-full bg-teal px-2 text-[12px] text-navy">{n}</span>}</button>))}</div>

      <div className="py-8">
        {tab === "projects" && (projects.length ? <div className="grid gap-6 md:grid-cols-2">{projects.map(p => (
          <article key={p.id} className="card p-7">
            <div className="flex items-start justify-between gap-3"><div><h2 className="text-[21px] font-bold">{p.title}</h2><p className="text-[14.5px] text-slate">{p.service}</p></div>{chip(p.status)}</div>
            <div className="mt-5"><div className="flex justify-between text-[14px]"><span className="text-slate">{t("Progress", "نسبة الإنجاز")}</span><b className="tabular-nums">{p.progress}%</b></div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-mist" role="progressbar" aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-gradient-to-r from-teal-700 to-teal transition-all duration-700" style={{ width: `${p.progress}%` }} /></div></div>
            {p.summary && <p className="mt-5">{p.summary}</p>}
            {p.updates.length > 0 && <div className="mt-5 border-t border-navy/10 pt-4"><b className="text-[13px] uppercase tracking-wide text-slate">{t("Updates", "التحديثات")}</b>
              <ul className="mt-3 grid gap-3">{[...p.updates].reverse().map((u, i) => <li key={i} className="flex gap-3 text-[15px]"><span className="mt-2 h-2 w-2 flex-none rounded-full bg-teal" /><span><span className="block text-[13px] text-slate">{fmtDate(u.at, lang)}</span>{u.text}</span></li>)}</ul></div>}
          </article>))}</div> : <Empty title={t("No projects yet", "لا توجد مشاريع بعد")} text={t("Once we start your project, it appears here with its progress.", "عند بدء مشروعك سيظهر هنا مع نسبة إنجازه.")} />)}

        {tab === "requests" && <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
          <form className="card grid content-start gap-4 p-7" onSubmit={async e => { e.preventDefault(); if (rq.subject.trim().length < 3 || rq.body.trim().length < 10) return toast(t("Add a subject and at least 10 characters of detail.", "أضف عنوانًا و10 أحرف على الأقل من التفاصيل."), true);
            try { await api.insert("requests", { customer_id: user.id, project_id: rq.project_id || null, subject: rq.subject.trim(), body: rq.body.trim(), status: "open" }); setRq({ subject: "", body: "", project_id: "" }); toast(t("Request sent.", "تم إرسال الطلب.")); void loadAll(); } catch { toast(t("Could not send the request.", "تعذّر إرسال الطلب."), true); } }}>
            <h2 className="text-[21px] font-bold">{t("Submit a request", "إرسال طلب")}</h2>
            {projects.length > 0 && <Field label={t("Project", "المشروع")}><select className="input" value={rq.project_id} onChange={e => setRq({ ...rq, project_id: e.target.value })}><option value="">{t("General", "عام")}</option>{projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></Field>}
            <Field label={t("Subject", "العنوان")}><input className="input" value={rq.subject} onChange={e => setRq({ ...rq, subject: e.target.value })} maxLength={120} /></Field>
            <Field label={t("Details", "التفاصيل")}><textarea className="input min-h-[120px] py-3" value={rq.body} onChange={e => setRq({ ...rq, body: e.target.value })} maxLength={2000} /></Field>
            <button className="btn-dark justify-self-start">{t("Send request", "إرسال الطلب")}</button>
          </form>
          <div>{requests.length ? <ul className="grid gap-3">{requests.map(r => <li key={r.id} className="card p-5"><div className="flex items-start justify-between gap-3"><b>{r.subject}</b>{chip(r.status)}</div><p className="mt-2 text-[15px] text-slate">{r.body}</p><span className="mt-2 block text-[13px] text-slate">{fmtDate(r.created_at, lang)}</span></li>)}</ul> : <Empty title={t("No requests yet", "لا توجد طلبات بعد")} text={t("Ask for a change or something new using the form.", "اطلب تعديلًا أو شيئًا جديدًا عبر النموذج.")} />}</div>
        </div>}

        {tab === "invoices" && (invoices.length ? <div className="card overflow-x-auto p-2"><table className="tbl"><thead><tr><th>{t("Invoice", "الفاتورة")}</th><th>{t("Amount", "المبلغ")}</th><th>{t("Due", "الاستحقاق")}</th><th>{t("Status", "الحالة")}</th></tr></thead>
          <tbody>{invoices.map(i => <tr key={i.id}><td className="font-semibold ltr rtl:text-right">{i.number}</td><td className="tabular-nums">{i.amount.toFixed(3)} {t("OMR", "ر.ع")}</td><td>{fmtDate(i.due_date, lang)}</td><td>{chip(i.status)}</td></tr>)}</tbody></table></div> : <Empty title={t("No invoices yet", "لا توجد فواتير بعد")} text={t("Invoices for your projects will be listed here.", "ستظهر فواتير مشاريعك هنا.")} />)}

        {tab === "support" && <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <div className="card flex min-h-[420px] flex-col p-6">
            <div className="flex-1 space-y-3 overflow-y-auto">{messages.length ? messages.map(m => <div key={m.id} className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] ${m.from_admin ? "bg-mist" : "ms-auto bg-navy text-paper"}`}><p>{m.body}</p><span className="mt-1 block text-[11.5px] opacity-60">{m.from_admin ? "FIKRA" : t("You", "أنت")} · {fmtDate(m.created_at, lang)}</span></div>) : <p className="text-slate">{t("Send us a message and we will reply here.", "أرسل لنا رسالة وسنرد عليك هنا.")}</p>}</div>
            <form className="mt-4 flex gap-2 border-t border-navy/10 pt-4" onSubmit={async e => { e.preventDefault(); if (!text.trim()) return; try { await api.insert("messages", { customer_id: user.id, body: text.trim(), from_admin: false }); setText(""); void loadAll(); } catch { toast(t("Could not send.", "تعذّر الإرسال."), true); } }}>
              <input className="input" value={text} onChange={e => setText(e.target.value)} placeholder={t("Write a message", "اكتب رسالة")} maxLength={1000} aria-label={t("Message", "الرسالة")} /><button className="btn-dark !px-5">{t("Send", "إرسال")}</button></form>
          </div>
          <div className="grid content-start gap-3"><a className="btn-dark" href={waLink(content.site.whatsapp, t(`Hello, this is ${user.full_name}.`, `مرحبًا، معك ${user.full_name}.`))} target="_blank" rel="noopener">WhatsApp</a><a className="btn-line ltr" href={`mailto:${content.site.email}`}>{content.site.email}</a></div>
        </div>}

        {tab === "account" && <form className="card grid max-w-[520px] gap-4 p-7" onSubmit={async e => { e.preventDefault(); try { await api.update("profiles", user.id, prof); await refreshUser(); toast(t("Saved.", "تم الحفظ.")); } catch { toast(t("Could not save.", "تعذّر الحفظ."), true); } }}>
          <h2 className="text-[21px] font-bold">{t("Your details", "بياناتك")}</h2>
          <Field label={t("Full name", "الاسم الكامل")}><input className="input" value={prof.full_name} onChange={e => setProf({ ...prof, full_name: e.target.value })} /></Field>
          <Field label={t("Company name", "اسم الشركة")}><input className="input" value={prof.company} onChange={e => setProf({ ...prof, company: e.target.value })} /></Field>
          <Field label={t("Phone number", "رقم الهاتف")}><input className="input ltr" value={prof.phone} onChange={e => setProf({ ...prof, phone: e.target.value })} /></Field>
          <Field label={t("Email", "البريد الإلكتروني")}><input className="input ltr bg-mist" value={user.email} readOnly /></Field>
          <button className="btn-dark justify-self-start">{t("Save", "حفظ")}</button>
        </form>}
      </div>
    </div>
  );
}

export function Empty({ title, text }: { title: string; text: string }) {
  return <div className="rounded-3xl border border-dashed border-navy/20 p-10 text-center"><b className="font-display text-[19px]">{title}</b><p className="mt-1 text-slate">{text}</p></div>;
}
