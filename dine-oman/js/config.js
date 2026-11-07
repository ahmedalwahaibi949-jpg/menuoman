// Dine Oman: site configuration.
// Leave SUPABASE_URL empty to run in DEMO MODE (data stays in this browser only).
// Fill both values from Supabase → Project Settings → API to go live. The anon key is
// designed to be public; access is enforced by the row-level security in supabase/schema.sql.
window.DINE_CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",

  // Where the site is served from (used in sign-in links). No trailing slash.
  SITE_URL: "https://ahmedalwahaibi949-jpg.github.io/menuoman/dine-oman",

  // Shown to owners on the confirmation screen.
  SUPPORT_WHATSAPP: "+968 95989547",
  SUPPORT_EMAIL: "partners@dineoman.com",

  // Subscription packages. Prices are placeholders: confirm before launch.
  PACKAGES: [
    {
      id: "basic", name: "Basic", ar: "أساسي", price: "Free", period: "",
      blurb: "Get listed and found.",
      features: ["Restaurant page with menu, hours and map", "Appears in search and filters", "Logo and cover photo", "Instagram and website links"]
    },
    {
      id: "featured", name: "Featured", ar: "مميّز", price: "OMR 15", period: "/ month", popular: true,
      blurb: "Stand out in your area.",
      features: ["Everything in Basic", "Featured badge and higher placement in your area", "Photo gallery up to 12 images", "Monthly views and calls report"]
    },
    {
      id: "premium", name: "Premium", ar: "بريميوم", price: "OMR 35", period: "/ month",
      blurb: "Promote across Oman.",
      features: ["Everything in Featured", "Homepage and category spotlights", "One Instagram feature per month", "Priority support on WhatsApp"]
    }
  ]
};
