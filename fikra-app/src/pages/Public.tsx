import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useI18n, useSeo } from "../lib/i18n";
import { useApp } from "../lib/app";
import { api } from "../lib/store";
import { BUDGET_OPTIONS, CATEGORIES, SERVICE_OPTIONS } from "../lib/content";
import { Arrow, BrowserFrame, Check, Field, Reveal } from "../components/ui";
import { ServiceVisual } from "../components/Visuals";
import { Demo, DemoThumb } from "../demos/Demos";
import { waLink } from "../components/Layout";
import { ConceptTag, CTA } from "./Home";

function PageHead({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <section className="dark-sec grid-glow">
      <div className="container-x relative py-16 lg:py-24">
        <p className="eyebrow !text-teal animate-rise">{eyebrow}</p>
        <h1 className="mt-4 max-w-[20ch] font-display text-[clamp(34px,5.4vw,64px)] font-extrabold leading-[1.05] animate-rise" style={{ animationDelay: "80ms" }}>{title}</h1>
        {lead && <p className="mt-5 max-w-[60ch] text-[19px] text-paper/70 animate-rise" style={{ animationDelay: "160ms" }}>{lead}</p>}
      </div>
    </section>
  );
}
function NotFound() {
  const { t } = useI18n();
  return <div className="container-x py-28 text-center"><h1 className="h-sec">{t("Page not found", "الصفحة غير موجودة")}</h1><Link to="/" className="btn-dark mt-8">{t("Back to home", "العودة للرئيسية")}</Link></div>;
}
export { NotFound };

/* ------------------------------------------------------------------ SERVICES */
export function Services() {
  const { t, L } = useI18n(); const { content } = useApp();
  useSeo(t("Services · Website, E-commerce & SaaS Development in Oman · FIKRA DIGITAL", "الخدمات · تطوير المواقع والمتاجر و SaaS في عُمان · فكرة الرقمية"),
    t("Website development, e-commerce development, SaaS development and restaurant digital menus in Oman.", "تطوير المواقع والمتاجر الإلكترونية و SaaS وقوائم المطاعم الرقمية في عُمان."));
  return (
    <>
      <PageHead eyebrow={t("Services", "الخدمات")} title={t("Everything your business needs online.", "كل ما يحتاجه نشاطك على الإنترنت.")} lead={t("Four services, one team. Pick the one that fits, or tell us the problem and we will suggest the right one.", "أربع خدمات وفريق واحد. اختر ما يناسبك أو أخبرنا بالمشكلة ونقترح الأنسب.")} />
      <section className="container-x grid gap-16 py-20">
        {content.services.map((s, i) => (
          <Reveal key={s.slug}>
            <article className={`grid items-center gap-10 lg:grid-cols-2 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
              <div className="card p-5"><ServiceVisual kind={s.visual} /></div>
              <div>
                <span className="font-display font-bold text-teal-700">{s.n}</span>
                <h2 className="mt-1 font-display text-[clamp(26px,3.4vw,38px)] font-extrabold">{L(s.title)}</h2>
                <p className="lead mt-3">{L(s.description)}</p>
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">{s.items.map(x => <li key={x.en} className="flex gap-2"><Check />{L(x)}</li>)}</ul>
                <div className="mt-7 flex flex-wrap items-center gap-5">
                  <Link to={`/services/${s.slug}`} className="btn-dark">{t("View service", "عرض الخدمة")} <Arrow /></Link>
                  <span className="text-slate">{s.priceFrom ? <>{t("From", "من")} <b className="font-display text-[20px] text-ink">{s.priceFrom} {t("OMR", "ر.ع")}</b></> : L(s.priceNote)}</span>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </section>
      <CTA />
    </>
  );
}

export function ServiceDetail() {
  const { slug } = useParams(); const { t, L } = useI18n(); const { content } = useApp();
  const s = content.services.find(x => x.slug === slug);
  useSeo(s ? `${L(s.title)} · ${L(s.seo)} · FIKRA DIGITAL` : "FIKRA DIGITAL", s ? L(s.description) : undefined);
  if (!s) return <NotFound />;
  return (
    <>
      <PageHead eyebrow={`${s.n} · ${L(s.seo)}`} title={L(s.title)} lead={L(s.short)} />
      <section className="container-x grid gap-12 py-20 lg:grid-cols-[1.2fr_.8fr]">
        <div>
          <Reveal><p className="text-[19px] leading-relaxed">{L(s.description)}</p></Reveal>
          <Reveal><div className="card mt-8 p-5"><ServiceVisual kind={s.visual} /></div></Reveal>
          <Reveal><h2 className="mt-12 font-display text-[26px] font-extrabold">{t("Benefits", "الفوائد")}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">{s.benefits.map((x, i) => <div key={x.en} className="rounded-2xl bg-mist p-5"><span className="font-display text-teal-700">0{i + 1}</span><p className="mt-1 font-semibold">{L(x)}</p></div>)}</div></Reveal>
          <Reveal><h2 className="mt-12 font-display text-[26px] font-extrabold">{t("Features", "المزايا")}</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">{s.features.map(x => <li key={x.en} className="flex gap-2.5"><Check />{L(x)}</li>)}</ul></Reveal>
          <Reveal><h2 className="mt-12 font-display text-[26px] font-extrabold">{t("What we build", "ما نبنيه")}</h2>
            <div className="mt-5 flex flex-wrap gap-2">{s.items.map(x => <span key={x.en} className="chip bg-teal-soft !px-4 !py-2 !text-[14.5px] text-navy">{L(x)}</span>)}</div></Reveal>
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="dark-sec rounded-3xl p-7">
            <div className="relative">
              <span className="text-paper/60">{s.priceFrom ? t("Starting price", "السعر يبدأ من") : t("Pricing", "التسعير")}</span>
              <p className="mt-1 font-display text-[40px] font-extrabold leading-none text-teal">{s.priceFrom ? <>{s.priceFrom} <small className="text-[18px] text-paper">{t("OMR", "ر.ع")}</small></> : <span className="text-[26px] leading-tight">{t("Request a quote", "اطلب عرض سعر")}</span>}</p>
              <p className="mt-2 text-paper/70">{L(s.priceNote)}</p>
              <Link to={`/contact?service=${encodeURIComponent(s.title.en)}`} className="btn-primary mt-6 w-full">{t("Talk to us about this", "تواصل معنا بخصوصها")}</Link>
              {s.priceFrom && <Link to="/pricing" className="mt-4 block text-center text-[14.5px] text-paper/70 underline underline-offset-4 hover:text-paper">{t("See all packages", "كل الباقات")}</Link>}
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ PORTFOLIO */
export function Portfolio() {
  const { t, L } = useI18n(); const { content } = useApp(); const [cat, setCat] = useState("all");
  useSeo(t("Portfolio · Concept Projects · FIKRA DIGITAL", "الأعمال · مشاريع تجريبية · فكرة الرقمية"), t("Interactive concept projects: restaurant, real estate, construction, e-commerce and SaaS demos.", "مشاريع تجريبية تفاعلية: مطاعم وعقارات ومقاولات ومتاجر و SaaS."));
  const rows = content.projects.filter(p => p.published && (cat === "all" || p.category === cat));
  return (
    <>
      <PageHead eyebrow={t("Portfolio", "الأعمال")} title={t("Work you can try, not just look at.", "أعمال تجرّبها، لا تشاهدها فقط.")} lead={t("Every project here is a demonstration concept built by FIKRA DIGITAL to show what we can do. They are not client projects.", "كل مشروع هنا نموذج تجريبي بنته فكرة الرقمية لعرض ما نستطيع تنفيذه، وليست مشاريع لعملاء.")} />
      <section className="container-x py-16">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("Categories", "التصنيفات")}>
          {[{ id: "all", label: { en: "All", ar: "الكل" } }, ...CATEGORIES].map(c => (
            <button key={c.id} role="tab" aria-selected={cat === c.id} onClick={() => setCat(c.id)} className={`rounded-full px-5 py-2.5 text-[15px] font-semibold transition ${cat === c.id ? "bg-navy text-paper" : "bg-white text-ink hover:bg-mist"}`}>{L(c.label)}</button>))}
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rows.map(p => (
            <Link key={p.slug} to={`/portfolio/${p.slug}`} className="card group block overflow-hidden transition duration-300 hover:-translate-y-1" style={{ animation: "rise .5s both" }}>
              <div className="relative"><DemoThumb kind={p.demo} /><div className="absolute start-3 top-3"><ConceptTag /></div></div>
              <div className="p-5"><span className="text-[13px] font-semibold text-teal-700">{L(CATEGORIES.find(c => c.id === p.category)?.label)}</span><h2 className="mt-1 text-[19px] font-bold">{L(p.title)}</h2><p className="mt-1 text-[15px] text-slate">{L(p.summary)}</p>
                <span className="mt-3 inline-flex items-center gap-2 text-[14.5px] font-semibold group-hover:text-teal-700">{t("View case study", "عرض الدراسة")} <Arrow /></span></div>
            </Link>))}
          {!rows.length && <p className="lead col-span-full">{t("No concepts in this category yet.", "لا توجد نماذج في هذا التصنيف بعد.")}</p>}
        </div>
      </section>
      <CTA />
    </>
  );
}

export function ProjectPage() {
  const { slug } = useParams(); const { t, L } = useI18n(); const { content } = useApp();
  const p = content.projects.find(x => x.slug === slug && x.published);
  useSeo(p ? `${L(p.title)} · ${t("Concept", "نموذج")} · FIKRA DIGITAL` : "FIKRA DIGITAL", p ? L(p.summary) : undefined);
  if (!p) return <NotFound />;
  return (
    <>
      <PageHead eyebrow={`${t("Concept project", "مشروع تجريبي")} · ${L(CATEGORIES.find(c => c.id === p.category)?.label)}`} title={L(p.title)} lead={L(p.summary)} />
      <section className="container-x py-16">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-[60ch] rounded-xl bg-[#FFF5DC] px-4 py-3 text-[14.5px] text-[#6E4A00]">{t("This is a demonstration concept, not a completed client project. The names and data in it are invented for the demo.", "هذا نموذج تجريبي وليس مشروعًا منجزًا لعميل. الأسماء والبيانات فيه مختلقة لغرض العرض.")}</p>
          <a href="#demo" className="btn-dark">{t("Live demonstration", "العرض الحي")}</a>
        </div>
        {p.demo === "construction" && <Link to="/demo/construction" className="dark-sec mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6 sm:p-8">
          <span className="relative"><b className="block font-display text-[22px] font-extrabold">{t("Full-screen 3D entrance", "المدخل ثلاثي الأبعاد بملء الشاشة")}</b><span className="mt-1 block text-paper/70">{t("Scroll and the tower builds itself: site, structure, glass, handover.", "مرّر فيُبنى البرج أمامك: الموقع ثم الهيكل ثم الزجاج ثم التسليم.")}</span></span>
          <span className="btn-primary relative">{t("Open the live demo", "افتح العرض الحي")}</span></Link>}
        <div id="demo" className="scroll-mt-28"><BrowserFrame url={`fikra.demo/${p.slug}`}><Demo kind={p.demo} /></BrowserFrame></div>
        <div className="mt-14 grid gap-12 lg:grid-cols-3">
          <Reveal className="lg:col-span-2"><h2 className="font-display text-[26px] font-extrabold">{t("Design concept", "فكرة التصميم")}</h2><p className="mt-4 text-[19px] leading-relaxed">{L(p.concept)}</p>
            <h2 className="mt-10 font-display text-[26px] font-extrabold">{t("Features", "المزايا")}</h2><ul className="mt-4 grid gap-3 sm:grid-cols-2">{p.features.map(x => <li key={x.en} className="flex gap-2.5"><Check />{L(x)}</li>)}</ul></Reveal>
          <Reveal><div className="rounded-3xl bg-mist p-7"><h2 className="font-display text-[19px] font-bold">{t("Technology used", "التقنيات المستخدمة")}</h2><div className="mt-4 flex flex-wrap gap-2">{p.tech.map(x => <span key={x} className="chip bg-white !px-3.5 !py-1.5 !text-[14px]" dir="ltr">{x}</span>)}</div>
            <Link to={`/contact?service=${encodeURIComponent(L(p.title))}`} className="btn-primary mt-7 w-full">{t("Build something like this", "ابنِ شيئًا مشابهًا")}</Link></div></Reveal>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ PRICING */
export function Pricing() {
  const { t, L } = useI18n(); const { content } = useApp(); const pr = content.pricing;
  useSeo(t("Pricing · Website Design Packages in Oman · FIKRA DIGITAL", "الأسعار · باقات تصميم المواقع في عُمان · فكرة الرقمية"), t("Website development packages from 149 OMR. Clear about what is included and what costs extra.", "باقات تطوير المواقع تبدأ من 149 ر.ع، مع توضيح ما تشمله وما يُدفع إضافيًا."));
  return (
    <>
      <PageHead eyebrow={t("Pricing", "الأسعار")} title={t("Clear prices. No surprises.", "أسعار واضحة دون مفاجآت.")} lead={t("Three website packages with fixed prices. Custom platforms are quoted after we understand the scope.", "ثلاث باقات مواقع بأسعار ثابتة. والمنصات المخصصة تُسعَّر بعد فهم نطاق العمل.")} />
      <section className="container-x py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {pr.packs.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <div className={`relative flex h-full flex-col rounded-3xl p-8 ${p.popular ? "dark-sec shadow-glow" : "card"}`}>
                <div className="relative flex h-full flex-col">
                  {p.popular && <span className="chip mb-4 self-start bg-teal text-navy">{t("Most chosen", "الأكثر اختيارًا")}</span>}
                  <h2 className="font-display text-[15px] font-bold uppercase tracking-[.16em]">{L(p.name)}</h2>
                  <p className="mt-3 font-display text-[54px] font-extrabold leading-none tabular-nums">{p.price} <small className={`text-[18px] font-semibold ${p.popular ? "text-teal" : "text-teal-700"}`}>{pr.currency === "OMR" ? t("OMR", "ر.ع") : pr.currency}</small></p>
                  <p className={`mt-3 ${p.popular ? "text-paper/70" : "text-slate"}`}>{L(p.blurb)}</p>
                  <ul className="mt-6 grid gap-3">{p.features.map(f => <li key={f.en} className="flex gap-2.5"><Check />{L(f)}</li>)}</ul>
                  <Link to={`/contact?service=${encodeURIComponent("Website Development")}&package=${p.id}`} className={`${p.popular ? "btn-primary" : "btn-dark"} mt-8 w-full`}>{t("Choose", "اختر")} {L(p.name)}</Link>
                </div>
              </div>
            </Reveal>))}
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <Reveal><div className="card h-full p-8"><h2 className="font-display text-[22px] font-extrabold">{t("Included in every package", "تشمله كل باقة")}</h2><ul className="mt-5 grid gap-3">{pr.included.map(x => <li key={x.en} className="flex gap-2.5"><Check />{L(x)}</li>)}</ul></div></Reveal>
          <Reveal delay={80}><div className="h-full rounded-3xl bg-mist p-8"><h2 className="font-display text-[22px] font-extrabold">{t("Costs extra", "يُدفع إضافيًا")}</h2><ul className="mt-5 grid gap-3">{pr.extra.map(x => <li key={x.en} className="flex gap-2.5"><span className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-slate" />{L(x)}</li>)}</ul>
            <p className="mt-5 text-[14.5px] text-slate">{t("We tell you the cost of any extra before we start it.", "نخبرك بتكلفة أي إضافة قبل البدء بها.")}</p></div></Reveal>
        </div>
        <Reveal><div className="dark-sec mt-10 rounded-3xl p-8 sm:p-12"><div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div><p className="eyebrow !text-teal">{t("Custom SaaS projects", "مشاريع SaaS المخصصة")}</p><h2 className="mt-2 font-display text-[clamp(24px,3vw,34px)] font-extrabold">{t("Platforms and systems are quoted individually.", "المنصات والأنظمة تُسعَّر بشكل منفرد.")}</h2><p className="mt-3 max-w-[62ch] text-paper/70">{L(pr.saasNote)}</p></div>
          <Link to={`/contact?service=${encodeURIComponent("SaaS / Web Application")}`} className="btn-primary">{t("Request a quotation", "اطلب عرض سعر")}</Link></div></div></Reveal>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ ABOUT */
export function About() {
  const { t, L } = useI18n(); const { content } = useApp(); const a = content.about;
  useSeo(t("About · FIKRA DIGITAL", "من نحن · فكرة الرقمية"), L(a.intro));
  return (
    <>
      <PageHead eyebrow={t("About us", "من نحن")} title={t("We Believe Every Business Deserves a Better Digital Experience.", "نؤمن أن كل نشاط يستحق تجربة رقمية أفضل.")} lead={L(a.intro)} />
      <section className="container-x py-20">
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal><div className="card h-full p-8"><p className="eyebrow">{t("Our mission", "رسالتنا")}</p><p className="mt-4 font-display text-[24px] font-bold leading-snug">{L(a.mission)}</p></div></Reveal>
          <Reveal delay={80}><div className="dark-sec h-full rounded-3xl p-8"><div className="relative"><p className="eyebrow !text-teal">{t("Our vision", "رؤيتنا")}</p><p className="mt-4 font-display text-[24px] font-bold leading-snug">{L(a.vision)}</p></div></div></Reveal>
        </div>
        <Reveal><h2 className="h-sec mt-20">{t("Our values", "قيمنا")}</h2></Reveal>
        <div className="mt-8 grid gap-px overflow-hidden rounded-3xl bg-navy/10 sm:grid-cols-2 lg:grid-cols-4">
          {a.values.map((v, i) => <Reveal key={v.title.en} delay={i * 60}><div className="h-full bg-white p-7"><span className="font-display text-teal-700">0{i + 1}</span><h3 className="mt-2 text-[21px] font-bold">{L(v.title)}</h3><p className="mt-2 text-slate">{L(v.text)}</p></div></Reveal>)}
        </div>
        <Reveal><div className="mt-20 grid items-center gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-3xl bg-white p-8 shadow-card"><img src="./logo-full.png" alt="FIKRA DIGITAL" className="mx-auto w-full max-w-[320px]" loading="lazy" /></div>
          <div><p className="eyebrow">{t("Our approach", "أسلوبنا")}</p><p className="mt-4 text-[21px] leading-relaxed">{L(a.approach)}</p></div></div></Reveal>
      </section>
      <CTA />
    </>
  );
}

/* ------------------------------------------------------------------ CONTACT */
export function Contact() {
  const { t, L, lang } = useI18n(); const { content } = useApp(); const [qs] = useSearchParams();
  useSeo(t("Contact · Start a Project · FIKRA DIGITAL", "تواصل · ابدأ مشروعك · فكرة الرقمية"), t("Tell FIKRA DIGITAL about your website, store or platform idea.", "أخبر فكرة الرقمية عن فكرة موقعك أو متجرك أو منصتك."));
  const preset = qs.get("service") || "";
  const [f, setF] = useState({ full_name: "", company: "", email: "", phone: "", service: SERVICE_OPTIONS.find(o => o.en === preset)?.en || (preset ? preset : ""), budget: "", description: qs.get("package") ? `Package: ${qs.get("package")}\n` : "" });
  const [err, setErr] = useState<Record<string, string>>({}); const [state, setState] = useState<"idle" | "busy" | "done" | "fail">("idle");
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => { setF(v => ({ ...v, [k]: e.target.value })); setErr(v => ({ ...v, [k]: "" })); };
  const services = preset && !SERVICE_OPTIONS.some(o => o.en === preset) ? [{ en: preset, ar: preset }, ...SERVICE_OPTIONS] : SERVICE_OPTIONS;
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.full_name.trim().length < 3) er.full_name = t("Enter your full name.", "أدخل اسمك الكامل.");
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(f.email.trim())) er.email = t("Enter a valid email address.", "أدخل بريدًا إلكترونيًا صحيحًا.");
    if (f.phone.replace(/\D/g, "").length < 8) er.phone = t("Enter a phone number with at least 8 digits.", "أدخل رقم هاتف من 8 أرقام على الأقل.");
    if (!f.service) er.service = t("Choose a service.", "اختر الخدمة.");
    if (!f.budget) er.budget = t("Choose a budget range.", "اختر نطاق الميزانية.");
    if (f.description.trim().length < 20) er.description = t("Describe the project in at least 20 characters.", "صف المشروع بـ 20 حرفًا على الأقل.");
    setErr(er); if (Object.keys(er).length) return;
    setState("busy");
    try { await api.sendEnquiry({ ...f, full_name: f.full_name.trim(), email: f.email.trim().toLowerCase(), company: f.company.trim(), phone: f.phone.trim(), description: f.description.trim() }); setState("done"); }
    catch { setState("fail"); }
  }
  const s = content.site;
  return (
    <>
      <PageHead eyebrow={t("Contact", "تواصل")} title={t("Tell us about your idea.", "حدّثنا عن فكرتك.")} lead={t("Fill in the form and we will reply with next steps. Or message us directly on WhatsApp.", "املأ النموذج ونرد عليك بالخطوات التالية، أو راسلنا مباشرة على واتساب.")} />
      <section className="container-x grid gap-12 py-20 lg:grid-cols-[1.25fr_.75fr]">
        {state === "done" ? (
          <div className="card p-10" role="status"><span className="grid h-14 w-14 place-items-center rounded-full bg-teal-soft text-teal-700"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.500l4.500 4.500L19 7.500" /></svg></span>
            <h2 className="mt-5 font-display text-[30px] font-extrabold">{t("Thank you. We have your enquiry.", "شكرًا لك. وصلنا طلبك.")}</h2><p className="lead mt-3">{t("We will contact you on the details you gave. For a faster reply, message us on WhatsApp.", "سنتواصل معك على البيانات التي أدخلتها. ولرد أسرع راسلنا على واتساب.")}</p>
            <a className="btn-dark mt-7" href={waLink(s.whatsapp, t(`Hello FIKRA DIGITAL, I just sent an enquiry. My name is ${f.full_name}.`, `مرحبًا فكرة الرقمية، أرسلت طلبًا للتو. اسمي ${f.full_name}.`))} target="_blank" rel="noopener">{t("Continue on WhatsApp", "المتابعة على واتساب")}</a></div>
        ) : (
          <form onSubmit={submit} noValidate className="card grid gap-5 p-7 sm:p-10">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t("Full name", "الاسم الكامل")} error={err.full_name}><input className="input" value={f.full_name} onChange={set("full_name")} autoComplete="name" maxLength={80} /></Field>
              <Field label={t("Company name", "اسم الشركة")} hint={t("Optional", "اختياري")}><input className="input" value={f.company} onChange={set("company")} autoComplete="organization" maxLength={80} /></Field>
              <Field label={t("Email", "البريد الإلكتروني")} error={err.email}><input className="input ltr" type="email" value={f.email} onChange={set("email")} autoComplete="email" inputMode="email" /></Field>
              <Field label={t("Phone number", "رقم الهاتف")} error={err.phone}><input className="input ltr" type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" inputMode="tel" placeholder="+968" /></Field>
              <Field label={t("Service required", "الخدمة المطلوبة")} error={err.service}><select className="input" value={f.service} onChange={set("service")}><option value="">{t("Choose", "اختر")}</option>{services.map(o => <option key={o.en} value={o.en}>{L(o)}</option>)}</select></Field>
              <Field label={t("Estimated budget", "الميزانية التقديرية")} error={err.budget}><select className="input" value={f.budget} onChange={set("budget")}><option value="">{t("Choose", "اختر")}</option>{BUDGET_OPTIONS.map(o => <option key={o.en} value={o.en}>{L(o)}</option>)}</select></Field>
            </div>
            <Field label={t("Project description", "وصف المشروع")} error={err.description}><textarea className="input min-h-[140px] py-3" value={f.description} onChange={set("description")} maxLength={2000} dir={lang === "ar" ? "rtl" : "ltr"} /></Field>
            {state === "fail" && <p className="rounded-xl bg-red-50 p-4 text-red-800" role="alert">{t("We could not send your enquiry. Check your connection and try again, or use WhatsApp.", "تعذّر إرسال طلبك. تحقق من الاتصال وحاول مجددًا، أو استخدم واتساب.")}</p>}
            <button className="btn-dark justify-self-start" disabled={state === "busy"}>{state === "busy" ? t("Sending…", "جارٍ الإرسال…") : t("Send enquiry", "إرسال الطلب")}</button>
          </form>
        )}
        <aside className="grid content-start gap-4">
          <a href={waLink(s.whatsapp, t("Hello FIKRA DIGITAL, I have a project idea.", "مرحبًا فكرة الرقمية، عندي فكرة مشروع."))} target="_blank" rel="noopener" className="flex items-center gap-4 rounded-3xl bg-[#128C4B] p-6 text-white transition hover:bg-[#0F7A41]">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 00-8.600 15.100L2 22l5-1.300A10 10 0 1012 2zm5.800 14.200c-.200.700-1.400 1.300-2 1.400-.500.100-1.200.100-1.900-.100-.400-.100-1-.300-1.700-.600-3-1.300-4.900-4.300-5.100-4.500-.100-.200-1.200-1.600-1.200-3s.700-2.100 1-2.400c.300-.300.600-.300.800-.300h.600c.200 0 .400-.100.700.500l1 2.300c.100.200.100.400 0 .600l-.400.600-.500.500c-.100.200-.300.300-.100.600.200.300.800 1.300 1.700 2.100 1.200 1 2.100 1.400 2.400 1.500.300.100.500.100.700-.100l.900-1.100c.200-.300.400-.200.700-.100l2.100 1c.300.100.500.200.600.300.100.200.100.700-.100 1.300z" /></svg>
            <span><b className="block font-display text-[18px]">WhatsApp</b><span className="ltr block text-white/80 rtl:text-right">{s.whatsapp}</span></span></a>
          <div className="card grid gap-4 p-6">
            <div><span className="text-[13px] font-semibold uppercase tracking-wide text-slate">{t("Email", "البريد")}</span><a className="ltr block font-semibold hover:text-teal-700 rtl:text-right" href={`mailto:${s.email}`}>{s.email}</a></div>
            <div className="flex gap-5 border-t border-navy/10 pt-4"><a className="font-semibold hover:text-teal-700" href={s.instagram} target="_blank" rel="noopener">Instagram</a><a className="font-semibold hover:text-teal-700" href={s.linkedin} target="_blank" rel="noopener">LinkedIn</a></div>
          </div>
          {s.placeholder && <p className="rounded-2xl bg-[#FFF5DC] p-4 text-[14px] text-[#6E4A00]">{t("These contact details are placeholders. Replace them in Admin → Website content.", "بيانات التواصل هذه مؤقتة. استبدلها من الإدارة ← محتوى الموقع.")}</p>}
        </aside>
      </section>
    </>
  );
}
