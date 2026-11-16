// Concept: a construction company site whose entrance builds a tower as you scroll.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n, useSeo } from "../lib/i18n";
import type { BuildScene } from "./BuildScene";

const AMBER = "#F5A524";

export default function ConstructionSite() {
  const { t, lang, setLang } = useI18n();
  useSeo(t("Binaa Contracting · Concept by FIKRA DIGITAL", "بناء للمقاولات · نموذج من فكرة الرقمية"), t("A concept construction website with a scroll-driven 3D entrance.", "نموذج موقع مقاولات بمدخل ثلاثي الأبعاد يتحرك مع التمرير."));
  const track = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null), bar = useRef<HTMLSpanElement>(null), hero = useRef<HTMLDivElement>(null), hint = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0); const [state, setState] = useState<"loading" | "ready" | "failed">("loading"); const [playing, setPlaying] = useState(false);
  const playRef = useRef<number>(0);

  useEffect(() => {
    let scene: BuildScene | null = null, raf = 0, alive = true, cur = -1, target = 0, lastPhase = -1;
    const el = track.current!, cv = canvas.current!;
    const measure = () => { const r = el.getBoundingClientRect(); target = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight))); };
    const size = () => { scene?.resize(cv.clientWidth, cv.clientHeight); cur = -1; };
    const frame = () => {
      if (!alive) return; raf = requestAnimationFrame(frame); if (!scene) return;
      measure();
      const next = cur < 0 ? target : cur + (target - cur) * 0.11;
      if (Math.abs(next - cur) < 0.00015) return;
      cur = next; scene.setProgress(cur); scene.render();
      if (bar.current) bar.current.style.transform = `scaleX(${cur})`;
      if (hero.current) { const k = Math.min(1, Math.max(0, (cur - 0.9) / 0.08)); hero.current.style.opacity = String(k); hero.current.style.transform = `translateY(${(1 - k) * 28}px)`; hero.current.style.pointerEvents = k > 0.6 ? "auto" : "none"; }
      if (hint.current) hint.current.style.opacity = String(Math.max(0, 1 - cur / 0.04));
      const ph = cur < 0.2 ? 0 : cur < 0.52 ? 1 : cur < 0.8 ? 2 : 3; if (ph !== lastPhase) { lastPhase = ph; setPhase(ph); }
    };
    import("./BuildScene").then(m => {
      if (!alive) return;
      try { scene = m.createBuildScene(cv, innerWidth < 760 || (navigator.hardwareConcurrency || 4) <= 4); size(); setState("ready"); }
      catch { setState("failed"); }
    }).catch(() => alive && setState("failed"));
    raf = requestAnimationFrame(frame);
    addEventListener("resize", size);
    return () => { alive = false; cancelAnimationFrame(raf); cancelAnimationFrame(playRef.current); removeEventListener("resize", size); scene?.dispose(); };
  }, []);

  // "Play": scrolls through the entrance by itself, like a film.
  const play = () => {
    const el = track.current!; cancelAnimationFrame(playRef.current);
    const top = el.getBoundingClientRect().top + scrollY, dist = el.offsetHeight - innerHeight, t0 = performance.now(), dur = 11000;
    scrollTo(0, top); setPlaying(true);
    const step = (now: number) => { const k = Math.min(1, (now - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; scrollTo(0, top + dist * e); if (k < 1) playRef.current = requestAnimationFrame(step); else setPlaying(false); };
    playRef.current = requestAnimationFrame(step);
    const stop = () => { cancelAnimationFrame(playRef.current); setPlaying(false); removeEventListener("wheel", stop); removeEventListener("touchstart", stop); };
    addEventListener("wheel", stop, { once: true, passive: true }); addEventListener("touchstart", stop, { once: true, passive: true });
  };

  const phases = [
    [t("The site", "الموقع"), t("Every project starts as open ground.", "كل مشروع يبدأ أرضًا خالية.")],
    [t("The structure", "الهيكل"), t("Concrete and steel rise floor by floor.", "الخرسانة والحديد يرتفعان طابقًا بعد طابق.")],
    [t("The envelope", "الواجهات"), t("Glass and finishes close the building.", "الزجاج والتشطيبات تُغلق المبنى.")],
    [t("Handover", "التسليم"), t("Keys in hand, on the agreed date.", "المفاتيح في يدك في الموعد المتفق عليه.")]
  ];
  const services = [
    [t("Residential", "سكني"), t("Villas and housing compounds from foundation to handover.", "فلل ومجمعات سكنية من الأساس إلى التسليم.")],
    [t("Commercial", "تجاري"), t("Offices, retail and mixed-use towers.", "مكاتب ومحال وأبراج متعددة الاستخدام.")],
    [t("Fit-out", "تشطيبات"), t("Interior works for shops, clinics and restaurants.", "أعمال داخلية للمحال والعيادات والمطاعم.")],
    [t("Project management", "إدارة المشاريع"), t("One team answering for cost, time and quality.", "فريق واحد مسؤول عن التكلفة والوقت والجودة.")]
  ];

  return (
    <div className="bg-[#0E1114] text-white" style={{ fontFamily: lang === "ar" ? "'Tajawal',sans-serif" : undefined }}>
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-4 sm:px-8">
        <b className="font-display text-[20px] tracking-wide drop-shadow"><span style={{ color: AMBER }}>BINAA</span> {t("Contracting", "للمقاولات")}</b>
        <div className="flex items-center gap-2">
          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="rounded-full bg-black/35 px-3.5 py-2 text-[13.5px] font-semibold backdrop-blur">{lang === "ar" ? "English" : "العربية"}</button>
          <Link to="/portfolio/binaa-construction" className="rounded-full bg-black/35 px-3.5 py-2 text-[13.5px] font-semibold backdrop-blur">{t("Close demo", "إغلاق العرض")}</Link>
        </div>
      </header>

      {/* scroll-driven entrance */}
      <section ref={track} className="relative" style={{ height: "560vh" }} aria-label={t("Animated entrance: a tower is built as you scroll", "مدخل متحرك: يُبنى البرج مع التمرير")}>
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden" style={{ background: "linear-gradient(#4f8fd0,#e0c2a8 60%,#8c4a2e 60%)" }}>
          <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
          <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,.38), transparent 22%, transparent 62%, rgba(0,0,0,.55))" }} />
          {state === "failed" && <p className="absolute inset-x-0 top-24 text-center text-white/80">{t("3D is not available on this device, so the animation is not shown.", "العرض ثلاثي الأبعاد غير متاح على هذا الجهاز.")}</p>}
          {state === "loading" && <p className="absolute inset-x-0 top-1/2 text-center text-white/80">{t("Loading the site…", "جارٍ تحميل الموقع…")}</p>}

          {/* stage caption */}
          {phase < 3 && <div className="absolute bottom-[13%] start-5 max-w-[80vw] sm:start-10" key={phase} style={{ animation: "rise .6s both" }} aria-live="polite">
            <span className="font-display text-[13px] font-bold tracking-[.2em]" style={{ color: AMBER }}>0{phase + 1} / 03</span>
            <p className="mt-1 font-display text-[clamp(26px,4.2vw,50px)] font-extrabold leading-tight drop-shadow-lg">{phases[phase][0]}</p>
            <p className="mt-1 max-w-[36ch] text-[16.5px] text-white/85 drop-shadow">{phases[phase][1]}</p>
          </div>}

          {/* final hero */}
          <div ref={hero} className="absolute inset-0 flex items-end px-5 pb-[9vh] sm:px-10" style={{ opacity: 0, background: "linear-gradient(to top, rgba(8,12,18,.78), transparent 58%)" }}>
            <div><p className="font-display text-[13px] font-bold tracking-[.24em]" style={{ color: AMBER }}>{t("BINAA CONTRACTING", "بناء للمقاولات")}</p>
              <h1 className="mt-3 max-w-[13ch] font-display text-[clamp(36px,5.6vw,76px)] font-extrabold leading-[1.02]">{t("We build what the drawings promise.", "نبني ما تعد به المخططات.")}</h1>
              <div className="mt-7 flex flex-wrap gap-3"><a href="#services" className="rounded-full px-7 py-3.5 font-display text-[15px] font-bold text-[#141414]" style={{ background: AMBER }}>{t("See what we build", "شاهد ما نبنيه")}</a>
                <button onClick={play} className="rounded-full border border-white/40 px-7 py-3.5 font-display text-[15px] font-semibold backdrop-blur">{t("Replay", "إعادة العرض")}</button></div></div>
          </div>

          <div ref={hint} className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-3">
            <button onClick={play} disabled={playing || state !== "ready"} className="rounded-full px-6 py-3 font-display text-[14.5px] font-bold text-[#141414] shadow-lg disabled:opacity-60" style={{ background: AMBER }}>▶ {t("Play the build", "شغّل البناء")}</button>
            <span className="text-[13px] text-white/80">{t("or scroll down", "أو مرّر للأسفل")}</span>
          </div>
          <span className="absolute inset-x-0 bottom-0 h-1 bg-white/15"><span ref={bar} className="block h-full origin-left rtl:origin-right" style={{ background: AMBER, transform: "scaleX(0)" }} /></span>
        </div>
      </section>

      {/* the rest of the concept site */}
      <section id="services" className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8">
        <p className="font-display text-[13px] font-bold tracking-[.2em]" style={{ color: AMBER }}>{t("WHAT WE BUILD", "ماذا نبني")}</p>
        <h2 className="mt-3 max-w-[18ch] font-display text-[clamp(30px,4.4vw,52px)] font-extrabold leading-tight">{t("From open ground to handover.", "من الأرض الخالية إلى التسليم.")}</h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2">{services.map(([a, b], i) => (
          <div key={a} className="bg-[#161A1F] p-7 transition hover:bg-[#1D2229]"><span className="font-display text-[14px] font-bold" style={{ color: AMBER }}>0{i + 1}</span><h3 className="mt-2 text-[22px] font-bold">{a}</h3><p className="mt-1.5 text-white/65">{b}</p></div>))}</div>
      </section>
      <section className="mx-auto max-w-[1200px] px-5 pb-24 sm:px-8">
        <div className="rounded-[28px] p-8 text-[#141414] sm:p-12" style={{ background: AMBER }}>
          <h2 className="max-w-[20ch] font-display text-[clamp(26px,3.6vw,42px)] font-extrabold leading-tight">{t("This is a concept by FIKRA DIGITAL.", "هذا نموذج من فكرة الرقمية.")}</h2>
          <p className="mt-3 max-w-[58ch] text-[17px]">{t("Binaa Contracting is an invented company used to demonstrate the design. We can build an entrance like this for your business, with your own project.", "«بناء للمقاولات» شركة مختلقة لغرض عرض التصميم. نستطيع بناء مدخل مثل هذا لنشاطك وبمشروعك أنت.")}</p>
          <Link to="/contact?service=Website" className="mt-6 inline-flex rounded-full bg-[#141414] px-7 py-3.5 font-display text-[15px] font-bold text-white">{t("Build something like this", "ابنِ شيئًا مشابهًا")}</Link>
        </div>
      </section>
    </div>
  );
}
