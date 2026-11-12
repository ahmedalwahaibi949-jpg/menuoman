import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { useApp } from "../lib/app";
import { api, LIVE } from "../lib/store";
import { Logo } from "./ui";

export const waLink = (num: string, text = "") => `https://wa.me/${num.replace(/\D/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export default function Layout() {
  const { t, lang, setLang } = useI18n();
  const { user, content } = useApp();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const bare = loc.pathname.startsWith("/admin");

  useEffect(() => { setOpen(false); window.scrollTo({ top: 0 }); void api.track(loc.pathname); }, [loc.pathname]);
  useEffect(() => { const f = () => setScrolled(window.scrollY > 12); f(); addEventListener("scroll", f, { passive: true }); return () => removeEventListener("scroll", f); }, []);

  const links = [
    ["/services", t("Services", "الخدمات")], ["/portfolio", t("Work", "أعمالنا")], ["/pricing", t("Pricing", "الأسعار")],
    ["/about", t("About", "من نحن")], ["/contact", t("Contact", "تواصل")]
  ] as const;

  return (
    <div className="flex min-h-screen flex-col">
      {!LIVE && (
        <div className="bg-[#FFF5DC] px-4 py-1.5 text-center text-[13px] text-[#6E4A00]">
          {t("Demo mode: accounts and enquiries are saved in this browser only.", "وضع تجريبي: الحسابات والطلبات محفوظة في هذا المتصفح فقط.")}
        </div>
      )}
      <header className={`sticky top-0 z-50 transition-colors duration-300 ${scrolled || open || bare ? "bg-navy/95 backdrop-blur" : "bg-navy"}`}>
        <div className="container-x flex h-[72px] items-center justify-between gap-4">
          <Link to="/" aria-label="FIKRA DIGITAL"><Logo light /></Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label={t("Main", "الرئيسية")}>
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `text-[15px] transition ${isActive ? "text-teal" : "text-paper/80 hover:text-paper"}`}>{label}</NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="text-[14.5px] text-paper/70 hover:text-paper" aria-label={t("Switch to Arabic", "التبديل إلى الإنجليزية")}>
              {lang === "ar" ? "English" : "العربية"}
            </button>
            <Link to={user ? (user.role === "admin" ? "/admin" : "/portal") : "/portal"} className="hidden text-[14.5px] text-paper/80 hover:text-paper sm:block">
              {user ? (user.role === "admin" ? t("Admin", "الإدارة") : t("My projects", "مشاريعي")) : t("Client login", "دخول العملاء")}
            </Link>
            <Link to="/contact" className="btn-primary hidden !min-h-[42px] !px-5 !text-[14px] md:inline-flex">{t("Start a Project", "ابدأ مشروعك")}</Link>
            <button type="button" className="grid h-10 w-10 place-items-center rounded-lg text-paper lg:hidden" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label={t("Menu", "القائمة")}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{open ? <path d="M5 5l12 12M17 5L5 17" /> : <path d="M3 6h16M3 11h16M3 16h16" />}</svg>
            </button>
          </div>
        </div>
        {open && (
          <nav className="container-x grid gap-1 pb-6 lg:hidden" aria-label={t("Mobile", "الجوال")}>
            {links.map(([to, label]) => <NavLink key={to} to={to} className="border-b border-white/10 py-3.5 text-[17px] text-paper">{label}</NavLink>)}
            <NavLink to="/portal" className="border-b border-white/10 py-3.5 text-[17px] text-paper">{user ? t("My account", "حسابي") : t("Client login", "دخول العملاء")}</NavLink>
            <Link to="/contact" className="btn-primary mt-4">{t("Start a Project", "ابدأ مشروعك")}</Link>
          </nav>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      {!bare && (
        <footer className="dark-sec">
          <div className="container-x relative grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr]">
            <div>
              <Logo light />
              <p className="mt-4 max-w-[34ch] text-paper/70">{t("Ideas into Digital Experiences.", "نحوّل الأفكار إلى تجارب رقمية.")}</p>
              <p className="mt-1 text-paper/50">{t("Sultanate of Oman", "سلطنة عُمان")}</p>
            </div>
            <div className="grid content-start gap-2.5 text-[15px]">
              <b className="mb-1 font-display text-[13px] uppercase tracking-[.16em] text-teal">{t("Explore", "استكشف")}</b>
              {links.map(([to, label]) => <Link key={to} to={to} className="text-paper/75 hover:text-paper">{label}</Link>)}
            </div>
            <div className="grid content-start gap-2.5 text-[15px]">
              <b className="mb-1 font-display text-[13px] uppercase tracking-[.16em] text-teal">{t("Contact", "تواصل")}</b>
              <a className="ltr text-paper/75 hover:text-paper rtl:text-right" href={waLink(content.site.whatsapp)} target="_blank" rel="noopener">WhatsApp {content.site.whatsapp}</a>
              <a className="ltr text-paper/75 hover:text-paper rtl:text-right" href={`mailto:${content.site.email}`}>{content.site.email}</a>
              <a className="text-paper/75 hover:text-paper" href={content.site.instagram} target="_blank" rel="noopener">Instagram</a>
              <a className="text-paper/75 hover:text-paper" href={content.site.linkedin} target="_blank" rel="noopener">LinkedIn</a>
            </div>
          </div>
          <div className="container-x relative flex flex-wrap justify-between gap-3 border-t border-white/10 py-6 text-[13.5px] text-paper/50">
            <span>© {new Date().getFullYear()} FIKRA DIGITAL · فكرة الرقمية</span>
            <Link to="/portal" className="hover:text-paper">{t("Client portal", "بوابة العملاء")}</Link>
          </div>
        </footer>
      )}
    </div>
  );
}
