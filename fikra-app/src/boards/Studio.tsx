// Restaurant dashboard: one menu feeds the TV screens, the promo slides and the QR menu.
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useI18n, useSeo, type Bi } from "../lib/i18n";
import { useApp } from "../lib/app";
import { api, type BoardData, type BoardRec } from "../lib/store";
import { Field, useToast } from "../components/ui";
import { photoUrl } from "./Board";
import { TvWall, useBoardFonts } from "./Pages";
import { AccessBadge, Billing } from "./Billing";
import { DESIGNS, GROUPS, defaultAssign, defaultSettings, designById, type Item, type Offer } from "./boards";

const uid = () => Math.random().toString(36).slice(2, 10);
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

function BiPair({ value, onChange, ph }: { value: Bi; onChange: (v: Bi) => void; ph: string }) {
  return <div className="grid gap-2 sm:grid-cols-2"><input className="input" dir="ltr" value={value.en} placeholder={`${ph} · English`} aria-label={`${ph} English`} onChange={e => onChange({ ...value, en: e.target.value })} /><input className="input" dir="rtl" value={value.ar} placeholder={`${ph} · عربي`} aria-label={`${ph} عربي`} onChange={e => onChange({ ...value, ar: e.target.value })} /></div>;
}
function PhotoPick({ value, onChange, toast }: { value?: string; onChange: (v: string | undefined) => void; toast: (m: string, bad?: boolean) => void }) {
  const { t } = useI18n(); const [busy, setBusy] = useState(false);
  return (
    <label className="relative grid h-[58px] w-[58px] flex-none cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-navy/25 bg-mist text-[11px] text-slate" title={t("Upload photo", "رفع صورة")}>
      {value ? <img src={photoUrl(value)} alt="" className="h-full w-full object-cover" /> : busy ? "…" : t("Photo", "صورة")}
      <input type="file" accept="image/png,image/jpeg,image/webp" className="absolute inset-0 cursor-pointer opacity-0" aria-label={t("Upload photo", "رفع صورة")} onChange={async e => {
        const f = e.target.files?.[0]; if (!f) return;
        if (f.size > 6 * 1048576) return toast(t("That photo is over 6 MB.", "حجم الصورة أكبر من 6 ميجابايت."), true);
        setBusy(true); try { onChange(await api.uploadPhoto(f)); } catch { toast(t("Could not upload the photo.", "تعذّر رفع الصورة."), true); } setBusy(false);
      }} />
    </label>
  );
}

export default function Studio() {
  const { t, L, lang } = useI18n(); const { user, ready, content } = useApp(); const { toast, node } = useToast(); const [qs] = useSearchParams(); useBoardFonts();
  useSeo(t("Restaurant Dashboard · FIKRA Menu Studio", "لوحة المطعم · استوديو المنيو"));
  const [rec, setRec] = useState<BoardRec | null>(null); const [d, setD] = useState<BoardData | null>(null); const [name, setName] = useState("");
  const [tab, setTab] = useState("menu"); const [dirty, setDirty] = useState(false); const [busy, setBusy] = useState(false); const [playing, setPlaying] = useState(true);

  const start = useCallback(async () => {
    if (!user || user.role !== "customer") return;
    const r = await api.boardMine().catch(() => null);
    if (r) { setRec(r); setD(clone(r.draft)); setName(r.restaurant); return; }
    const design = designById(qs.get("design") || "") || DESIGNS[0];
    setD({ menu: clone(design.menu), settings: defaultSettings(design.id, design.menu) }); setName(user.company || ""); setDirty(true);
  }, [user, qs]);
  useEffect(() => { void start(); }, [start]);

  if (!ready) return <div className="container-x py-28 text-center text-slate">{t("Loading…", "جارٍ التحميل…")}</div>;
  if (!user) return <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center"><div><h1 className="h-sec">{t("Restaurant dashboard", "لوحة المطعم")}</h1><p className="lead mx-auto mt-3 max-w-[52ch]">{t("Log in or create an account to manage your menu, TV screens and QR menu from one place.", "سجّل الدخول أو أنشئ حسابًا لإدارة المنيو وشاشاتك ومنيو QR من مكان واحد.")}</p><Link to="/portal" className="btn-dark mt-7">{t("Log in or register", "دخول أو تسجيل")}</Link></div></div>;
  if (user.role === "admin") return <div className="container-x py-24 text-center"><p className="lead">{t("Administrators manage restaurants from the admin dashboard.", "يدير المدير المطاعم من لوحة الإدارة.")}</p><Link to="/admin" className="btn-dark mt-6">{t("Open admin", "فتح الإدارة")}</Link></div>;
  if (!d) return <div className="container-x py-28 text-center text-slate">{t("Loading…", "جارٍ التحميل…")}</div>;

  const design = designById(d.settings.designId) || DESIGNS[0];
  const up = (fn: (x: BoardData) => void) => { setD(prev => { const n = clone(prev!); fn(n); return n; }); setDirty(true); };
  const setScreens = (n: 1 | 2 | 3 | 4) => up(x => { x.settings.screens = n; x.settings.assign = defaultAssign(x.menu, n); });
  async function save(publish: boolean) {
    if (name.trim().length < 2) { toast(t("Enter your restaurant name first.", "أدخل اسم المطعم أولًا."), true); return; }
    setBusy(true);
    try {
      const fixed = clone(d!); if (fixed.settings.assign.length !== fixed.settings.screens) fixed.settings.assign = defaultAssign(fixed.menu, fixed.settings.screens);
      let r = await api.boardSave(rec?.id || null, name.trim(), fixed);
      if (publish) { await api.boardPublish(r.id); r = (await api.boardMine()) || r; }
      setRec(r); setDirty(false);
      toast(publish ? t("Published. Your screens and QR menu now show this menu.", "تم النشر. شاشاتك ومنيو QR تعرض هذا المنيو الآن.") : t("Draft saved.", "تم حفظ المسودة."));
    } catch { toast(t("Could not save. Check your connection and try again.", "تعذّر الحفظ. تحقق من الاتصال وحاول مجددًا."), true); }
    setBusy(false);
  }
  const base = location.origin + location.pathname;
  const changed = dirty || (rec && JSON.stringify(rec.draft) !== JSON.stringify(rec.published));
  const tabs = [["menu", t("Menu", "المنيو")], ["offers", t("Offers & hours", "العروض والأوقات")], ["screens", t("Screens", "الشاشات")], ["publish", t("Preview & publish", "المعاينة والنشر")], ["billing", t("Subscription", "الاشتراك")]] as const;
  const days = lang === "ar" ? ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="container-x py-10">
      {node}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1"><p className="eyebrow">{t("Restaurant dashboard", "لوحة المطعم")}</p>
          <input className="mt-1 w-full max-w-[520px] border-0 border-b-2 border-navy/15 bg-transparent font-display text-[clamp(26px,3.6vw,38px)] font-extrabold outline-none focus:border-teal" value={name} onChange={e => { const v = e.target.value; setD(prev => { if (!prev) return prev; const cur = prev.menu.name, df = designById(prev.settings.designId)?.menu.name; if ((cur.en === name && cur.ar === name) || (df && cur.en === df.en && cur.ar === df.ar)) { const n = clone(prev); n.menu.name = { en: v, ar: v }; return n; } return prev; }); setName(v); setDirty(true); }} placeholder={t("Restaurant name", "اسم المطعم")} aria-label={t("Restaurant name", "اسم المطعم")} /></div>
        <div className="flex flex-wrap items-center gap-4">{rec && <button onClick={() => setTab("billing")}><AccessBadge rec={rec} /></button>}<span className="text-[14px] text-slate">{rec?.published_at ? (changed ? t("Unpublished changes", "تغييرات غير منشورة") : t("Published", "منشور")) : t("Not published yet", "غير منشور بعد")}</span>
          <button className="btn-line !min-h-[44px]" disabled={busy} onClick={() => save(false)}>{t("Save draft", "حفظ المسودة")}</button><button className="btn-dark !min-h-[44px]" disabled={busy} onClick={() => save(true)}>{t("Publish", "نشر")}</button></div>
      </div>
      <div className="mt-7 flex gap-6 overflow-x-auto border-b border-navy/10" role="tablist">{tabs.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-[15.5px] font-semibold ${tab === k ? "border-navy text-ink" : "border-transparent text-slate hover:text-ink"}`}>{l}</button>)}</div>

      <div className="py-8">
        {tab === "menu" && <div className="grid gap-6">
          {d.menu.cats.map((c, ci) => (
            <section key={c.id} className="card p-6">
              <div className="flex items-start gap-3"><div className="flex-1"><BiPair ph={t("Category", "التصنيف")} value={c.name} onChange={v => up(x => { x.menu.cats[ci].name = v; })} /></div>
                <button className="mt-3 text-[14px] text-red-700 underline" onClick={() => up(x => { x.menu.cats.splice(ci, 1); x.settings.assign = defaultAssign(x.menu, x.settings.screens); })}>{t("Delete category", "حذف التصنيف")}</button></div>
              <div className="mt-5 grid gap-3">{c.items.map((it, ii) => { const set = (patch: Partial<Item>) => up(x => { Object.assign(x.menu.cats[ci].items[ii], patch); }); return (
                <div key={it.id} className="grid items-center gap-3 border-t border-navy/10 pt-3 md:grid-cols-[58px_1fr_130px_auto]">
                  <PhotoPick value={it.photo} onChange={v => set({ photo: v })} toast={toast} />
                  <BiPair ph={t("Item name", "اسم الصنف")} value={it.name} onChange={v => set({ name: v })} />
                  <label className="flex items-center gap-2"><input className="input ltr" type="number" step="0.1" min="0" value={it.price} onChange={e => set({ price: +e.target.value })} aria-label={t("Price", "السعر")} /><span className="text-[13px] text-slate">{t("OMR", "ر.ع")}</span></label>
                  <div className="flex items-center gap-4 text-[14px]"><label className="flex items-center gap-1.5"><input type="checkbox" className="h-4 w-4 accent-[#00B3A5]" checked={!!it.best} onChange={e => set({ best: e.target.checked })} />{t("Best seller", "الأكثر طلبًا")}</label>
                    <button className="text-red-700 underline" onClick={() => up(x => { x.menu.cats[ci].items.splice(ii, 1); })}>{t("Delete", "حذف")}</button></div>
                </div>); })}</div>
              <button className="mt-4 text-[15px] font-semibold text-teal-700 underline underline-offset-4" onClick={() => up(x => { x.menu.cats[ci].items.push({ id: uid(), name: { en: "", ar: "" }, price: 1 }); })}>{t("Add item", "إضافة صنف")}</button>
            </section>))}
          <button className="btn-line justify-self-start" onClick={() => up(x => { x.menu.cats.push({ id: uid(), name: { en: "New category", ar: "تصنيف جديد" }, items: [] }); x.settings.assign = defaultAssign(x.menu, x.settings.screens); })}>{t("Add category", "إضافة تصنيف")}</button>
        </div>}

        {tab === "billing" && <Billing rec={rec} content={content} toast={toast} />}

        {tab === "offers" && <div className="grid gap-6">
          <section className="card grid gap-4 p-6"><h2 className="text-[19px] font-bold">{t("Announcements", "الإعلانات")}</h2>
            <Field label={t("Opening hours announcement", "إعلان أوقات العمل")}><BiPair ph={t("Hours", "الأوقات")} value={d.menu.hours} onChange={v => up(x => { x.menu.hours = v; })} /></Field>
            <Field label={t("Tagline", "الشعار النصي")}><BiPair ph={t("Tagline", "الشعار")} value={d.menu.tagline} onChange={v => up(x => { x.menu.tagline = v; })} /></Field>
            <Field label={t("Restaurant name on screen", "اسم المطعم على الشاشة")}><BiPair ph={t("Name", "الاسم")} value={d.menu.name} onChange={v => up(x => { x.menu.name = v; })} /></Field></section>
          {d.menu.offers.map((o, oi) => { const set = (patch: Partial<Offer>) => up(x => { Object.assign(x.menu.offers[oi], patch); }); return (
            <section key={o.id} className="card grid gap-4 p-6"><div className="flex items-center justify-between"><h2 className="text-[19px] font-bold">{t("Promotional slide", "شريحة عرض")} {oi + 1}</h2><button className="text-[14px] text-red-700 underline" onClick={() => up(x => { x.menu.offers.splice(oi, 1); })}>{t("Delete", "حذف")}</button></div>
              <div className="grid items-start gap-3 md:grid-cols-[58px_1fr]"><PhotoPick value={o.photo} onChange={v => set({ photo: v })} toast={toast} /><div className="grid gap-3"><BiPair ph={t("Title", "العنوان")} value={o.title} onChange={v => set({ title: v })} /><BiPair ph={t("Details", "التفاصيل")} value={o.text} onChange={v => set({ text: v })} /></div></div>
              <div className="grid gap-4 md:grid-cols-[160px_1fr_130px_130px]">
                <Field label={t("Offer price (OMR)", "سعر العرض (ر.ع)")}><input className="input ltr" type="number" step="0.1" min="0" value={o.price ?? ""} onChange={e => set({ price: e.target.value === "" ? undefined : +e.target.value })} /></Field>
                <div><span className="label">{t("Show on days", "أيام العرض")}</span><div className="flex flex-wrap gap-1.5">{days.map((dn, di) => { const on = !o.days?.length || o.days.includes(di); return <button key={dn} type="button" aria-pressed={on} onClick={() => { const cur = o.days?.length ? o.days : [0, 1, 2, 3, 4, 5, 6]; const nx = cur.includes(di) ? cur.filter(z => z !== di) : [...cur, di]; set({ days: nx.length === 7 ? [] : nx }); }} className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${on ? "bg-navy text-paper" : "bg-mist text-slate"}`}>{dn}</button>; })}</div></div>
                <Field label={t("From", "من")}><input className="input ltr" type="time" value={o.from || ""} onChange={e => set({ from: e.target.value || undefined })} /></Field>
                <Field label={t("To", "إلى")}><input className="input ltr" type="time" value={o.to || ""} onChange={e => set({ to: e.target.value || undefined })} /></Field>
              </div><p className="text-[13.5px] text-slate">{t("Leave days and times empty to show the slide all the time.", "اترك الأيام والأوقات فارغة لعرض الشريحة دائمًا.")}</p></section>); })}
          <button className="btn-line justify-self-start" onClick={() => up(x => { x.menu.offers.push({ id: uid(), title: { en: "New offer", ar: "عرض جديد" }, text: { en: "", ar: "" } }); })}>{t("Add promotional slide", "إضافة شريحة عرض")}</button>
        </div>}

        {tab === "screens" && <div className="grid gap-6 lg:grid-cols-2">
          <section className="card grid content-start gap-5 p-6"><h2 className="text-[19px] font-bold">{t("Design and layout", "التصميم والتوزيع")}</h2>
            <Field label={t("Design", "التصميم")}><select className="input" value={d.settings.designId} onChange={e => up(x => { x.settings.designId = e.target.value; })}>{GROUPS.map(g => <optgroup key={g.id} label={L(g.label)}>{DESIGNS.filter(z => z.group === g.id).map(z => <option key={z.id} value={z.id}>{L(z.name)}</option>)}</optgroup>)}</select></Field>
            <div><span className="label">{t("Number of TV screens", "عدد الشاشات")}</span><div className="flex gap-2">{([1, 2, 3, 4] as const).map(n => <button key={n} aria-pressed={d.settings.screens === n} onClick={() => setScreens(n)} className={`h-12 w-12 rounded-xl font-display text-[18px] font-bold ${d.settings.screens === n ? "bg-navy text-paper" : "bg-mist"}`}>{n}</button>)}</div></div>
            <Field label={t("Seconds per slide", "ثوانٍ لكل شريحة")} hint={t("Default is 10 seconds", "الافتراضي 10 ثوانٍ")}><input className="input ltr max-w-[140px]" type="number" min={3} max={120} value={d.settings.slideSeconds} onChange={e => up(x => { x.settings.slideSeconds = Math.min(120, Math.max(3, +e.target.value || 10)); })} /></Field></section>
          <section className="card grid content-start gap-4 p-6"><h2 className="text-[19px] font-bold">{t("What each screen shows", "محتوى كل شاشة")}</h2>
            {Array.from({ length: d.settings.screens }, (_, si) => (
              <div key={si} className="border-t border-navy/10 pt-3"><b>{t("Screen", "الشاشة")} {si + 1}</b><div className="mt-2 flex flex-wrap gap-2">{d.menu.cats.map(c => { const on = (d.settings.assign[si] || []).includes(c.id); return (
                <button key={c.id} aria-pressed={on} onClick={() => up(x => { const a = x.settings.assign; while (a.length < x.settings.screens) a.push([]); a[si] = on ? a[si].filter(z => z !== c.id) : [...a[si], c.id]; })} className={`rounded-full px-4 py-2 text-[14px] font-semibold ${on ? "bg-teal text-navy" : "bg-mist text-slate"}`}>{L(c.name)}</button>); })}</div>
                {!(d.settings.assign[si] || []).length && <p className="mt-2 text-[13.5px] text-slate">{t("No categories: this screen shows offers and announcements.", "دون تصنيفات: تعرض هذه الشاشة العروض والإعلانات.")}</p>}</div>))}
            <p className="text-[13.5px] text-slate">{t("Promotional slides rotate on the last screen, or on the only screen.", "تتناوب شرائح العروض على الشاشة الأخيرة أو الوحيدة.")}</p></section>
        </div>}

        {tab === "publish" && <div className="grid gap-6">
          <div className="rounded-3xl bg-gradient-to-b from-[#1b2230] to-[#0d1118] p-4 sm:p-8"><div className="mx-auto" style={{ maxWidth: d.settings.screens === 1 ? 980 : undefined }}><TvWall design={design} menu={d.menu} screens={d.settings.screens} assign={d.settings.assign} lang={lang} playing={playing} slideSeconds={d.settings.slideSeconds} /></div></div>
          <div className="flex flex-wrap items-center gap-4"><button className="btn-line" onClick={() => setPlaying(p => !p)}>{playing ? t("Pause preview", "إيقاف المعاينة") : t("Play preview", "تشغيل المعاينة")}</button><button className="btn-dark" disabled={busy} onClick={() => save(true)}>{t("Publish to screens and QR menu", "النشر على الشاشات ومنيو QR")}</button>
            <span className="text-[14.5px] text-slate">{t("This preview shows your draft. Customers see the published version.", "هذه المعاينة تعرض المسودة. يرى الزبائن النسخة المنشورة.")}</span></div>
          {rec?.published_at ? <section className="card grid gap-4 p-6"><h2 className="text-[19px] font-bold">{t("Your links", "روابطك")}</h2>
            <p className="text-slate">{t("Open each screen link in the browser of the TV or the media player connected to it, in full screen.", "افتح رابط كل شاشة في متصفح التلفاز أو المشغّل الموصول به، بملء الشاشة.")}</p>
            {Array.from({ length: d.settings.screens }, (_, i) => <LinkRow key={i} label={`${t("TV screen", "شاشة التلفاز")} ${i + 1}`} url={`${base}#/display/${rec.id}?screen=${i + 1}&of=${d.settings.screens}`} />)}
            <LinkRow label={t("QR mobile menu", "منيو QR للهاتف")} url={`${base}#/m/${rec.id}`} />
          </section> : <p className="rounded-2xl bg-[#FFF5DC] p-4 text-[#6E4A00]">{t("Publish to get the links for your TV screens and QR menu.", "انشر للحصول على روابط شاشاتك ومنيو QR.")}</p>}
        </div>}
      </div>
    </div>
  );
}

function LinkRow({ label, url }: { label: string; url: string }) {
  const { t } = useI18n(); const [ok, setOk] = useState(false);
  return (
    <div className="grid items-center gap-2 border-t border-navy/10 pt-3 sm:grid-cols-[170px_1fr_auto_auto]"><b>{label}</b><code className="truncate rounded-lg bg-mist px-3 py-2 text-[13px]" dir="ltr">{url}</code>
      <button className="text-[14.5px] font-semibold text-teal-700 underline underline-offset-4" onClick={async () => { try { await navigator.clipboard.writeText(url); setOk(true); setTimeout(() => setOk(false), 1800); } catch { /* select manually */ } }}>{ok ? t("Copied", "تم النسخ") : t("Copy", "نسخ")}</button>
      <a className="text-[14.5px] font-semibold underline underline-offset-4" href={url} target="_blank" rel="noopener">{t("Open", "فتح")}</a></div>
  );
}
