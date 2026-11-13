import type { Bi } from "./i18n";

// Default website content. Everything here can be overridden from the admin dashboard
// (stored in the `content` table / demo storage under the same keys).

export type DemoKind = "restaurant" | "estate" | "construction" | "menu" | "shop" | "saas";
export type Service = {
  slug: string; n: string; visual: "web" | "shop" | "saas" | "interactive";
  title: Bi; short: Bi; description: Bi; benefits: Bi[]; features: Bi[]; items: Bi[];
  priceFrom: number | null; priceNote: Bi; seo: Bi;
};
export type Project = {
  slug: string; demo: DemoKind; category: "restaurants" | "corporate" | "realestate" | "ecommerce" | "saas";
  title: Bi; summary: Bi; concept: Bi; features: Bi[]; tech: string[]; published: boolean;
};
export type Pack = { id: string; name: Bi; price: number; blurb: Bi; features: Bi[]; popular?: boolean };
export type Pricing = { currency: string; packs: Pack[]; included: Bi[]; extra: Bi[]; saasNote: Bi };
export type Site = { whatsapp: string; email: string; instagram: string; linkedin: string; placeholder: boolean };
export type Testimonial = { id: string; name: string; company: string; quote: Bi; published: boolean };
export type About = { intro: Bi; mission: Bi; vision: Bi; values: { title: Bi; text: Bi }[]; approach: Bi };
export type BoardsPlan = { monthly: number; bank: { bank: string; holder: string; account: string } };
export type BoardsContent = { hidden: string[]; pricing: { setup: number | null; monthly: number | null }; plan?: BoardsPlan };
export type Content = { services: Service[]; projects: Project[]; pricing: Pricing; site: Site; testimonials: Testimonial[]; about: About; boards: BoardsContent };

const b = (en: string, ar: string): Bi => ({ en, ar });

export const CATEGORIES: { id: Project["category"]; label: Bi }[] = [
  { id: "restaurants", label: b("Restaurants", "المطاعم") },
  { id: "corporate", label: b("Corporate", "الشركات") },
  { id: "realestate", label: b("Real Estate", "العقارات") },
  { id: "ecommerce", label: b("E-commerce", "المتاجر الإلكترونية") },
  { id: "saas", label: b("SaaS Applications", "تطبيقات SaaS") }
];

export const DEFAULTS: Content = {
  services: [
    {
      slug: "website-development", n: "01", visual: "web",
      title: b("Website Development", "تطوير المواقع"),
      short: b("Professional websites designed to attract customers and build trust.", "مواقع احترافية تجذب العملاء وتبني الثقة."),
      description: b("A website is often the first place a customer meets your business. We design and build fast, clear websites in Arabic and English that explain what you do and make it easy to contact you.",
        "الموقع هو غالبًا أول مكان يتعرّف فيه العميل على نشاطك. نصمم ونبني مواقع سريعة وواضحة بالعربية والإنجليزية تشرح ما تقدمه وتسهّل التواصل معك."),
      benefits: [b("Customers find you on Google and maps", "يجدك العملاء في جوجل والخرائط"), b("A professional first impression on every phone", "انطباع أول احترافي على كل هاتف"), b("Enquiries reach you by form and WhatsApp", "تصلك الطلبات عبر النموذج وواتساب")],
      features: [b("Responsive, mobile-first design", "تصميم متجاوب يبدأ من الهاتف"), b("Arabic and English with right-to-left support", "العربية والإنجليزية مع دعم الاتجاه من اليمين"), b("Search engine basics set up", "إعداد أساسيات محركات البحث"), b("Contact forms and WhatsApp button", "نماذج تواصل وزر واتساب"), b("Google Maps location", "موقعك على خرائط جوجل")],
      items: [b("Corporate websites", "مواقع الشركات"), b("Small business websites", "مواقع الأعمال الصغيرة"), b("Landing pages", "صفحات الهبوط"), b("Personal portfolios", "معارض الأعمال الشخصية"), b("Real estate websites", "مواقع العقارات")],
      priceFrom: 149, priceNote: b("Starter package", "الباقة الأساسية"),
      seo: b("Website Development Oman · Web Design Muscat", "تطوير المواقع في عُمان · تصميم مواقع مسقط")
    },
    {
      slug: "ecommerce", n: "02", visual: "shop",
      title: b("E-commerce Solutions", "حلول التجارة الإلكترونية"),
      short: b("Online stores designed to make selling easier.", "متاجر إلكترونية مصممة لتسهيل البيع."),
      description: b("We build online stores where customers browse, add to cart and order in a few taps, and where you manage products and orders without technical help.",
        "نبني متاجر إلكترونية يتصفح فيها العميل ويضيف إلى السلة ويطلب بضغطات قليلة، وتدير أنت المنتجات والطلبات دون مساعدة تقنية."),
      benefits: [b("Sell outside shop hours", "بيع خارج ساعات العمل"), b("See every order in one place", "كل الطلبات في مكان واحد"), b("Update products and prices yourself", "حدّث المنتجات والأسعار بنفسك")],
      features: [b("Product catalogue with categories", "كتالوج منتجات بتصنيفات"), b("Shopping cart and checkout", "سلة تسوق وإتمام الطلب"), b("Order management dashboard", "لوحة إدارة الطلبات"), b("Stock and price management", "إدارة المخزون والأسعار"), b("Payment integration where the provider supports it", "ربط الدفع عند توفر الدعم من مزوّد الخدمة")],
      items: [b("Online stores", "متاجر إلكترونية"), b("Product management", "إدارة المنتجات"), b("Shopping carts", "سلال التسوق"), b("Order management", "إدارة الطلبات"), b("Payment integration where supported", "ربط الدفع حيثما كان مدعومًا")],
      priceFrom: null, priceNote: b("Quoted per store", "تسعير حسب المتجر"),
      seo: b("E-commerce Development Oman", "تطوير المتاجر الإلكترونية في عُمان")
    },
    {
      slug: "saas-web-applications", n: "03", visual: "saas",
      title: b("SaaS & Web Applications", "تطبيقات الويب و SaaS"),
      short: b("Custom digital platforms, dashboards and business systems.", "منصات رقمية ولوحات تحكم وأنظمة أعمال مخصصة."),
      description: b("When a spreadsheet or a ready-made tool no longer fits, we design and build a system around how your business actually works, with logins, roles and the reports you need.",
        "عندما لا يكفي جدول البيانات أو الأداة الجاهزة، نصمم ونبني نظامًا يناسب طريقة عمل نشاطك، بتسجيل دخول وصلاحيات والتقارير التي تحتاجها."),
      benefits: [b("One system instead of scattered files", "نظام واحد بدل ملفات متفرقة"), b("Each person sees only what they should", "كل شخص يرى ما يخصه فقط"), b("Built to grow with your business", "قابل للتوسع مع نشاطك")],
      features: [b("Customer and admin dashboards", "لوحات للعملاء والإدارة"), b("Secure login and role-based permissions", "دخول آمن وصلاحيات حسب الدور"), b("Subscriptions and plans", "اشتراكات وباقات"), b("Database design and security rules", "تصميم قاعدة البيانات وقواعد الحماية"), b("Reports and exports", "تقارير وتصدير")],
      items: [b("Custom platforms", "منصات مخصصة"), b("Customer dashboards", "لوحات العملاء"), b("Admin dashboards", "لوحات الإدارة"), b("Subscription systems", "أنظمة الاشتراكات"), b("Business management tools", "أدوات إدارة الأعمال")],
      priceFrom: null, priceNote: b("Quotation after a discovery call", "عرض سعر بعد جلسة تعريفية"),
      seo: b("SaaS Development Oman", "تطوير SaaS في عُمان")
    },
    {
      slug: "interactive-experiences", n: "04", visual: "interactive",
      title: b("Interactive Digital Experiences", "تجارب رقمية تفاعلية"),
      short: b("QR menus, booking systems, customer portals and interactive solutions.", "قوائم QR وأنظمة حجز وبوابات عملاء وحلول تفاعلية."),
      description: b("Small digital tools that change how customers deal with you: a menu that opens from a table code and moves under their finger, a booking page that fills your calendar, a portal where clients follow their order.",
        "أدوات رقمية صغيرة تغيّر طريقة تعامل العملاء معك: منيو يفتح من كود الطاولة ويتحرك تحت الإصبع، صفحة حجز تملأ جدولك، وبوابة يتابع فيها العميل طلبه."),
      benefits: [b("No app for customers to install", "دون تطبيق يثبّته العميل"), b("Change content in minutes", "تعديل المحتوى في دقائق"), b("Works on any phone", "يعمل على أي هاتف")],
      features: [b("Animated QR restaurant menus", "قوائم مطاعم QR متحركة"), b("Appointment and table booking", "حجز المواعيد والطاولات"), b("Customer portals", "بوابات العملاء"), b("Arabic and English", "العربية والإنجليزية"), b("Printable QR codes", "أكواد QR للطباعة")],
      items: [b("Restaurant digital menus", "قوائم المطاعم الرقمية"), b("QR code menus", "قوائم QR"), b("Appointment booking", "حجز المواعيد"), b("Online reservation systems", "أنظمة الحجز الإلكتروني"), b("Customer portals", "بوابات العملاء")],
      priceFrom: null, priceNote: b("Request a quote", "اطلب عرض سعر"),
      seo: b("Restaurant Digital Menu Oman", "المنيو الرقمي للمطاعم في عُمان")
    }
  ],
  projects: [
    { slug: "sahel-restaurant", demo: "restaurant", category: "restaurants", published: true,
      title: b("Sahel · Restaurant website", "ساحل · موقع مطعم"),
      summary: b("A seafood restaurant site built around the menu and table booking.", "موقع مطعم بحري يتمحور حول المنيو وحجز الطاولات."),
      concept: b("Diners decide with their eyes and book on impulse, so the menu and the booking form sit on the first screen and work with one thumb.", "الزبون يقرر بعينه ويحجز بسرعة، لذلك المنيو ونموذج الحجز في الشاشة الأولى ويعملان بإبهام واحد."),
      features: [b("Menu with categories", "منيو بتصنيفات"), b("Table booking form", "نموذج حجز طاولة"), b("Opening hours and map", "أوقات العمل والخريطة"), b("Arabic and English", "العربية والإنجليزية")],
      tech: ["React", "TypeScript", "Tailwind CSS"] },
    { slug: "qimma-real-estate", demo: "estate", category: "realestate", published: true,
      title: b("Qimma · Luxury real estate", "قمّة · عقارات فاخرة"),
      summary: b("A property site with search filters and a viewing request.", "موقع عقاري ببحث وفلاتر وطلب معاينة."),
      concept: b("Buyers compare. The listing grid filters instantly by type, bedrooms and budget, and every property leads to one action: request a viewing.", "المشتري يقارن. تتصفى القائمة فورًا حسب النوع والغرف والميزانية، وكل عقار يقود إلى إجراء واحد: طلب معاينة."),
      features: [b("Live property filters", "فلاتر فورية للعقارات"), b("Property detail view", "صفحة تفاصيل العقار"), b("Viewing request form", "نموذج طلب معاينة"), b("Price in OMR", "الأسعار بالريال العُماني")],
      tech: ["React", "TypeScript", "Tailwind CSS", "Supabase"] },
    { slug: "binaa-construction", demo: "construction", category: "corporate", published: true,
      title: b("Binaa · Construction company", "بناء · شركة مقاولات"),
      summary: b("A corporate site that shows capability and collects tender enquiries.", "موقع شركة يعرض القدرات ويستقبل طلبات المناقصات."),
      concept: b("Clients and consultants look for proof of scope. Services, sectors and a clear enquiry route replace long paragraphs.", "العملاء والاستشاريون يبحثون عن دليل على القدرة. الخدمات والقطاعات ومسار واضح للطلب بدل الفقرات الطويلة."),
      features: [b("Services and sectors", "الخدمات والقطاعات"), b("Project stages timeline", "مراحل المشروع"), b("Enquiry form", "نموذج طلب"), b("Downloadable profile", "ملف تعريفي للتحميل")],
      tech: ["React", "TypeScript", "Tailwind CSS"] },
    { slug: "interactive-menu", demo: "menu", category: "restaurants", published: true,
      title: b("Interactive restaurant menu", "منيو مطعم تفاعلي"),
      summary: b("A QR menu where dishes move when touched.", "منيو QR تتحرك فيه الأطباق عند اللمس."),
      concept: b("The menu opens from a table code with no app. Large dish photos animate under the finger, in Arabic or English.", "ينفتح المنيو من كود الطاولة دون تطبيق. صور الأطباق كبيرة وتتحرك تحت الإصبع بالعربية أو الإنجليزية."),
      features: [b("Opens from a QR code", "يفتح من كود QR"), b("Animated dishes", "أطباق متحركة"), b("Categories and dish details", "تصنيفات وتفاصيل الأطباق"), b("Arabic and English", "العربية والإنجليزية")],
      tech: ["HTML", "CSS", "JavaScript"] },
    { slug: "souq-store", demo: "shop", category: "ecommerce", published: true,
      title: b("Souq · E-commerce store", "سوق · متجر إلكتروني"),
      summary: b("A store for Omani products with a working cart.", "متجر لمنتجات عُمانية بسلة تعمل فعليًا."),
      concept: b("Few products, each with a clear photo and price. The cart is always one tap away and shows the total in OMR.", "منتجات قليلة لكل منها صورة وسعر واضحان. السلة على بعد ضغطة وتعرض الإجمالي بالريال العُماني."),
      features: [b("Product grid and categories", "شبكة منتجات وتصنيفات"), b("Working cart with quantities", "سلة تعمل مع الكميات"), b("Order summary", "ملخص الطلب"), b("Mobile-first", "يبدأ من الهاتف")],
      tech: ["React", "TypeScript", "Tailwind CSS", "Supabase"] },
    { slug: "mizan-dashboard", demo: "saas", category: "saas", published: true,
      title: b("Mizan · SaaS dashboard", "ميزان · لوحة SaaS"),
      summary: b("A business dashboard with live charts and a task board.", "لوحة أعمال برسوم حيّة ولوحة مهام."),
      concept: b("The first screen answers one question: how is the business doing this month? Detail is one click away.", "الشاشة الأولى تجيب عن سؤال واحد: كيف حال النشاط هذا الشهر؟ والتفاصيل على بعد ضغطة."),
      features: [b("Revenue and orders charts", "رسوم الإيرادات والطلبات"), b("Period switcher", "تبديل الفترة"), b("Task board", "لوحة مهام"), b("Role-based access", "صلاحيات حسب الدور")],
      tech: ["React", "TypeScript", "Tailwind CSS", "Supabase"] }
  ],
  pricing: {
    currency: "OMR",
    packs: [
      { id: "starter", name: b("Starter", "الأساسية"), price: 149, blurb: b("A clean presence for a new or small business.", "حضور مرتب لنشاط جديد أو صغير."),
        features: [b("Up to five pages", "حتى خمس صفحات"), b("Responsive design", "تصميم متجاوب"), b("Contact form", "نموذج تواصل"), b("WhatsApp integration", "ربط واتساب"), b("Basic SEO", "أساسيات SEO")] },
      { id: "professional", name: b("Professional", "الاحترافية"), price: 299, popular: true, blurb: b("For businesses that want to stand out in two languages.", "للأعمال التي تريد التميّز بلغتين."),
        features: [b("Up to ten pages", "حتى عشر صفحات"), b("Premium design", "تصميم مميّز"), b("Arabic and English", "العربية والإنجليزية"), b("SEO setup", "إعداد SEO"), b("Google Maps", "خرائط جوجل"), b("Advanced contact forms", "نماذج تواصل متقدمة")] },
      { id: "premium", name: b("Premium", "المتميزة"), price: 499, blurb: b("Custom design with the functionality your business needs.", "تصميم خاص مع الوظائف التي يحتاجها نشاطك."),
        features: [b("Custom design", "تصميم مخصص"), b("Advanced functionality", "وظائف متقدمة"), b("Database integration where required", "ربط قاعدة بيانات عند الحاجة"), b("Admin dashboard where required", "لوحة إدارة عند الحاجة"), b("Advanced integrations", "تكاملات متقدمة")] }
    ],
    included: [b("Design and development of the pages in your package", "تصميم وتطوير صفحات باقتك"), b("Testing on phones, tablets and desktops", "اختبار على الهواتف والأجهزة اللوحية والحواسيب"), b("Launch on your domain", "النشر على نطاقك"), b("A handover session", "جلسة تسليم")],
    extra: [b("Domain name and hosting fees", "رسوم النطاق والاستضافة"), b("Photography, video and copywriting", "التصوير والفيديو وكتابة المحتوى"), b("Pages or features beyond your package", "صفحات أو مزايا خارج باقتك"), b("Payment gateway fees and third-party subscriptions", "رسوم بوابات الدفع واشتراكات الأطراف الأخرى"), b("Ongoing maintenance after launch", "الصيانة المستمرة بعد النشر")],
    saasNote: b("SaaS platforms, dashboards and custom systems are quoted individually after a discovery call, because scope decides the price.", "منصات SaaS ولوحات التحكم والأنظمة المخصصة تُسعَّر بشكل منفرد بعد جلسة تعريفية، لأن نطاق العمل هو ما يحدد السعر.")
  },
  site: { whatsapp: "+968 0000 0000", email: "hello@fikradigital.example", instagram: "https://instagram.com/", linkedin: "https://linkedin.com/", placeholder: true },
  testimonials: [],
  boards: { hidden: [], pricing: { setup: null, monthly: null }, plan: { monthly: 9, bank: { bank: "", holder: "", account: "" } } },
  about: {
    intro: b("FIKRA DIGITAL combines design, technology and practical business thinking to build modern digital solutions for businesses in Oman.",
      "تجمع فكرة الرقمية بين التصميم والتقنية والتفكير العملي في الأعمال لبناء حلول رقمية حديثة للأعمال في عُمان."),
    mission: b("To turn business ideas into digital experiences that are clear, useful and easy to run.", "تحويل أفكار الأعمال إلى تجارب رقمية واضحة ومفيدة وسهلة الإدارة."),
    vision: b("To be a trusted digital partner for businesses in Oman, and in time across the GCC.", "أن نكون شريكًا رقميًا موثوقًا للأعمال في عُمان، ثم في دول الخليج."),
    values: [
      { title: b("Clarity", "الوضوح"), text: b("Plain language, clear prices and no surprises.", "لغة بسيطة وأسعار واضحة ودون مفاجآت.") },
      { title: b("Craft", "الإتقان"), text: b("Details matter, from the first pixel to the last line of code.", "التفاصيل مهمة، من أول بكسل إلى آخر سطر برمجي.") },
      { title: b("Usefulness", "الفائدة"), text: b("Every feature should help the business or its customer.", "كل ميزة يجب أن تفيد النشاط أو عميله.") },
      { title: b("Honesty", "الأمانة"), text: b("We say what we can deliver, and we deliver it.", "نقول ما نستطيع تنفيذه، وننفذه.") }
    ],
    approach: b("We start with your business, not with a template. We listen, design around your customers, build with modern tools, test on real phones, then stay available after launch.",
      "نبدأ من نشاطك لا من قالب جاهز. نستمع، ونصمم حول عملائك، ونبني بأدوات حديثة، ونختبر على هواتف حقيقية، ثم نبقى متاحين بعد النشر.")
  }
};

export const SERVICE_OPTIONS: Bi[] = [
  b("Website Development", "تطوير المواقع"), b("E-commerce", "متجر إلكتروني"), b("SaaS / Web Application", "تطبيق ويب / SaaS"),
  b("Interactive Solution (QR menu, booking, portal)", "حل تفاعلي (منيو QR، حجز، بوابة)"), b("Not sure yet", "لست متأكدًا بعد")
];
export const BUDGET_OPTIONS: Bi[] = [
  b("Under 150 OMR", "أقل من 150 ر.ع"), b("150 to 300 OMR", "150 إلى 300 ر.ع"), b("300 to 500 OMR", "300 إلى 500 ر.ع"),
  b("500 to 1,500 OMR", "500 إلى 1,500 ر.ع"), b("Over 1,500 OMR", "أكثر من 1,500 ر.ع"), b("I need advice", "أحتاج استشارة")
];

/** The self-service plan, with defaults for older saved settings. Bank details are empty until the owner adds them in admin. */
export function planOf(c: Content): BoardsPlan {
  const p = c.boards?.plan;
  return { monthly: typeof p?.monthly === "number" && p.monthly > 0 ? p.monthly : 9, bank: { bank: p?.bank?.bank || "", holder: p?.bank?.holder || "", account: p?.bank?.account || "" } };
}
