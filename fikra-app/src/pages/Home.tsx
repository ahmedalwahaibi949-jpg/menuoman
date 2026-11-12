import { Link } from "react-router-dom";
import { useI18n, useSeo } from "../lib/i18n";
import { useApp } from "../lib/app";
import { Arrow, Counter, Reveal } from "../components/ui";
import { HeroVisual, ServiceVisual } from "../components/Visuals";
import { DemoThumb } from "../demos/Demos";
import { CATEGORIES } from "../lib/content";

export function ConceptTag() {
  const { t } = useI18n();
  return <span className="chip bg-navy text-paper">{t("Concept project", "مشروع تجريبي")}</span>;
}

export function CTA() {
  const { t } = useI18n();
  return (
    <section className="container-x py-20">
      <Reveal>
        <div className="dark-sec rounded-[32px] px-7 py-14 text-center sm:px-14">
          <div className="relative mx-auto max-w-2xl">
            <h2 className="h-sec">{t("Have an Idea? Let’s Build It.", "عندك فكرة؟ لنبنِها معًا.")}</h2>
            <p className="mx-auto mt-4 max-w-xl text-[18px] text-paper/70">{t("Tell us what you have in mind. We reply with a clear plan and a price.", "أخبرنا بما تفكر فيه، ونرد عليك بخطة واضحة وسعر.")}</p>
            <Link to="/contact" className="btn-primary mt-8">{t("Start Your Project", "ابدأ مشروعك")} <Arrow /></Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default function Home() {
  const { t, L } = useI18n();
  const { content } = useApp();
  useSeo(t("FIKRA DIGITAL · Website Development & Web Design in Oman", "فكرة الرقمية · تطوير وتصميم المواقع في عُمان"),
    t("FIKRA DIGITAL designs and builds websites, e-commerce stores, SaaS platforms and interactive restaurant menus for businesses in Muscat and across Oman.", "فكرة الرقمية تصمم وتبني المواقع والمتاجر الإلكترونية ومنصات SaaS وقوائم المطاعم التفاعلية للأعمال في مسقط وعُمان."));
  const projects = content.projects.filter(p => p.published);
  const why = [
    [t("Modern design", "تصميم عصري"), t("Clean, current and made for your brand, not a recycled template.", "نظيف وحديث ومصنوع لعلامتك، لا قالبًا مكررًا.")],
    [t("Custom solutions", "حلول مخصصة"), t("Built around how your business works.", "مبنية حول طريقة عمل نشاطك.")],
    [t("Mobile-first experiences", "تجارب تبدأ من الهاتف"), t("Designed for the phone first, because that is where your customers are.", "نصمم للهاتف أولًا لأن عملاءك هناك.")],
    [t("Business-focused development", "تطوير يخدم العمل"), t("Every page has a job: an enquiry, a booking or a sale.", "لكل صفحة مهمة: طلب أو حجز أو بيع.")],
    [t("Ongoing support", "دعم مستمر"), t("We stay available after launch for updates and fixes.", "نبقى متاحين بعد النشر للتحديثات والإصلاحات.")]
  ];
  const steps = [
    [t("Discover", "نتعرّف"), t("We learn about your business, customers and goals.", "نفهم نشاطك وعملاءك وأهدافك.")],
    [t("Design", "نصمم"), t("We create the visual experience and agree it with you.", "نبتكر التجربة البصرية ونتفق عليها معك.")],
    [t("Develop", "نطوّر"), t("We build the actual solution.", "نبني الحل الفعلي.")],
    [t("Launch", "ننشر"), t("We test on real devices and publish.", "نختبر على أجهزة حقيقية وننشر.")],
    [t("Support", "ندعم"), t("We maintain and improve.", "نصون ونطوّر.")]
  ];
  const quotes = content.testimonials.filter(q => q.published);

  return (
    <>
      {/* HERO */}
      <section className="dark-sec grid-glow">
        <div className="container-x relative grid items-center gap-12 pb-20 pt-14 lg:grid-cols-[1.1fr_.9fr] lg:pb-28 lg:pt-20">
          <div>
            <p className="eyebrow !text-teal animate-rise">{t("Digital agency · Sultanate of Oman", "وكالة رقمية · سلطنة عُمان")}</p>
            <h1 className="mt-5 font-display text-[clamp(38px,6.2vw,76px)] font-extrabold leading-[1.02] animate-rise" style={{ animationDelay: "80ms" }}>
              {t("Your Ideas Deserve More Than ", "أفكارك تستحق أكثر من ")}<span className="bg-gradient-to-r from-teal to-[#7CF3E8] bg-clip-text text-transparent">{t("Just a Website.", "مجرد موقع.")}</span>
            </h1>
            <p className="mt-6 max-w-[46ch] text-[19px] leading-relaxed text-paper/75 animate-rise" style={{ animationDelay: "160ms" }}>
              {t("We design and build digital experiences that help businesses grow, connect with customers and stand out.", "نصمم ونبني تجارب رقمية تساعد الأعمال على النمو والتواصل مع عملائها والتميّز.")}
            </p>
            <div className="mt-9 flex flex-wrap gap-3 animate-rise" style={{ animationDelay: "240ms" }}>
              <Link to="/portfolio" className="btn-primary">{t("Explore Our Work", "استكشف أعمالنا")} <Arrow /></Link>
              <Link to="/contact" className="btn-ghost">{t("Start a Project", "ابدأ مشروعك")}</Link>
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="container-x py-20 lg:py-28" id="services">
        <Reveal><p className="eyebrow">{t("What we do", "ماذا نقدّم")}</p><h2 className="h-sec mt-3 max-w-[18ch]">{t("Four ways we turn ideas into something real.", "أربع طرق نحوّل بها الأفكار إلى واقع.")}</h2></Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {content.services.map((s, i) => (
            <Reveal key={s.slug} delay={i * 80}>
              <Link to={`/services/${s.slug}`} className="card group block h-full p-5 transition duration-300 hover:-translate-y-1 hover:border-teal-600">
                <ServiceVisual kind={s.visual} />
                <div className="mt-5 flex items-start gap-4 px-1 pb-1">
                  <span className="font-display text-[15px] font-bold text-teal-700">{s.n}</span>
                  <div className="min-w-0"><h3 className="text-[22px] font-bold">{L(s.title)}</h3><p className="mt-1.5 text-slate">{L(s.short)}</p>
                    <span className="mt-3 inline-flex items-center gap-2 text-[14.5px] font-semibold text-navy transition group-hover:gap-3 group-hover:text-teal-700">{t("See details", "التفاصيل")} <Arrow /></span></div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SELECTED WORK */}
      <section className="bg-mist py-20 lg:py-28">
        <div className="container-x">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div><p className="eyebrow">{t("Selected work", "أعمال مختارة")}</p><h2 className="h-sec mt-3">{t("Concepts you can click through.", "نماذج تستطيع تجربتها.")}</h2>
              <p className="lead mt-3 max-w-[58ch]">{t("These are demonstration concepts, not client projects. Each one opens into a working demo.", "هذه نماذج تجريبية وليست مشاريع لعملاء. كل نموذج يفتح عرضًا يعمل فعليًا.")}</p></div>
            <Link to="/portfolio" className="btn-line">{t("View all work", "كل الأعمال")}</Link>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 80}>
                <Link to={`/portfolio/${p.slug}`} className="card group block overflow-hidden transition duration-300 hover:-translate-y-1">
                  <div className="relative"><DemoThumb kind={p.demo} /><div className="absolute start-3 top-3"><ConceptTag /></div>
                    <div className="absolute inset-0 grid place-items-center bg-navy/0 opacity-0 transition duration-300 group-hover:bg-navy/55 group-hover:opacity-100"><span className="btn-primary !min-h-[44px]">{t("Open demo", "افتح العرض")}</span></div></div>
                  <div className="p-5"><span className="text-[13px] font-semibold text-teal-700">{L(CATEGORIES.find(c => c.id === p.category)?.label)}</span><h3 className="mt-1 text-[19px] font-bold">{L(p.title)}</h3><p className="mt-1 text-[15px] text-slate">{L(p.summary)}</p></div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WHY FIKRA */}
      <section className="dark-sec py-20 lg:py-28">
        <div className="container-x relative grid gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <Reveal><p className="eyebrow !text-teal">{t("Why FIKRA?", "لماذا فكرة؟")}</p><h2 className="h-sec mt-3">{t("Creativity Meets Technology.", "حيث يلتقي الإبداع بالتقنية.")}</h2>
            <div className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-8">
              {[[content.services.length, t("service areas", "مجالات خدمة")], [steps.length, t("step process", "خطوات عمل")], [projects.length, t("concept demos", "نماذج تجريبية")], [2, t("languages", "لغتان")]].map(([n, l]) => (
                <div key={String(l)}><b className="font-display text-[44px] font-extrabold leading-none text-teal"><Counter to={n as number} /></b><span className="mt-1 block text-paper/60">{l}</span></div>))}
            </div></Reveal>
          <div className="grid gap-px overflow-hidden rounded-3xl bg-white/10">
            {why.map(([a, b], i) => (
              <Reveal key={a} delay={i * 60}><div className="flex gap-5 bg-navy-800 p-6 transition hover:bg-navy-700"><span className="font-display text-teal">0{i + 1}</span><div><h3 className="text-[19px] font-bold">{a}</h3><p className="mt-1 text-paper/65">{b}</p></div></div></Reveal>))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="container-x py-20 lg:py-28">
        <Reveal><p className="eyebrow">{t("Our process", "طريقة عملنا")}</p><h2 className="h-sec mt-3">{t("Five clear steps, no surprises.", "خمس خطوات واضحة دون مفاجآت.")}</h2></Reveal>
        <ol className="mt-12 grid gap-0 md:grid-cols-5">
          {steps.map(([a, b], i) => (
            <Reveal key={a} delay={i * 90}>
              <li className="relative border-t-2 border-navy/10 pe-6 pt-6 md:h-full">
                <span className="absolute -top-[9px] start-0 h-4 w-4 rounded-full border-4 border-paper bg-teal shadow-glow" />
                <span className="font-display text-[14px] font-bold text-teal-700">0{i + 1}</span><h3 className="mt-1 text-[21px] font-bold">{a}</h3><p className="mt-1.5 pb-6 text-[15.5px] text-slate">{b}</p>
              </li>
            </Reveal>))}
        </ol>
      </section>

      {quotes.length > 0 && (
        <section className="bg-mist py-20"><div className="container-x"><p className="eyebrow">{t("Clients", "العملاء")}</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">{quotes.map(q => <figure key={q.id} className="card p-7"><blockquote className="text-[18px] leading-relaxed">“{L(q.quote)}”</blockquote><figcaption className="mt-4 text-[15px] text-slate"><b className="text-ink">{q.name}</b> · {q.company}</figcaption></figure>)}</div></div></section>
      )}

      <CTA />
    </>
  );
}
