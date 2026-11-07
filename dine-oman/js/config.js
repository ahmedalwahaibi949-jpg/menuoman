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
    { id: "free", name: "Free", ar: "مجاني", price: "OMR 0", period: "", blurb: "Get listed and found.",
      features: ["Public restaurant page", "Logo, cover and 4 food photos", "Search and map listing", "Instagram and website links"] },
    { id: "standard", name: "Standard", ar: "قياسي", price: "OMR 5", period: "/ month", blurb: "A complete profile.",
      features: ["Everything in Free", "Gallery up to 12 photos", "Menu upload", "Opening hours and features"] },
    { id: "premium", name: "Premium", ar: "بريميوم", price: "OMR 10", period: "/ month", popular: true, blurb: "Rank higher in your area.",
      features: ["Everything in Standard", "Higher placement in area results", "Gallery up to 24 photos", "Monthly views report"] },
    { id: "featured", name: "Featured", ar: "مميّز", price: "OMR 15", period: "/ month", blurb: "Top of Dine Oman.",
      features: ["Everything in Premium", "Featured badge", "Homepage and category spotlight", "One Instagram feature per month"] }
  ]
};
