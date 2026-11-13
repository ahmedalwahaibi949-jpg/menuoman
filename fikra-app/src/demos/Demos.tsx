import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useI18n } from "../lib/i18n";
import type { DemoKind } from "../lib/content";

const img = (n: string) => `./img/${n}.webp`;
const omr = (n: number) => n.toFixed(3);

/* ------------------------------------------------------------------ 1. Restaurant website */
function RestaurantDemo() {
  const { t } = useI18n();
  const dishes = [
    { k: "salmon", n: t("Grilled salmon", "سلمون مشوي"), p: 6.5, c: "sea" }, { k: "steak", n: t("Steak on rösti", "ستيك على الروستي"), p: 7.5, c: "grill" },
    { k: "alfredo", n: t("Creamy pasta", "باستا كريمية"), p: 4.2, c: "pasta" }, { k: "mushroom", n: t("Mushroom pasta", "باستا بالفطر"), p: 4.5, c: "pasta" }
  ];
  const cats = [["all", t("All", "الكل")], ["sea", t("Seafood", "بحري")], ["grill", t("Grill", "مشويات")], ["pasta", t("Pasta", "باستا")]];
  const [cat, setCat] = useState("all");
  const [booked, setBooked] = useState(false);
  const [guests, setGuests] = useState(2);
  return (
    <div className="bg-[#FBF7F0] text-[#22201C]">
      <div className="flex items-center justify-between px-6 py-4"><b className="font-display text-xl tracking-wide">SAHEL</b><span className="text-sm text-[#7A6F60]">{t("Seafood · Muttrah", "مأكولات بحرية · مطرح")}</span></div>
      <div className="grid gap-6 px-6 pb-6 md:grid-cols-[1.2fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl bg-[#1E2A2B] p-6 text-[#FBF7F0]">
          <p className="text-sm text-[#E2A238]">{t("Open today until 11 pm", "مفتوح اليوم حتى 11 مساءً")}</p>
          <h3 className="mt-2 max-w-[12ch] text-3xl font-extrabold leading-tight">{t("Fresh from the sea, every day.", "طازج من البحر كل يوم.")}</h3>
          <img src={img("salmon")} alt="" className="absolute -bottom-6 -end-6 w-44 animate-float drop-shadow-2xl" />
        </div>
        <form className="rounded-2xl bg-white p-5 shadow-card" onSubmit={e => { e.preventDefault(); setBooked(true); }}>
          <b className="font-display">{t("Book a table", "احجز طاولة")}</b>
          {booked ? <p className="mt-4 rounded-xl bg-[#EAF6EF] p-3 text-sm text-[#155C39]">{t(`Table for ${guests} requested. This is a demo, so nothing was sent.`, `تم طلب طاولة لـ ${guests}. هذا عرض تجريبي ولم يُرسل شيء.`)}</p> : (
            <div className="mt-3 grid gap-3">
              <div className="flex items-center justify-between rounded-xl border border-black/10 px-3 py-2"><span className="text-sm">{t("Guests", "الضيوف")}</span>
                <span className="flex items-center gap-3"><button type="button" className="h-8 w-8 rounded-full bg-[#F1ECE2]" onClick={() => setGuests(g => Math.max(1, g - 1))} aria-label="-">−</button><b className="w-4 text-center tabular-nums">{guests}</b><button type="button" className="h-8 w-8 rounded-full bg-[#F1ECE2]" onClick={() => setGuests(g => Math.min(12, g + 1))} aria-label="+">+</button></span></div>
              <select className="rounded-xl border border-black/10 px-3 py-2.5 text-sm" aria-label={t("Time", "الوقت")}>{["19:00", "19:30", "20:00", "20:30", "21:00"].map(x => <option key={x}>{x}</option>)}</select>
              <button className="rounded-full bg-[#1E2A2B] py-2.5 text-sm font-semibold text-white">{t("Request table", "اطلب الطاولة")}</button>
            </div>)}
        </form>
      </div>
      <div className="px-6 pb-7">
        <div className="mb-3 flex flex-wrap gap-2">{cats.map(([k, l]) => <button key={k} onClick={() => setCat(k)} className={`rounded-full px-4 py-1.5 text-sm ${cat === k ? "bg-[#1E2A2B] text-white" : "bg-white text-[#22201C]"}`}>{l}</button>)}</div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{dishes.filter(d => cat === "all" || d.c === cat).map(d => (
          <div key={d.k} className="rounded-2xl bg-white p-3 text-center" style={{ animation: "rise .5s both" }}><img src={img(d.k)} alt={d.n} className="mx-auto h-24 object-contain transition duration-300 hover:scale-110 hover:rotate-6" /><b className="mt-2 block text-sm">{d.n}</b><span className="text-sm text-[#B4572A]">{omr(d.p)} {t("OMR", "ر.ع")}</span></div>))}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ 2. Real estate */
function EstateDemo() {
  const { t } = useI18n();
  const all = useMemo(() => [
    { id: 1, n: t("Sea-view villa", "فيلا بإطلالة بحرية"), a: t("Al Mouj", "الموج"), type: "villa", beds: 5, p: 420000, hue: 196 },
    { id: 2, n: t("Garden villa", "فيلا بحديقة"), a: t("Al Khoud", "الخوض"), type: "villa", beds: 4, p: 185000, hue: 150 },
    { id: 3, n: t("Marina apartment", "شقة المارينا"), a: t("Al Mouj", "الموج"), type: "apartment", beds: 2, p: 96000, hue: 215 },
    { id: 4, n: t("City apartment", "شقة في المدينة"), a: t("Bawshar", "بوشر"), type: "apartment", beds: 1, p: 48000, hue: 28 },
    { id: 5, n: t("Penthouse", "بنتهاوس"), a: t("Qurum", "القرم"), type: "apartment", beds: 3, p: 210000, hue: 262 },
    { id: 6, n: t("Hillside villa", "فيلا على التل"), a: t("Qurum", "القرم"), type: "villa", beds: 6, p: 560000, hue: 12 }
  ], [t]);
  const [type, setType] = useState("all"); const [beds, setBeds] = useState(0); const [max, setMax] = useState(600000); const [sel, setSel] = useState<number | null>(null);
  const rows = all.filter(x => (type === "all" || x.type === type) && x.beds >= beds && x.p <= max);
  const cur = all.find(x => x.id === sel);
  return (
    <div className="bg-[#0E1116] p-6 text-[#EDE7DB]">
      <div className="flex items-center justify-between"><b className="font-display text-xl tracking-[.3em] text-[#C9A96A]">QIMMA</b><span className="text-sm text-white/50">{t("Luxury homes in Muscat", "منازل فاخرة في مسقط")}</span></div>
      <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-3">
        <label className="text-sm">{t("Type", "النوع")}<select value={type} onChange={e => setType(e.target.value)} className="mt-1 w-full rounded-lg bg-[#1A1F27] px-3 py-2"><option value="all">{t("All", "الكل")}</option><option value="villa">{t("Villa", "فيلا")}</option><option value="apartment">{t("Apartment", "شقة")}</option></select></label>
        <label className="text-sm">{t("Bedrooms", "غرف النوم")}<select value={beds} onChange={e => setBeds(+e.target.value)} className="mt-1 w-full rounded-lg bg-[#1A1F27] px-3 py-2">{[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n === 0 ? t("Any", "أي عدد") : `${n}+`}</option>)}</select></label>
        <label className="text-sm">{t("Budget up to", "الميزانية حتى")} <b className="tabular-nums text-[#C9A96A]">{max.toLocaleString("en")}</b><input type="range" min={40000} max={600000} step={10000} value={max} onChange={e => setMax(+e.target.value)} className="mt-2 w-full accent-[#C9A96A]" /></label>
      </div>
      <p className="mt-4 text-sm text-white/50">{rows.length} {t("properties", "عقارات")}</p>
      <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-3">{rows.map(x => (
        <button key={x.id} onClick={() => setSel(x.id)} className={`overflow-hidden rounded-2xl border text-start transition ${sel === x.id ? "border-[#C9A96A]" : "border-white/10 hover:border-white/30"}`}>
          <div className="relative h-24" style={{ background: `linear-gradient(160deg, hsl(${x.hue} 45% 32%), hsl(${x.hue} 40% 14%))` }}>
            <svg className="absolute bottom-0 left-0 h-16 w-full" viewBox="0 0 200 60" preserveAspectRatio="none"><path d="M0 60V38l30-18 28 12V14l40-12 34 16v14l30-10 38 18v20z" fill="rgba(0,0,0,.35)" /><path d="M58 60V30h12v30zm40 0V20h10v40zm40 0V34h10v26z" fill="rgba(255,255,255,.14)" /></svg></div>
          <div className="p-3"><b className="block text-sm">{x.n}</b><span className="text-xs text-white/50">{x.a} · {x.beds} {t("bed", "غرف")}</span><span className="mt-1 block text-sm tabular-nums text-[#C9A96A]">{x.p.toLocaleString("en")} {t("OMR", "ر.ع")}</span></div>
        </button>))}
        {!rows.length && <p className="col-span-full rounded-xl bg-white/5 p-4 text-sm">{t("No properties match. Widen the filters.", "لا توجد عقارات مطابقة. وسّع الفلاتر.")}</p>}
      </div>
      {cur && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#C9A96A] p-4 text-[#0E1116]"><span><b>{cur.n}</b> · {cur.a}</span><span className="rounded-full bg-[#0E1116] px-4 py-2 text-sm text-white">{t("Request a viewing (demo)", "اطلب معاينة (تجريبي)")}</span></div>}
    </div>
  );
}

/* ------------------------------------------------------------------ 3. Construction */
function ConstructionDemo() {
  const { t } = useI18n();
  const sectors = [[t("Residential", "سكني"), t("Villas and housing compounds from foundation to handover.", "فلل ومجمعات سكنية من الأساس إلى التسليم.")], [t("Commercial", "تجاري"), t("Offices, retail and mixed-use buildings.", "مكاتب ومحلات ومبانٍ متعددة الاستخدام.")], [t("Infrastructure", "بنية أساسية"), t("Roads, utilities and site works.", "طرق ومرافق وأعمال موقع.")], [t("Fit-out", "تشطيبات"), t("Interior works for shops and offices.", "أعمال داخلية للمحلات والمكاتب.")]];
  const stages = [t("Tender", "المناقصة"), t("Design", "التصميم"), t("Structure", "الهيكل"), t("Finishing", "التشطيب"), t("Handover", "التسليم")];
  const [s, setS] = useState(0); const [st, setSt] = useState(2);
  return (
    <div className="bg-[#F3F1EC] text-[#1B1F24]">
      <div className="relative overflow-hidden bg-[#1B1F24] p-6 text-white">
        <div className="flex items-center justify-between"><b className="font-display text-xl"><span className="text-[#F5A524]">BINAA</span> {t("Contracting", "للمقاولات")}</b><span className="rounded-full bg-[#F5A524] px-4 py-1.5 text-sm font-semibold text-[#1B1F24]">{t("Send a tender", "أرسل مناقصة")}</span></div>
        <h3 className="mt-6 max-w-[16ch] text-3xl font-extrabold leading-tight">{t("We build what the drawings promise.", "نبني ما تعد به المخططات.")}</h3>
        <svg className="absolute -bottom-2 end-4 h-28 w-56 opacity-80" viewBox="0 0 220 110" fill="none" stroke="#F5A524" strokeWidth="2"><path d="M20 110V40h50v70M70 110V20h60v90M130 110V56h60v54" /><path d="M150 56V8h46M150 8l-26 22M196 8v16" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "draw 2.4s ease-out forwards" }} /><path d="M34 54h22M34 70h22M34 86h22M84 36h32M84 54h32M84 72h32M84 90h32M144 72h32M144 90h32" strokeOpacity=".5" /></svg>
      </div>
      <div className="grid gap-5 p-6 md:grid-cols-2">
        <div><b className="font-display text-sm uppercase tracking-widest text-[#8A8F96]">{t("Sectors", "القطاعات")}</b>
          <div className="mt-3 grid grid-cols-2 gap-2">{sectors.map(([n], i) => <button key={n} onClick={() => setS(i)} className={`rounded-xl px-3 py-3 text-start text-sm font-semibold transition ${s === i ? "bg-[#1B1F24] text-white" : "bg-white"}`}>{n}</button>)}</div>
          <p className="mt-3 rounded-xl bg-white p-4 text-sm" key={s} style={{ animation: "rise .4s both" }}>{sectors[s][1]}</p></div>
        <div><b className="font-display text-sm uppercase tracking-widest text-[#8A8F96]">{t("Project stages", "مراحل المشروع")}</b>
          <div className="mt-4 flex items-center">{stages.map((n, i) => (
            <button key={n} onClick={() => setSt(i)} className="group flex flex-1 flex-col items-center gap-2" aria-pressed={st === i}>
              <span className="relative flex w-full items-center justify-center"><i className={`absolute h-1 w-full ${i <= st ? "bg-[#F5A524]" : "bg-black/10"}`} /><i className={`relative h-5 w-5 rounded-full border-4 ${i <= st ? "border-[#F5A524] bg-[#1B1F24]" : "border-black/10 bg-white"}`} /></span>
              <span className={`text-xs ${st === i ? "font-bold" : "text-[#8A8F96]"}`}>{n}</span></button>))}</div>
          <p className="mt-4 text-sm text-[#5B6068]">{t("Tap a stage. Clients would see where their project stands.", "اضغط على مرحلة. هكذا يرى العميل أين وصل مشروعه.")}</p></div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ 4. Interactive menu */
function MenuDemo() {
  const { t } = useI18n();
  const dishes = [{ k: "smash", n: t("Smash burger", "برغر سماش"), p: 3.5, d: t("Two patties, melted cheese, special sauce.", "قطعتا لحم وجبن ذائب وصلصة خاصة.") }, { k: "steak", n: t("Steak", "ستيك"), p: 7.5, d: t("Beef on potato rösti with demi-glace.", "لحم بقري على روستي البطاطس مع صلصة الديمي غلاس.") }, { k: "trifle", n: t("Trifle", "ترايفل"), p: 1.8, d: t("Layers of cream, cake and fruit.", "طبقات من الكريمة والكيك والفواكه.") }, { k: "karkade", n: t("Hibiscus", "كركديه"), p: 1.2, d: t("Cold hibiscus with mint.", "كركديه بارد بالنعناع.") }];
  const [i, setI] = useState(0); const [spin, setSpin] = useState(0); const [open, setOpen] = useState(false);
  const d = dishes[i];
  return (
    <div className="grid place-items-center bg-gradient-to-b from-[#10202B] to-[#0A141B] p-6">
      <div className="w-[270px] rounded-[38px] bg-black p-2.5 shadow-2xl">
        <div className="relative h-[520px] overflow-hidden rounded-[30px] bg-[#16303B] text-[#F4EFE6]">
          {!open ? (
            <button className="absolute inset-0 grid place-items-center bg-[#E8B44A] text-[#16303B]" onClick={() => setOpen(true)}>
              <span className="grid justify-items-center gap-3"><b className="font-display text-5xl">{t("MENU", "منيو")}</b><span className="rounded-full bg-[#16303B] px-5 py-2 text-sm text-white">{t("Tap to enter", "المس للدخول")}</span></span></button>
          ) : (
            <div className="flex h-full flex-col p-4" style={{ animation: "rise .5s both" }}>
              <div className="flex gap-2 overflow-x-auto pb-1">{dishes.map((x, j) => <button key={x.k} onClick={() => { setI(j); setSpin(s => s + 1); }} className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${i === j ? "bg-[#E8B44A] text-[#16303B]" : "bg-white/10"}`}>{x.n}</button>)}</div>
              <button className="relative mx-auto mt-4 grid h-56 w-56 place-items-center" onClick={() => setSpin(s => s + 1)} aria-label={t("Spin the dish", "دوّر الطبق")}>
                <i className="absolute inset-4 rounded-full bg-[#E8B44A]/15" />
                <img key={`${i}-${spin}`} src={img(d.k)} alt={d.n} className="relative w-48 drop-shadow-2xl" style={{ animation: "dishIn .8s cubic-bezier(.3,1.4,.5,1) both" }} />
              </button>
              <b className="mt-2 font-display text-2xl">{d.n}</b><p className="mt-1 text-sm text-white/70">{d.d}</p>
              <div className="mt-auto flex items-center justify-between"><span className="font-display text-xl text-[#E8B44A]">{omr(d.p)} <small className="text-xs">{t("OMR", "ر.ع")}</small></span><span className="text-xs text-white/50">{t("Tap the dish", "المس الطبق")}</span></div>
            </div>)}
        </div>
      </div>
      <style>{`@keyframes dishIn{from{transform:scale(.2) rotate(-160deg);opacity:0}to{transform:none;opacity:1}}`}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ 5. Shop */
function ShopDemo() {
  const { t } = useI18n();
  const items = [{ id: "f", n: t("Hojari frankincense", "لبان حوجري"), p: 4.5, hue: 42 }, { id: "h", n: t("Omani halwa", "حلوى عُمانية"), p: 3.2, hue: 22 }, { id: "d", n: t("Khalas dates", "تمر خلاص"), p: 2.8, hue: 30 }, { id: "c", n: t("Omani coffee", "قهوة عُمانية"), p: 3.9, hue: 14 }, { id: "r", n: t("Rose water", "ماء الورد"), p: 2.4, hue: 340 }, { id: "s", n: t("Silver khanjar pin", "دبوس خنجر فضي"), p: 9.5, hue: 205 }];
  const [cart, setCart] = useState<Record<string, number>>({}); const [open, setOpen] = useState(false);
  const count = Object.values(cart).reduce((a, n) => a + n, 0);
  const total = items.reduce((a, x) => a + (cart[x.id] || 0) * x.p, 0);
  const add = (id: string, d: number) => setCart(c => { const n = Math.max(0, (c[id] || 0) + d); const o = { ...c, [id]: n }; if (!n) delete o[id]; return o; });
  return (
    <div className="relative bg-white p-6 text-[#1D1A16]">
      <div className="flex items-center justify-between"><b className="font-display text-xl">SOUQ<span className="text-[#B4572A]">.</span></b>
        <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2 rounded-full bg-[#1D1A16] px-4 py-2 text-sm text-white" aria-expanded={open}>{t("Cart", "السلة")}<b className="grid h-5 min-w-5 place-items-center rounded-full bg-[#E8B44A] px-1 text-xs text-[#1D1A16] tabular-nums">{count}</b></button></div>
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">{items.map(x => (
        <div key={x.id} className="rounded-2xl border border-black/10 p-3">
          <div className="grid aspect-[4/3] place-items-center rounded-xl" style={{ background: `linear-gradient(140deg, hsl(${x.hue} 60% 88%), hsl(${x.hue} 45% 72%))` }}><i className="h-12 w-12 rounded-full" style={{ background: `hsl(${x.hue} 45% 38%)`, boxShadow: `14px 10px 0 hsl(${x.hue} 40% 55%)` }} /></div>
          <b className="mt-2 block text-sm">{x.n}</b>
          <div className="mt-1 flex items-center justify-between"><span className="text-sm tabular-nums text-[#B4572A]">{omr(x.p)} {t("OMR", "ر.ع")}</span>
            <button onClick={() => add(x.id, 1)} className="rounded-full bg-[#F3EFE7] px-3 py-1 text-xs font-semibold hover:bg-[#E8B44A]">{t("Add", "أضف")}</button></div>
        </div>))}</div>
      {open && (
        <div className="absolute end-6 top-16 z-10 w-72 rounded-2xl border border-black/10 bg-white p-4 shadow-card" style={{ animation: "rise .3s both" }}>
          <b className="font-display">{t("Your cart", "سلتك")}</b>
          {count === 0 ? <p className="mt-2 text-sm text-black/50">{t("Empty. Add a product.", "فارغة. أضف منتجًا.")}</p> : (
            <><div className="mt-2 grid gap-2">{items.filter(x => cart[x.id]).map(x => (
              <div key={x.id} className="flex items-center justify-between gap-2 text-sm"><span className="min-w-0 flex-1 truncate">{x.n}</span>
                <span className="flex items-center gap-2"><button className="h-6 w-6 rounded-full bg-[#F3EFE7]" onClick={() => add(x.id, -1)} aria-label="-">−</button><b className="w-4 text-center tabular-nums">{cart[x.id]}</b><button className="h-6 w-6 rounded-full bg-[#F3EFE7]" onClick={() => add(x.id, 1)} aria-label="+">+</button></span></div>))}</div>
              <div className="mt-3 flex justify-between border-t border-black/10 pt-3 font-semibold"><span>{t("Total", "الإجمالي")}</span><span className="tabular-nums">{omr(total)} {t("OMR", "ر.ع")}</span></div>
              <p className="mt-2 text-xs text-black/50">{t("Demo checkout: no payment is taken.", "دفع تجريبي: لا يتم خصم أي مبلغ.")}</p></>)}
        </div>)}
    </div>
  );
}

/* ------------------------------------------------------------------ 6. SaaS dashboard */
function SaasDemo() {
  const { t } = useI18n();
  const data: Record<string, number[]> = { week: [12, 18, 15, 22, 27, 24, 31], month: [40, 52, 47, 63, 58, 71, 69, 84, 78, 92, 88, 101], year: [210, 260, 240, 310, 365, 340, 420, 455, 430, 510, 560, 610] };
  const [range, setRange] = useState<"week" | "month" | "year">("month");
  const [tasks, setTasks] = useState([{ id: 1, n: t("Approve supplier invoice", "اعتماد فاتورة المورّد"), s: 0 }, { id: 2, n: t("Call new customer", "الاتصال بعميل جديد"), s: 0 }, { id: 3, n: t("Update price list", "تحديث قائمة الأسعار"), s: 1 }, { id: 4, n: t("Send monthly report", "إرسال التقرير الشهري"), s: 2 }]);
  const v = data[range], mx = Math.max(...v), sum = v.reduce((a, b) => a + b, 0);
  const cols = [t("To do", "للتنفيذ"), t("In progress", "قيد التنفيذ"), t("Done", "منجز")];
  const pts = v.map((y, i) => `${(i / (v.length - 1)) * 300},${90 - (y / mx) * 78}`).join(" ");
  return (
    <div className="grid bg-[#F4F6FA] text-[#101828] md:grid-cols-[150px_1fr]">
      <aside className="hidden bg-[#101828] p-4 text-white/70 md:block"><b className="font-display text-white">MIZAN</b><ul className="mt-5 grid gap-1 text-sm">{[t("Overview", "نظرة عامة"), t("Orders", "الطلبات"), t("Customers", "العملاء"), t("Reports", "التقارير")].map((x, i) => <li key={x} className={`rounded-lg px-3 py-2 ${i === 0 ? "bg-white/10 text-white" : ""}`}>{x}</li>)}</ul></aside>
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><b className="font-display text-lg">{t("Overview", "نظرة عامة")}</b>
          <div className="flex rounded-full bg-white p-1 text-xs shadow-sm">{(["week", "month", "year"] as const).map(r => <button key={r} onClick={() => setRange(r)} className={`rounded-full px-3 py-1.5 ${range === r ? "bg-[#101828] text-white" : ""}`}>{{ week: t("Week", "أسبوع"), month: t("Month", "شهر"), year: t("Year", "سنة") }[r]}</button>)}</div></div>
        <div className="mt-4 grid grid-cols-3 gap-3">{[[t("Revenue", "الإيرادات"), `${(sum * 12.5).toLocaleString("en")} `, t("OMR", "ر.ع")], [t("Orders", "الطلبات"), String(sum), ""], [t("Avg. order", "متوسط الطلب"), "12.500", t("OMR", "ر.ع")]].map(([l, n, u]) => (
          <div key={l} className="rounded-xl bg-white p-3 shadow-sm"><span className="text-xs text-black/50">{l}</span><b className="block font-display text-lg tabular-nums" key={n}>{n}<small className="text-xs font-normal">{u}</small></b></div>))}</div>
        <div className="mt-3 rounded-xl bg-white p-4 shadow-sm">
          <svg viewBox="0 0 300 96" className="h-28 w-full" preserveAspectRatio="none" key={range}><polyline points={pts} fill="none" stroke="#00B3A5" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="700" strokeDashoffset="700" style={{ animation: "draw 1.2s ease-out forwards" }} /><polygon points={`0,96 ${pts} 300,96`} fill="#00D6C5" opacity=".12" /></svg>
          <p className="text-xs text-black/40">{t("Sample data for demonstration", "بيانات نموذجية للعرض")}</p></div>
        <div className="mt-3 grid grid-cols-3 gap-3">{cols.map((c, ci) => (
          <div key={c} className="rounded-xl bg-white/70 p-2"><b className="px-1 text-xs text-black/50">{c}</b>
            {tasks.filter(x => x.s === ci).map(x => <button key={x.id} onClick={() => setTasks(ts => ts.map(y => y.id === x.id ? { ...y, s: (y.s + 1) % 3 } : y))} className="mt-2 block w-full rounded-lg bg-white p-2 text-start text-xs shadow-sm hover:ring-2 hover:ring-[#00D6C5]" title={t("Click to move", "اضغط للنقل")}>{x.n}</button>)}</div>))}</div>
      </div>
    </div>
  );
}

const MAP: Record<DemoKind, () => ReactNode> = { restaurant: RestaurantDemo, estate: EstateDemo, construction: ConstructionDemo, menu: MenuDemo, shop: ShopDemo, saas: SaasDemo };
export function Demo({ kind }: { kind: DemoKind }) { const C = MAP[kind]; return <C />; }

/** A non-interactive, scaled-down render of a demo, for portfolio cards. */
export function DemoThumb({ kind }: { kind: DemoKind }) {
  const box = useRef<HTMLDivElement>(null); const [s, setS] = useState(0.4);
  useEffect(() => { const el = box.current; if (!el) return; const ro = new ResizeObserver(() => setS(el.clientWidth / 900)); ro.observe(el); setS(el.clientWidth / 900); return () => ro.disconnect(); }, []);
  return (
    <div ref={box} className="relative aspect-[16/10] w-full overflow-hidden bg-mist" aria-hidden="true">
      <div className="pointer-events-none absolute left-0 top-0 w-[900px] origin-top-left" style={{ transform: `scale(${s})` }} dir="ltr"><Demo kind={kind} /></div>
    </div>
  );
}
