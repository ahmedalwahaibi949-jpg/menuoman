// Self-service subscription: free trial, bank-transfer receipts, and the administrator's one-click approval.
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { api, boardAccess, TRIAL_DAYS, type BoardRec, type Payment, type User } from "../lib/store";
import { planOf, type Content } from "../lib/content";
import { Arrow, Check } from "../components/ui";

const PACKS = [1, 3, 12] as const;
/** Twelve months are charged as ten. */
export const packPrice = (monthly: number, months: number) => +(months === 12 ? monthly * 10 : monthly * months).toFixed(3);
const day = (iso: string, lang: string) => new Date(iso).toLocaleDateString(lang === "ar" ? "ar-OM" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
const omr = (n: number) => n.toFixed(3);
type Toast = (m: string, bad?: boolean) => void;

function useAccessText() {
  const { t, lang } = useI18n();
  return (b: Pick<BoardRec, "status" | "paid_until" | "created_at">) => {
    const a = boardAccess(b);
    if (a.kind === "paused") return { tone: "bad", text: t("Paused by the administrator.", "موقوف من الإدارة.") };
    if (a.kind === "expired") return { tone: "bad", text: t("Subscription ended. Your screens and QR menu are hidden until you renew.", "انتهى الاشتراك. شاشاتك ومنيو QR مخفية حتى تجدّد.") };
    if (a.kind === "trial") return { tone: "warn", text: `${t("Free trial until", "تجربة مجانية حتى")} ${day(a.until!, lang)}` };
    return { tone: "ok", text: a.until ? `${t("Active until", "نشط حتى")} ${day(a.until, lang)}` : t("Active", "نشط") };
  };
}
const TONE: Record<string, string> = { ok: "bg-teal-soft text-teal-700", warn: "bg-[#FFF5DC] text-[#6E4A00]", bad: "bg-red-50 text-red-800" };

/** One-line subscription state shown at the top of the restaurant dashboard. */
export function AccessBadge({ rec }: { rec: BoardRec }) {
  const a = useAccessText()(rec);
  return <span className={`chip ${TONE[a.tone]}`}>{a.text}</span>;
}

/* ------------------------------------------------------------------ restaurant: subscription tab */
export function Billing({ rec, content, toast }: { rec: BoardRec | null; content: Content; toast: Toast }) {
  const { t, lang } = useI18n(); const text = useAccessText(); const plan = planOf(content);
  const [months, setMonths] = useState<number>(1); const [file, setFile] = useState<File | null>(null); const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<Payment[]>([]);
  const load = useCallback(() => { if (rec) api.paymentsMine().then(setRows).catch(() => undefined); }, [rec]);
  useEffect(load, [load]);
  if (!rec) return <p className="rounded-2xl bg-[#FFF5DC] p-5 text-[#6E4A00]">{t(`Save your menu first. Your ${TRIAL_DAYS}-day free trial starts when you save.`, `احفظ المنيو أولًا. تبدأ تجربتك المجانية لمدة ${TRIAL_DAYS} يومًا عند الحفظ.`)}</p>;
  const a = text(rec), pending = rows.some(r => r.status === "pending"), amount = packPrice(plan.monthly, months), hasBank = !!plan.bank.account.trim();
  const label: Record<Payment["status"], string> = { pending: t("Waiting for confirmation", "بانتظار التأكيد"), approved: t("Confirmed", "تم التأكيد"), rejected: t("Not accepted", "لم يُقبل") };
  async function send() {
    if (!file) { toast(t("Attach a photo of your transfer receipt.", "أرفق صورة إيصال التحويل."), true); return; }
    if (!file.type.startsWith("image/")) { toast(t("The receipt must be a photo or screenshot (JPG or PNG).", "يجب أن يكون الإيصال صورة أو لقطة شاشة."), true); return; }
    if (file.size > 6 * 1048576) { toast(t("That file is over 6 MB.", "حجم الملف أكبر من 6 ميجابايت."), true); return; }
    setBusy(true);
    try { await api.paymentSubmit(rec!.id, months, amount, file); setFile(null); load(); toast(t("Receipt sent. We confirm it within one working day.", "تم إرسال الإيصال. نؤكده خلال يوم عمل واحد.")); }
    catch { toast(t("Could not send the receipt. Try again.", "تعذّر إرسال الإيصال. حاول مجددًا."), true); }
    setBusy(false);
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <section className="card grid content-start gap-5 p-6">
        <div><h2 className="text-[19px] font-bold">{t("Your subscription", "اشتراكك")}</h2><p className={`mt-3 rounded-xl p-3 text-[15px] font-semibold ${TONE[a.tone]}`}>{a.text}</p></div>
        <div><span className="label">{t("Choose a period", "اختر المدة")}</span>
          <div className="grid gap-3 sm:grid-cols-3">{PACKS.map(m => (
            <button key={m} type="button" aria-pressed={months === m} onClick={() => setMonths(m)} className={`rounded-2xl border p-4 text-start transition ${months === m ? "border-teal-600 bg-teal-soft" : "border-navy/15 bg-white hover:border-navy/40"}`}>
              <b className="block text-[15px]">{m === 1 ? t("1 month", "شهر واحد") : m === 3 ? t("3 months", "3 أشهر") : t("12 months", "12 شهرًا")}</b>
              <span className="mt-1 block font-display text-[24px] font-extrabold tabular-nums" dir="ltr">{omr(packPrice(plan.monthly, m))} <small className="text-[12px] font-semibold text-slate">OMR</small></span>
              {m === 12 && <span className="mt-1 block text-[12.5px] font-semibold text-teal-700">{t("2 months free", "شهران مجانًا")}</span>}
            </button>))}</div></div>
        <div className="rounded-2xl bg-mist p-5"><h3 className="font-bold">{t("Pay by bank transfer", "ادفع بتحويل بنكي")}</h3>
          {hasBank ? <dl className="mt-3 grid gap-2 text-[15px]">
            {plan.bank.bank && <div className="flex justify-between gap-4"><dt className="text-slate">{t("Bank", "البنك")}</dt><dd className="font-semibold">{plan.bank.bank}</dd></div>}
            {plan.bank.holder && <div className="flex justify-between gap-4"><dt className="text-slate">{t("Account name", "اسم الحساب")}</dt><dd className="font-semibold">{plan.bank.holder}</dd></div>}
            <div className="flex justify-between gap-4"><dt className="text-slate">{t("Account number", "رقم الحساب")}</dt><dd className="font-semibold" dir="ltr">{plan.bank.account}</dd></div>
            <div className="flex justify-between gap-4 border-t border-navy/10 pt-2"><dt className="text-slate">{t("Amount", "المبلغ")}</dt><dd className="font-bold" dir="ltr">{omr(amount)} OMR</dd></div>
          </dl> : <p className="mt-2 text-[15px] text-slate">{t("Bank details are not published yet.", "لم تُنشر بيانات البنك بعد.")} <Link className="font-semibold text-teal-700 underline" to="/contact">{t("Contact us to subscribe", "تواصل معنا للاشتراك")}</Link></p>}
        </div>
        {hasBank && (pending
          ? <p className="rounded-xl bg-[#FFF5DC] p-4 text-[15px] text-[#6E4A00]">{t("We have your receipt. Your subscription is extended as soon as we confirm the transfer.", "استلمنا إيصالك. يُمدَّد اشتراكك فور تأكيد التحويل.")}</p>
          : <div className="grid gap-3"><label className="block"><span className="label">{t("Transfer receipt (photo or screenshot)", "إيصال التحويل (صورة أو لقطة شاشة)")}</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" className="input !h-auto !py-3" onChange={e => setFile(e.target.files?.[0] || null)} /></label>
            <button className="btn-dark justify-self-start" disabled={busy} onClick={send}>{busy ? t("Sending…", "جارٍ الإرسال…") : t("Send receipt", "إرسال الإيصال")}</button></div>)}
      </section>
      <section className="card content-start p-6"><h2 className="text-[19px] font-bold">{t("Payments", "المدفوعات")}</h2>
        {rows.length ? <ul className="mt-3 grid gap-0">{rows.map(r => <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-navy/10 py-3 text-[15px]">
          <span><b dir="ltr">{omr(r.amount)} OMR</b> · {r.months} {t("mo", "شهر")}<span className="block text-[13px] text-slate">{day(r.created_at, lang)}</span></span>
          <span className={`chip ${r.status === "approved" ? TONE.ok : r.status === "rejected" ? TONE.bad : TONE.warn}`}>{label[r.status]}</span></li>)}</ul>
          : <p className="mt-2 text-slate">{t("No payments yet.", "لا توجد مدفوعات بعد.")}</p>}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ administrator: confirm transfers */
export function AdminPayments({ boards, users, toast, reload }: { boards: BoardRec[]; users: User[]; toast: Toast; reload: () => Promise<void> }) {
  const { t, lang } = useI18n(); const [rows, setRows] = useState<Payment[]>([]); const [view, setView] = useState<string | null>(null);
  const load = useCallback(() => { api.paymentsAll().then(setRows).catch(() => undefined); }, []);
  useEffect(load, [load, boards]);
  const decide = async (p: Payment, ok: boolean) => {
    try { await api.paymentDecide(p.id, ok); toast(ok ? t("Confirmed. The subscription is extended.", "تم التأكيد وتمديد الاشتراك.") : t("Marked as not accepted.", "تم التعليم كغير مقبول.")); load(); await reload(); }
    catch { toast(t("That didn't work. Try again.", "لم ينجح ذلك. حاول مجددًا."), true); }
  };
  const show = async (p: Payment) => { try { setView(await api.receiptUrl(p.receipt)); } catch { toast(t("Could not open the receipt.", "تعذّر فتح الإيصال."), true); } };
  const pending = rows.filter(r => r.status === "pending"), done = rows.filter(r => r.status !== "pending").slice(0, 12);
  const row = (p: Payment) => { const b = boards.find(x => x.id === p.board_id); return (
    <tr key={p.id}><td className="font-semibold">{b?.restaurant || "—"}</td><td>{users.find(u => u.id === p.owner_id)?.full_name || "—"}</td><td className="tabular-nums" dir="ltr">{omr(p.amount)} OMR</td><td>{p.months}</td><td>{day(p.created_at, lang)}</td>
      <td><button className="underline" onClick={() => show(p)}>{t("View receipt", "عرض الإيصال")}</button></td>
      <td>{p.status === "pending" ? <span className="flex gap-2"><button className="btn-dark !min-h-[38px] !px-4 !text-[13.5px]" onClick={() => decide(p, true)}>{t("Confirm", "تأكيد")}</button><button className="btn-line !min-h-[38px] !px-4 !text-[13.5px]" onClick={() => decide(p, false)}>{t("Reject", "رفض")}</button></span>
        : <span className={`chip ${p.status === "approved" ? TONE.ok : TONE.bad}`}>{p.status === "approved" ? t("Confirmed", "مؤكد") : t("Rejected", "مرفوض")}</span>}</td></tr>); };
  return (
    <section className="card p-6"><h2 className="text-[19px] font-bold">{t("Transfers to confirm", "تحويلات بانتظار التأكيد")} {pending.length > 0 && <span className="chip ms-2 bg-teal text-navy">{pending.length}</span>}</h2>
      <p className="mt-1 text-[14.5px] text-slate">{t("Check the amount arrived in your bank account, then confirm. Confirming extends the restaurant's subscription automatically.", "تحقق من وصول المبلغ إلى حسابك البنكي ثم أكّد. التأكيد يمدّد اشتراك المطعم تلقائيًا.")}</p>
      {rows.length ? <div className="mt-4 overflow-x-auto"><table className="tbl"><thead><tr><th>{t("Restaurant", "المطعم")}</th><th>{t("Owner", "المالك")}</th><th>{t("Amount", "المبلغ")}</th><th>{t("Months", "الأشهر")}</th><th>{t("Sent", "أُرسل")}</th><th></th><th></th></tr></thead>
        <tbody>{pending.map(row)}{done.map(row)}</tbody></table></div> : <p className="mt-3 text-slate">{t("No transfers yet.", "لا توجد تحويلات بعد.")}</p>}
      {view && <div className="fixed inset-0 z-[95] grid place-items-center bg-navy/80 p-5" role="dialog" aria-modal="true" aria-label={t("Receipt", "الإيصال")} onClick={() => setView(null)}>
        <div className="max-h-full overflow-auto rounded-2xl bg-white p-3" onClick={e => e.stopPropagation()}><img src={view} alt={t("Transfer receipt", "إيصال التحويل")} className="max-h-[78vh] max-w-full" />
          <button className="btn-dark mt-3 w-full" onClick={() => setView(null)}>{t("Close", "إغلاق")}</button></div></div>}
    </section>
  );
}

/* ------------------------------------------------------------------ public: how it works + price */
export function PlanSection({ content }: { content: Content }) {
  const { t } = useI18n(); const plan = planOf(content);
  const steps = [
    [t("Pick a design", "اختر تصميمًا"), t("Choose one of the 30 designs and open the dashboard.", "اختر أحد التصاميم الثلاثين وافتح لوحة المطعم.")],
    [t("Add your menu", "أضف قائمتك"), t("Type your dishes and prices, upload your photos, add offers.", "اكتب أطباقك وأسعارك وارفع صورك وأضف عروضك.")],
    [t("Publish", "انشر"), t("Open the link on your TV and print the QR code. Both update when you change a price.", "افتح الرابط على شاشتك واطبع رمز QR. يتحدّث الاثنان عند تغيير أي سعر.")]
  ];
  const inc = [t("TV menu screens, up to 4", "شاشات منيو حتى 4 شاشات"), t("QR menu for phones", "منيو QR للهواتف"), t("All 30 designs, switch any time", "كل التصاميم الثلاثين مع التبديل متى شئت"), t("Arabic and English", "العربية والإنجليزية"), t("Unlimited price and menu changes", "تعديلات غير محدودة على الأسعار والقائمة"), t("Offers that show by day and time", "عروض تظهر حسب اليوم والوقت")];
  return (
    <section className="bg-mist py-16 lg:py-20" id="plan">
      <div className="container-x grid items-start gap-10 lg:grid-cols-[1.15fr_.85fr]">
        <div><p className="eyebrow">{t("Do it yourself", "أنشئه بنفسك")}</p><h2 className="h-sec mt-3">{t("Your menu on screen in three steps.", "قائمتك على الشاشة في ثلاث خطوات.")}</h2>
          <ol className="mt-8 grid gap-0">{steps.map(([a, b], i) => <li key={a} className="flex gap-5 border-t border-navy/10 py-5"><span className="font-display text-[15px] font-bold text-teal-700">0{i + 1}</span><div><h3 className="text-[20px] font-bold">{a}</h3><p className="mt-1 text-slate">{b}</p></div></li>)}</ol></div>
        <div className="card p-7"><p className="eyebrow">{t("One plan", "باقة واحدة")}</p>
          <p className="mt-3 font-display text-[52px] font-extrabold leading-none tabular-nums" dir="ltr">{omr(plan.monthly)} <span className="text-[16px] font-semibold text-slate">OMR / {t("month", "شهر")}</span></p>
          <p className="mt-2 text-slate">{t(`Free for the first ${TRIAL_DAYS} days. No card needed.`, `مجانًا لأول ${TRIAL_DAYS} يومًا. لا تحتاج بطاقة.`)}</p>
          <ul className="mt-5 grid gap-2.5">{inc.map(x => <li key={x} className="flex gap-2.5"><Check /><span>{x}</span></li>)}</ul>
          <Link to="/studio" className="btn-dark mt-7 w-full">{t("Start free", "ابدأ مجانًا")} <Arrow /></Link>
          <p className="mt-3 text-center text-[13.5px] text-slate">{t("Pay by bank transfer when the trial ends.", "ادفع بتحويل بنكي عند انتهاء التجربة.")}</p></div>
      </div>
    </section>
  );
}
