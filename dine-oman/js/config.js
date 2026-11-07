// Dine Oman: site configuration.
// Leave SUPABASE_URL empty to run in DEMO MODE (everything stays in this browser; emails go to the demo inbox).
// To go live, fill both values from Supabase → Project Settings → API (see SETUP.md).
// The anon key is meant to be public: access is enforced by row-level security in supabase/schema.sql.
window.DINE_CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",

  // Where these pages are served (sign-in links return here). No trailing slash.
  SITE_URL: "https://ahmedalwahaibi949-jpg.github.io/menuoman/dine-oman",
  // Where /restaurant/<slug> resolves (the site root). With a custom domain: "https://dineoman.com".
  PUBLIC_BASE_URL: "https://ahmedalwahaibi949-jpg.github.io/menuoman",

  SUPPORT_WHATSAPP: "+968 95989547",

  PLANS: [
    { id: "free", name: "Free", ar: "مجاني", price: "OMR 0", price_ar: "مجانًا",
      line: "Public page, logo, cover and 4 photos", line_ar: "صفحة عامة، شعار، غلاف و4 صور" },
    { id: "standard", name: "Standard", ar: "قياسي", price: "OMR 5 / month", price_ar: "5 ر.ع. / شهريًا",
      line: "12 photos, menu, opening hours and features", line_ar: "12 صورة، المنيو، أوقات العمل والمميزات" },
    { id: "premium", name: "Premium", ar: "بريميوم", price: "OMR 10 / month", price_ar: "10 ر.ع. / شهريًا",
      line: "Higher placement in your area, 24 photos, monthly report", line_ar: "ظهور أعلى في منطقتك، 24 صورة، تقرير شهري" },
    { id: "featured", name: "Featured", ar: "مميّز", price: "OMR 15 / month", price_ar: "15 ر.ع. / شهريًا",
      line: "Featured badge and homepage spotlight", line_ar: "شارة مميّز وظهور في الصفحة الرئيسية" }
  ]
};
