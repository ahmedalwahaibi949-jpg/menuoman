import { useEffect, useMemo, useRef, useState } from "react";
import { PlanSection } from "./Billing";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useI18n, useSeo, type Lang } from "../lib/i18n";
import { useApp } from "../lib/app";
import { api, type BoardData } from "../lib/store";
import { Arrow, Field } from "../components/ui";
import { Screen, photoUrl } from "./Board";
import { BOARD_FONTS, DESIGNS, GROUPS, activeOffers, defaultAssign, designById, type Design, type Menu, type Settings } from "./boards";

export function useBoardFonts() {
  useEffect(() => { if (document.getElementById("board-fonts")) return; const l = document.createElement("link"); l.id = "board-fonts"; l.rel = "stylesheet"; l.href = BOARD_FONTS; document.head.appendChild(l); }, []);
}

/** One or more televisions on a wall, each showing its assigned categories. */
export function TvWall({ design, menu, screens, assign, lang, playing, slideSeconds, bare = false }: { design: Design; menu: Menu; screens: number; assign?: string[][]; lang: Lang; playing: boolean; slideSeconds: number; bare?: boolean }) {
  const a = assign && assign.length === screens ? assign : defaultAssign(menu, screens);
  const cols = screens === 4 ? 2 : screens;
  return (
    <div className="grid w-full" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: bare ? 0 : screens > 1 ? 14 : 0 }}>
      {a.map((ids, i) => (
        <div key={i} className={bare ? "" : "rounded-[10px] bg-[#0b0b0d] p-[7px] shadow-[0_30px_60px_-28px_rgba(0,0,0,.8)] ring-1 ring-white/10"}>
          <Screen design={design} menu={menu} catIds={ids} lang={lang} playing={playing} slideSeconds={slideSeconds} screen={i + 1} of={screens} showOffers={screens === 1 || i === screens - 1} />
          {!bare && <div className="mx-auto mt-[5px] h-[3px] w-10 rounded bg-white/20" />}
        </div>
      ))}
    </div>
  );
}

/** Mounts its children only once scrolled near, so 30 live boards do not all render at once. */
function Lazy({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null); const [on, setOn] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; if (typeof IntersectionObserver === "undefined") { setOn(true); return; } const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { setOn(true); io.disconnect(); } }, { rootMargin: "400px" }); io.observe(el); return () => io.disconnect(); }, []);
  return <div ref={ref} className="aspect-video w-full bg-navy-800">{on && children}</div>;
}

/** A wall of screens in 3D that leans toward the pointer. */
function Wall3D({ lang }: { lang: Lang }) {
  const ref = useRef<HTMLDivElement>(null);
  const picks = useMemo(() => ["urban-burger", "matcha-bar", "arabian-luxury", "tropical-juice", "black-gold", "italian-pizza"].map(id => designById(id)!).filter(Boolean), []);
  useEffect(() => {
    const el = ref.current; if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (e: PointerEvent) => { const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.setProperty("--ry", `${x * 16}deg`); el.style.setProperty("--rx", `${-y * 10}deg`); };
    const leave = () => { el.style.setProperty("--ry", "0deg"); el.style.setProperty("--rx", "0deg"); };
    el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  }, []);
  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[560px]" style={{ perspective: "1400px" }} aria-hidden="true">
      <div className="grid grid-cols-2 gap-4 transition-transform duration-300 ease-out" style={{ transform: "rotateX(var(--rx, 4deg)) rotateY(var(--ry, -14deg))", transformStyle: "preserve-3d" }}>
        {picks.map((d, i) => (
          <div key={d.id} className="rounded-lg bg-black p-1.5 shadow-glow ring-1 ring-white/10" style={{ transform: `translateZ(${[60, 20, 0, 80, 40, 10][i]}px)`, animation: `float ${7 + i}s ease-in-out ${-i * 1.3}s infinite` }}>
            <Screen design={d} menu={d.menu} catIds={d.menu.cats.map(c => c.id)} lang={lang} playing slideSeconds={6 + i} />
          </div>))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ gallery */
export function BoardsGallery() {
  const { t, L, lang } = useI18n(); const { content } = useApp(); useBoardFonts();
  useSeo(t("TV Menu Boards · Digital Menu Screens for Restaurants in Oman · FIKRA DIGITAL", "شاشات المنيو الرقمية للمطاعم في عُمان · فكرة الرقمية"), t("30 digital TV menu board designs for restaurants, cafés and fast-food outlets in Oman, linked to your QR menu.", "30 تصميمًا لشاشات المنيو الرقمية للمطاعم والمقاهي في عُمان، مرتبطة بمنيو QR."));
  const [g, setG] = useState("all");
  const hidden = content.boards?.hidden || [];
  const rows = DESIGNS.filter(d => !hidden.includes(d.id) && (g === "all" || d.group === g));
  return (
    <>
      <section className="dark-sec grid-glow">
        <div className="container-x relative grid items-center gap-14 py-16 lg:grid-cols-[1fr_1fr] lg:py-24">
          <div>
            <p className="eyebrow !text-teal animate-rise">{t("FIKRA Menu Studio · TV menu boards", "استوديو المنيو · شاشات المنيو")}</p>
            <h1 className="mt-4 font-display text-[clamp(36px,5.6vw,68px)] font-extrabold leading-[1.04] animate-rise" style={{ animationDelay: "80ms" }}>{t("Turn your restaurant TVs into ", "حوّل شاشات مطعمك إلى ")}<span className="bg-gradient-to-r from-teal to-[#7CF3E8] bg-clip-text text-transparent">{t("menu boards that sell.", "منيو يبيع.")}</span></h1>
            <p className="mt-5 max-w-[52ch] text-[19px] text-paper/75 animate-rise" style={{ animationDelay: "160ms" }}>{t("Digital menus designed for large landscape screens behind the counter. Customers read your food, prices and offers while they wait. Change a price once and it updates on the TV and the QR menu.", "قوائم رقمية مصممة للشاشات الأفقية الكبيرة خلف الكاونتر. يقرأ الزبون أطباقك وأسعارك وعروضك وهو ينتظر. غيّر السعر مرة واحدة فيتحدّث في الشاشة ومنيو QR.")}</p>
            <div className="mt-8 flex flex-wrap gap-3 animate-rise" style={{ animationDelay: "240ms" }}><a href="#designs" className="btn-primary">{t("See the 30 designs", "شاهد 30 تصميمًا")} <Arrow /></a><Link to="/studio" className="btn-ghost">{t("Start free for 14 days", "ابدأ مجانًا 14 يومًا")}</Link></div>
          </div>
          <Wall3D lang={lang} />
        </div>
      </section>

      <PlanSection content={content} />

      <section className="container-x py-16" id="designs">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("Categories", "التصنيفات")}>
          {[{ id: "all", label: { en: "All", ar: "الكل" } }, ...GROUPS].map(c => <button key={c.id} role="tab" aria-selected={g === c.id} onClick={() => setG(c.id)} className={`rounded-full px-5 py-2.5 text-[15px] font-semibold transition ${g === c.id ? "bg-navy text-paper" : "bg-white text-ink hover:bg-mist"}`}>{L(c.label)}</button>)}
        </div>
        <p className="mt-4 text-slate">{rows.length} {t("designs. Sample menus and prices are for demonstration.", "تصميمًا. القوائم والأسعار نموذجية للعرض.")}</p>
        <div className="mt-8 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(d => (
            <article key={d.id} className="card group overflow-hidden">
              <Link to={`/menu-boards/${d.id}`} className="block bg-black p-2" aria-label={`${t("Preview", "معاينة")} ${L(d.name)}`}><Lazy><Screen design={d} menu={d.menu} catIds={d.menu.cats.map(c => c.id)} lang={lang} playing={false} slideSeconds={10} /></Lazy></Link>
              <div className="flex items-center justify-between gap-3 p-5">
                <div className="min-w-0"><span className="text-[13px] font-semibold text-teal-700">{L(GROUPS.find(x => x.id === d.group)!.label)}</span><h2 className="truncate text-[19px] font-bold">{L(d.name)}</h2></div>
                <Link to={`/menu-boards/${d.id}`} className="btn-dark !min-h-[42px] flex-none !px-5 !text-[14px]">{t("Preview Design", "معاينة التصميم")}</Link>
              </div>
            </article>))}
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ preview */
export function BoardPreview() {
  const { id } = useParams(); const { t, L, lang } = useI18n(); const { content } = useApp(); useBoardFonts();
  const d = designById(id || "");
  const [screens, setScreens] = useState(1); const [playing, setPlaying] = useState(true); const [bl, setBl] = useState<Lang>(lang); const [res, setRes] = useState<"fhd" | "4k">("fhd");
  const wall = useRef<HTMLDivElement>(null);
  useSeo(d ? `${d.name.en} · ${t("TV Menu Board", "شاشة منيو")} · FIKRA DIGITAL` : "FIKRA DIGITAL");
  useEffect(() => setBl(lang), [lang]);
  if (!d) return <div className="container-x py-28 text-center"><h1 className="h-sec">{t("Design not found", "التصميم غير موجود")}</h1><Link to="/menu-boards" className="btn-dark mt-8">{t("All designs", "كل التصاميم")}</Link></div>;
  const full = async () => { try { await wall.current?.requestFullscreen(); } catch { location.hash = `#/display/concept-${d.id}?of=${screens}`; } };
  const pr = content.boards?.pricing;
  const Seg = <T extends string | number>({ value, opts, onChange, label }: { value: T; opts: [T, string][]; onChange: (v: T) => void; label: string }) => (
    <div className="flex rounded-full bg-white/10 p-1" role="group" aria-label={label}>{opts.map(([v, l]) => <button key={String(v)} onClick={() => onChange(v)} aria-pressed={value === v} className={`rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold transition ${value === v ? "bg-teal text-navy" : "text-paper/80 hover:text-paper"}`}>{l}</button>)}</div>);
  return (
    <>
      <section className="dark-sec">
        <div className="container-x relative py-10">
          <Link to="/menu-boards" className="text-[14.5px] text-paper/60 hover:text-paper">← {t("All designs", "كل التصاميم")}</Link>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow !text-teal">{L(GROUPS.find(x => x.id === d.group)!.label)}</p><h1 className="mt-1 font-display text-[clamp(30px,4.4vw,50px)] font-extrabold">{L(d.name)}</h1></div>
            <span className="rounded-full bg-white/10 px-4 py-1.5 text-[13px] text-paper/70" dir="ltr">{res === "fhd" ? "1920 × 1080 · Full HD" : "3840 × 2160 · 4K"} · 16:9</span></div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Seg label={t("Screens", "الشاشات")} value={screens} onChange={setScreens} opts={[[1, t("1 screen", "شاشة")], [2, "2"], [3, "3"], [4, "4"]]} />
            <button onClick={() => setPlaying(p => !p)} className="rounded-full bg-white/10 px-4 py-2 text-[13.5px] font-semibold text-paper hover:bg-white/20" aria-pressed={playing}>{playing ? t("❚❚ Pause", "❚❚ إيقاف") : t("▶ Play", "▶ تشغيل")}</button>
            <Seg label={t("Language", "اللغة")} value={bl} onChange={setBl} opts={[["en", "English"], ["ar", "العربية"]]} />
            <Seg label={t("Resolution", "الدقة")} value={res} onChange={setRes} opts={[["fhd", "Full HD"], ["4k", "4K"]]} />
          </div>
          {/* the wall */}
          <div ref={wall} className="mt-6 rounded-3xl bg-gradient-to-b from-[#1b2230] to-[#0d1118] p-4 sm:p-8 [&:fullscreen]:grid [&:fullscreen]:place-items-center [&:fullscreen]:rounded-none [&:fullscreen]:p-0">
            <div className="mx-auto w-full" style={{ maxWidth: screens === 1 ? 1040 : undefined }}><TvWall design={d} menu={d.menu} screens={screens} lang={bl} playing={playing} slideSeconds={res === "4k" ? 10 : 10} /></div>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <button onClick={full} className="btn-primary">{t("View Full Screen", "عرض بملء الشاشة")}</button>
            <Link to={`/studio?design=${d.id}`} className="btn-ghost">{t("Customize This Design", "خصّص هذا التصميم")}</Link>
            <a href="#quote" className="btn-ghost">{t("Request a Quote", "اطلب عرض سعر")}</a>
            <Link to={`/display/concept-${d.id}?of=${screens}`} className="self-center text-[14.5px] text-paper/60 underline underline-offset-4 hover:text-paper">{t("Open display mode", "فتح وضع العرض")}</Link>
          </div>
        </div>
      </section>
      <section className="container-x grid gap-12 py-16 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h2 className="font-display text-[26px] font-extrabold">{t("What you get", "ماذا تحصل عليه")}</h2>
          <ul className="mt-5 grid gap-3 text-[17px]">{[
            t("A design made for landscape TV screens, not a stretched phone menu", "تصميم مخصص للشاشات الأفقية، لا منيو هاتف ممدود"),
            t("Your dishes, prices and photos in Arabic and English", "أطباقك وأسعارك وصورك بالعربية والإنجليزية"),
            t("One, two, three or four screens with different content on each", "شاشة واحدة أو اثنتان أو ثلاث أو أربع بمحتوى مختلف لكل شاشة"),
            t("Rotating promotional slides and best-seller highlights", "شرائح عروض متناوبة وإبراز الأكثر طلبًا"),
            t("A dashboard to change prices and offers yourself", "لوحة تحكم لتغيير الأسعار والعروض بنفسك"),
            t("The same menu on your QR code, updated together", "المنيو نفسه على كود QR ويتحدّثان معًا")].map(x => <li key={x} className="flex gap-3"><span className="mt-2.5 h-2 w-2 flex-none rounded-full bg-teal" />{x}</li>)}</ul>
          <div className="mt-8 rounded-2xl bg-mist p-6"><b className="font-display">{t("Price", "السعر")}</b><p className="mt-1 text-slate">{pr?.setup ? <>{t("Design and setup from", "التصميم والإعداد من")} <b className="text-ink">{pr.setup} {t("OMR", "ر.ع")}</b>{pr.monthly ? <> · {pr.monthly} {t("OMR per screen monthly", "ر.ع لكل شاشة شهريًا")}</> : null}</> : t("Quoted per restaurant, based on the number of screens and menu size.", "يُسعَّر لكل مطعم حسب عدد الشاشات وحجم المنيو.")}</p>
            <p className="mt-2 text-[14px] text-slate">{t("Photos in these concepts are sample images. Your screens use photos of your own dishes.", "الصور في هذه النماذج للعرض. شاشاتك تستخدم صور أطباقك.")} <Link className="underline" to="/credits">{t("Photo credits", "حقوق الصور")}</Link></p></div>
        </div>
        <QuoteForm designId={d.id} screens={screens} />
      </section>
    </>
  );
}

function QuoteForm({ designId, screens }: { designId: string; screens: number }) {
  const { t, L } = useI18n();
  const [f, setF] = useState({ restaurant: "", screens: String(screens), size: "", category: designById(designId)?.group || "burger", design: designId, language: "both", full_name: "", phone: "", email: "" });
  const [err, setErr] = useState<Record<string, string>>({}); const [state, setState] = useState<"idle" | "busy" | "done" | "fail">("idle");
  useEffect(() => setF(v => ({ ...v, screens: String(screens) })), [screens]);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => { setF(v => ({ ...v, [k]: e.target.value })); setErr(v => ({ ...v, [k]: "" })); };
  async function submit(e: React.FormEvent) {
    e.preventDefault(); const er: Record<string, string> = {};
    if (f.restaurant.trim().length < 2) er.restaurant = t("Enter the restaurant name.", "أدخل اسم المطعم.");
    if (f.full_name.trim().length < 3) er.full_name = t("Enter your name.", "أدخل اسمك.");
    if (f.phone.replace(/\D/g, "").length < 8) er.phone = t("Enter a phone number with at least 8 digits.", "أدخل رقم هاتف من 8 أرقام على الأقل.");
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(f.email.trim())) er.email = t("Enter a valid email address.", "أدخل بريدًا إلكترونيًا صحيحًا.");
    setErr(er); if (Object.keys(er).length) return;
    setState("busy");
    const d = designById(f.design);
    try {
      await api.sendEnquiry({ full_name: f.full_name.trim(), company: f.restaurant.trim(), email: f.email.trim().toLowerCase(), phone: f.phone.trim(), service: "TV Menu Board", budget: `${f.screens} screen(s)`,
        description: [`Restaurant: ${f.restaurant.trim()}`, `Screens: ${f.screens}`, `Screen size: ${f.size.trim() || "not given"}`, `Category: ${GROUPS.find(g => g.id === f.category)?.label.en}`, `Preferred design: ${d?.name.en} (${f.design})`, `Language: ${f.language}`].join("\n") });
      setState("done");
    } catch { setState("fail"); }
  }
  if (state === "done") return <div className="card self-start p-9" id="quote" role="status"><h2 className="font-display text-[26px] font-extrabold">{t("Request received.", "وصلنا طلبك.")}</h2><p className="lead mt-2">{t("We will contact you with a quote for your screens.", "سنتواصل معك بعرض سعر لشاشاتك.")}</p></div>;
  return (
    <form id="quote" onSubmit={submit} noValidate className="card grid scroll-mt-28 gap-5 self-start p-7 sm:p-9">
      <h2 className="font-display text-[26px] font-extrabold">{t("Request a quote", "اطلب عرض سعر")}</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("Restaurant name", "اسم المطعم")} error={err.restaurant}><input className="input" value={f.restaurant} onChange={set("restaurant")} maxLength={80} /></Field>
        <Field label={t("Number of TV screens", "عدد الشاشات")}><select className="input" value={f.screens} onChange={set("screens")}>{["1", "2", "3", "4", "5+"].map(x => <option key={x}>{x}</option>)}</select></Field>
        <Field label={t("Screen dimensions, if known", "مقاس الشاشة إن عُرف")} hint={t("For example 55 inch", "مثال: 55 بوصة")}><input className="input" value={f.size} onChange={set("size")} maxLength={40} /></Field>
        <Field label={t("Restaurant category", "تصنيف المطعم")}><select className="input" value={f.category} onChange={set("category")}>{GROUPS.map(g => <option key={g.id} value={g.id}>{L(g.label)}</option>)}</select></Field>
        <Field label={t("Preferred design", "التصميم المفضّل")}><select className="input" value={f.design} onChange={set("design")}>{DESIGNS.map(x => <option key={x.id} value={x.id}>{L(x.name)}</option>)}</select></Field>
        <Field label={t("Preferred language", "اللغة المفضّلة")}><select className="input" value={f.language} onChange={set("language")}><option value="both">{t("Arabic and English", "العربية والإنجليزية")}</option><option value="ar">{t("Arabic", "العربية")}</option><option value="en">{t("English", "الإنجليزية")}</option></select></Field>
        <Field label={t("Your name", "اسمك")} error={err.full_name}><input className="input" value={f.full_name} onChange={set("full_name")} autoComplete="name" /></Field>
        <Field label={t("Phone number", "رقم الهاتف")} error={err.phone}><input className="input ltr" type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" placeholder="+968" /></Field>
      </div>
      <Field label={t("Email", "البريد الإلكتروني")} error={err.email}><input className="input ltr" type="email" value={f.email} onChange={set("email")} autoComplete="email" /></Field>
      {state === "fail" && <p className="rounded-xl bg-red-50 p-4 text-red-800" role="alert">{t("We could not send your request. Check your connection and try again.", "تعذّر إرسال الطلب. تحقق من الاتصال وحاول مجددًا.")}</p>}
      <button className="btn-dark justify-self-start" disabled={state === "busy"}>{state === "busy" ? t("Sending…", "جارٍ الإرسال…") : t("Request a Quote", "اطلب عرض سعر")}</button>
    </form>
  );
}

/* ------------------------------------------------------------------ loading a board for display / QR */
type Loaded = { design: Design; menu: Menu; settings: Settings; restaurant: string };
function fromData(data: BoardData, restaurant: string): Loaded | null { const design = designById(data.settings.designId); return design ? { design, menu: data.menu, settings: data.settings, restaurant } : null; }
async function loadBoard(id: string): Promise<Loaded | "expired" | null> {
  if (id.startsWith("concept-")) { const d = designById(id.slice(8)); return d ? { design: d, menu: d.menu, settings: { designId: d.id, screens: 1, slideSeconds: 10, assign: defaultAssign(d.menu, 1) }, restaurant: d.name.en } : null; }
  const r = await api.boardPublic(id); return r === "expired" ? r : r ? fromData(r.data, r.restaurant) : null;
}

/* ------------------------------------------------------------------ display mode (for the TV itself) */
export function Display() {
  const { id = "" } = useParams(); const [qs] = useSearchParams(); useBoardFonts();
  const [b, setB] = useState<Loaded | null>(null); const [state, setState] = useState<"loading" | "ok" | "offline" | "missing" | "expired">("loading");
  const lang: Lang = qs.get("lang") === "en" ? "en" : qs.get("lang") === "ar" ? "ar" : "ar";
  const cacheKey = "fikra-display-" + id;
  useEffect(() => {
    document.title = "FIKRA Display"; let alive = true;
    // Show the last good copy immediately, so a restart without internet still shows the menu.
    try { const c = JSON.parse(localStorage.getItem(cacheKey) || "null"); if (c) { const l = id.startsWith("concept-") ? null : fromData(c.data, c.restaurant); if (l) { setB(l); setState("ok"); } } } catch { /* ignore */ }
    const pull = async () => {
      try {
        const l = await loadBoard(id); if (!alive) return;
        if (l === "expired") { setB(null); setState("expired"); try { localStorage.removeItem(cacheKey); } catch { /* ignore */ } return; }
        if (!l) { setState(s => (s === "ok" || s === "offline" ? "offline" : "missing")); return; }
        setB(l); setState("ok");
        if (!id.startsWith("concept-")) try { localStorage.setItem(cacheKey, JSON.stringify({ data: { menu: l.menu, settings: l.settings }, restaurant: l.restaurant })); } catch { /* storage full */ }
      } catch { if (alive) setState(s => (s === "loading" ? "offline" : s === "ok" ? "offline" : s)); }
    };
    void pull(); const timer = setInterval(pull, 60000);
    const online = () => void pull(); addEventListener("online", online); addEventListener("storage", online);
    // Keep the screen awake where the browser allows it.
    let lock: { release?: () => Promise<void> } | null = null;
    const wake = async () => { try { lock = await (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock?.request("screen") ?? null; } catch { /* not supported */ } };
    void wake(); const vis = () => { if (document.visibilityState === "visible") { void wake(); void pull(); } }; document.addEventListener("visibilitychange", vis);
    return () => { alive = false; clearInterval(timer); removeEventListener("online", online); removeEventListener("storage", online); document.removeEventListener("visibilitychange", vis); void lock?.release?.(); };
  }, [id, cacheKey]);

  if (!b) return <div className="grid h-screen place-items-center bg-black text-center text-white/70"><div><p className="text-2xl">{state === "expired" ? "هذا المنيو متوقف مؤقتًا · This menu is paused. Renew the subscription from the restaurant dashboard." : state === "missing" ? "This menu is not published yet." : state === "offline" ? "Waiting for connection…" : "Loading menu…"}</p><p className="mt-2 text-sm text-white/40">FIKRA DIGITAL</p></div></div>;
  const of = Math.min(4, Math.max(1, +(qs.get("of") || b.settings.screens))); const one = +(qs.get("screen") || 0);
  const assign = b.settings.assign.length === of ? b.settings.assign : defaultAssign(b.menu, of);
  return (
    <div className="fixed inset-0 grid cursor-none place-items-center overflow-hidden bg-black">
      <div className="w-full" style={{ maxWidth: one ? "177.78vh" : of === 4 ? "177.78vh" : `${177.78 / 1 * (of === 4 ? 1 : of)}vh` }}>
        {one ? <Screen design={b.design} menu={b.menu} catIds={assign[one - 1] || []} lang={lang} playing slideSeconds={b.settings.slideSeconds} screen={one} of={of} showOffers={of === 1 || one === of} />
          : <TvWall bare design={b.design} menu={b.menu} screens={of} assign={assign} lang={lang} playing slideSeconds={b.settings.slideSeconds} />}
      </div>
      {state === "offline" && <i className="fixed bottom-3 left-3 h-2.5 w-2.5 rounded-full bg-amber-400" title="Offline: showing the last saved menu" />}
    </div>
  );
}

/* ------------------------------------------------------------------ QR menu (same data as the TV) */
export function QrMenu() {
  const { id = "" } = useParams(); const { t, L, lang, setLang } = useI18n(); useBoardFonts();
  const [b, setB] = useState<Loaded | null | undefined>(undefined); const [expired, setExpired] = useState(false);
  useEffect(() => { let alive = true; const pull = () => loadBoard(id).then(x => { if (!alive) return; if (x === "expired") { setExpired(true); setB(null); } else { setExpired(false); setB(x); } }).catch(() => alive && setB(v => v ?? null)); void pull(); const tm = setInterval(pull, 60000); return () => { alive = false; clearInterval(tm); }; }, [id]);
  useSeo(b ? `${L(b.menu.name)} · ${t("Menu", "المنيو")}` : t("Menu", "المنيو"));
  if (b === undefined) return <div className="grid min-h-screen place-items-center text-slate">{t("Loading…", "جارٍ التحميل…")}</div>;
  if (!b) return <div className="grid min-h-screen place-items-center p-8 text-center"><div><h1 className="font-display text-2xl font-bold">{expired ? t("This menu is paused for now.", "هذا المنيو متوقف مؤقتًا.") : t("This menu is not published yet.", "هذا المنيو غير منشور بعد.")}</h1></div></div>;
  const th = b.design.theme, offers = activeOffers(b.menu);
  return (
    <div className="mx-auto min-h-screen max-w-[520px] pb-16" style={{ background: th.bg, color: th.fg, fontFamily: lang === "ar" ? "'Tajawal',sans-serif" : th.body }}>
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-4" style={{ background: th.bg }}>
        <div><h1 style={{ fontFamily: lang === "ar" ? th.headAr : th.head, fontSize: 30, lineHeight: 1.1 }}>{L(b.menu.name)}</h1><p className="text-[13px] opacity-70">{L(b.menu.hours)}</p></div>
        <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="rounded-full px-3 py-1.5 text-[13px] font-semibold" style={{ background: th.pn, color: th.fg }}>{lang === "ar" ? "EN" : "ع"}</button>
      </header>
      {offers.map(o => <div key={o.id} className="mx-5 mb-4 flex items-center justify-between gap-3 rounded-2xl p-4" style={{ background: th.ac, color: th.bg }}><div><b className="block text-[17px]">{L(o.title)}</b><span className="text-[14px]">{L(o.text)}</span></div>{o.price != null && <b className="whitespace-nowrap text-[20px]" dir="ltr">{o.price.toFixed(3)}</b>}</div>)}
      {b.menu.cats.map(c => (
        <section key={c.id} className="px-5 pt-4"><h2 className="mb-3 text-[22px] font-bold" style={{ color: th.ac, fontFamily: lang === "ar" ? th.headAr : th.head }}>{L(c.name)}</h2>
          <div className="grid gap-3">{c.items.map(i => (
            <div key={i.id} className="flex items-center gap-4 rounded-2xl p-3" style={{ background: th.pn }}>
              {i.photo && <img src={photoUrl(i.photo)} alt="" className="h-[76px] w-[76px] flex-none rounded-xl object-cover transition duration-300 active:scale-110" loading="lazy" />}
              <div className="min-w-0 flex-1"><b className="block text-[17px] leading-tight">{L(i.name)}</b>{i.best && <span className="text-[12px] font-semibold" style={{ color: th.ac }}>{t("Best seller", "الأكثر طلبًا")}</span>}</div>
              <b className="whitespace-nowrap text-[17px]" dir="ltr" style={{ color: th.ac }}>{i.price.toFixed(3)} <small className="text-[11px] opacity-70">{t("OMR", "ر.ع")}</small></b>
            </div>))}</div></section>))}
      <p className="mt-8 text-center text-[12px] opacity-50">FIKRA DIGITAL</p>
    </div>
  );
}

/* ------------------------------------------------------------------ photo credits */
export function Credits() {
  const { t } = useI18n(); useSeo(t("Photo credits · FIKRA DIGITAL", "حقوق الصور · فكرة الرقمية"));
  const [rows, setRows] = useState<{ file: string; title: string; artist: string; license: string; page: string }[]>([]);
  useEffect(() => { fetch("./boards/credits.json").then(r => r.json()).then(setRows).catch(() => setRows([])); }, []);
  return (
    <div className="container-x py-16"><h1 className="h-sec">{t("Photo credits", "حقوق الصور")}</h1>
      <p className="lead mt-3 max-w-[70ch]">{t("Sample photographs in the menu board concepts come from Wikimedia Commons under licences that allow commercial use. Each is credited below.", "الصور النموذجية في تصاميم الشاشات من ويكيميديا كومنز بتراخيص تسمح بالاستخدام التجاري، وهذه نسبتها.")}</p>
      <div className="card mt-8 overflow-x-auto p-2"><table className="tbl"><thead><tr><th>{t("Photo", "الصورة")}</th><th>{t("Author", "المصوّر")}</th><th>{t("Licence", "الترخيص")}</th></tr></thead>
        <tbody>{rows.map(r => <tr key={r.file}><td><a className="underline" href={r.page} target="_blank" rel="noopener" dir="ltr">{r.title.replace(/^File:/, "")}</a></td><td dir="ltr">{r.artist || "—"}</td><td dir="ltr">{r.license}</td></tr>)}</tbody></table></div>
    </div>
  );
}
