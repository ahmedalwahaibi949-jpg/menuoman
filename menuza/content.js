/* =====================================================================
   MENUZA — all editable content lives here.
   - Text: every key has an English (en) and Arabic (ar) version.
   - Prices are in OMR. Change a number here and the whole site updates.
   - WhatsApp number: international format without "+".
   ===================================================================== */
window.MENUZA = {
  whatsapp: '96895989547',
  siteUrl: 'https://ahmedalwahaibi949-jpg.github.io/menuoman/menuza/',
  img: '../assets/img/',

  /* ---------- interface text ---------- */
  t: {
    en: {
      'nav.demos': 'Live menus', 'nav.services': 'Services', 'nav.pricing': 'Pricing', 'nav.process': 'Process', 'nav.work': 'Portfolio', 'nav.contact': 'Contact',
      'nav.cta': 'Get your menu', 'lang': 'العربية',
      'hero.title': 'Your Restaurant Deserves More Than a <em>Paper Menu.</em>',
      'hero.sub': 'Transform your restaurant experience with beautifully designed interactive digital menus. Let your customers explore your dishes, discover your menu, and enjoy a seamless experience with just one scan.',
      'hero.cta1': 'Explore Our Menus', 'hero.cta2': 'Get Your Digital Menu',
      'hero.qr': 'Scan to open the live menus on your phone', 'hero.try': 'This menu works. Tap a dish.',
      'hero.facts': 'Designed in Oman · Arabic & English · No app to download',
      'for.title': 'Made for', 'for.list': 'Restaurants · Cafés · Coffee shops · Bakeries · Dessert shops · Hotels',
      'svc.title': 'Everything your menu needs, <em>designed as one experience.</em>',
      'svc.lead': 'We design the menu, the QR codes your guests scan and the brand details that tie them to your restaurant, then keep it all up to date.',
      'demo.title': 'Three menus. <em>Fully working.</em>',
      'demo.lead': 'These are not screenshots. Switch categories, open a dish, change the language, add to an order. This is exactly what your guests will use.',
      'demo.view': 'View Live Demo', 'demo.close': 'Close demo',
      'price.title': 'Clear pricing, <em>in Omani rials.</em>',
      'price.lead': 'One payment for the design. An optional monthly plan if you want us to keep your menu updated for you.',
      'price.popular': 'Most chosen', 'price.once': 'one-time', 'price.choose': 'Choose',
      'sub.title': 'Optional monthly care', 'sub.lead': 'Keep your menu fresh without lifting a finger. Cancel any month.',
      'sub.month': '/ month',
      'how.title': 'From paper to live <em>in five steps.</em>',
      'work.title': 'Selected menu designs',
      'work.lead': 'A real client and three design concepts, each built around a different kind of restaurant.',
      'work.real': 'Client project', 'work.concept': 'Design concept', 'work.open': 'Open this demo',
      'contact.title': 'Request your <em>quotation.</em>',
      'contact.lead': 'Tell us about your restaurant. Your request opens in WhatsApp, ready to send. We reply with a quotation and a design direction.',
      'contact.wa': 'Chat on WhatsApp',
      'f.restaurant': 'Restaurant name', 'f.name': 'Your name', 'f.phone': 'Phone number', 'f.package': 'Package', 'f.notes': 'Additional requirements',
      'f.notesPh': 'Type of cuisine, number of dishes, languages, opening date…',
      'f.pick': 'Choose a package', 'f.unsure': 'Not sure yet — advise me',
      'f.send': 'Send request on WhatsApp', 'f.privacy': 'Nothing is stored on this website. Your details go straight into a WhatsApp message that you review before sending.',
      'f.err.required': 'Please fill this in.', 'f.err.phone': 'Enter an Omani number, e.g. 9xxx xxxx.', 'f.ok': 'WhatsApp is opening with your request.',
      'footer.tag': 'More Than Just a Menu.', 'footer.loc': 'Oman', 'footer.rights': 'All rights reserved.',
      'demo.chef': "Chef's pick", 'demo.add': 'Add to order', 'demo.order': 'View order', 'demo.items': 'items', 'demo.total': 'Total',
      'demo.send': 'Send order on WhatsApp', 'demo.note': 'Demo: in your menu, this sends the order to your restaurant’s WhatsApp.',
      'demo.back': 'Back', 'demo.empty': 'Your order is empty.', 'demo.omr': 'OMR'
    },
    ar: {
      'nav.demos': 'قوائم حيّة', 'nav.services': 'الخدمات', 'nav.pricing': 'الأسعار', 'nav.process': 'طريقة العمل', 'nav.work': 'أعمالنا', 'nav.contact': 'تواصل',
      'nav.cta': 'احصل على قائمتك', 'lang': 'English',
      'hero.title': 'مطعمك يستحق أكثر من <em>قائمة ورقية.</em>',
      'hero.sub': 'ارتقِ بتجربة مطعمك مع قوائم رقمية تفاعلية مصمّمة بإتقان. دع زبائنك يستكشفون أطباقك ويتعرّفون على قائمتك ويستمتعون بتجربة سلسة بمسحة واحدة.',
      'hero.cta1': 'استكشف قوائمنا', 'hero.cta2': 'احصل على قائمتك الرقمية',
      'hero.qr': 'امسح الرمز لتفتح القوائم الحيّة على هاتفك', 'hero.try': 'هذه القائمة تعمل. المس أي طبق.',
      'hero.facts': 'صُمّمت في عُمان · بالعربية والإنجليزية · دون تنزيل أي تطبيق',
      'for.title': 'مصمَّمة لـ', 'for.list': 'المطاعم · المقاهي · محامص القهوة · المخابز · محلات الحلويات · الفنادق',
      'svc.title': 'كل ما تحتاجه قائمتك، <em>في تجربة واحدة متكاملة.</em>',
      'svc.lead': 'نصمّم القائمة، ورموز QR التي يمسحها ضيوفك، وتفاصيل الهوية التي تربطها بمطعمك، ثم نُبقيها محدَّثة دائمًا.',
      'demo.title': 'ثلاث قوائم. <em>تعمل بالكامل.</em>',
      'demo.lead': 'ليست صورًا. تنقّل بين الأقسام، وافتح أي طبق، وغيّر اللغة، وأضف إلى الطلب. هذا تمامًا ما سيستخدمه ضيوفك.',
      'demo.view': 'شاهد العرض الحي', 'demo.close': 'إغلاق العرض',
      'price.title': 'أسعار واضحة <em>بالريال العُماني.</em>',
      'price.lead': 'دفعة واحدة للتصميم، واشتراك شهري اختياري إن أردت أن نتولّى تحديث قائمتك عنك.',
      'price.popular': 'الأكثر اختيارًا', 'price.once': 'دفعة واحدة', 'price.choose': 'اختر',
      'sub.title': 'الرعاية الشهرية الاختيارية', 'sub.lead': 'تبقى قائمتك محدَّثة دون أي جهد منك، ويمكنك الإلغاء في أي شهر.',
      'sub.month': '/ شهريًا',
      'how.title': 'من الورق إلى قائمة حيّة <em>في خمس خطوات.</em>',
      'work.title': 'مختارات من تصاميمنا',
      'work.lead': 'عميل حقيقي وثلاثة مفاهيم تصميم، صُمّم كلٌّ منها لنوع مختلف من المطاعم.',
      'work.real': 'مشروع لعميل', 'work.concept': 'مفهوم تصميم', 'work.open': 'افتح هذا العرض',
      'contact.title': 'اطلب <em>عرض السعر.</em>',
      'contact.lead': 'أخبرنا عن مطعمك، وسيُفتح طلبك في واتساب جاهزًا للإرسال. نردّ عليك بعرض سعر واتجاه مقترح للتصميم.',
      'contact.wa': 'تحدّث معنا عبر واتساب',
      'f.restaurant': 'اسم المطعم', 'f.name': 'اسمك', 'f.phone': 'رقم الهاتف', 'f.package': 'الباقة', 'f.notes': 'متطلبات إضافية',
      'f.notesPh': 'نوع المطبخ، عدد الأطباق، اللغات، موعد الافتتاح…',
      'f.pick': 'اختر باقة', 'f.unsure': 'لم أقرّر بعد، أريد نصيحتكم',
      'f.send': 'أرسل الطلب عبر واتساب', 'f.privacy': 'لا يُحفَظ أي شيء في هذا الموقع. تنتقل بياناتك مباشرة إلى رسالة واتساب تراجعها قبل إرسالها.',
      'f.err.required': 'يُرجى تعبئة هذا الحقل.', 'f.err.phone': 'أدخل رقمًا عُمانيًا، مثل 9xxx xxxx.', 'f.ok': 'يُفتح واتساب الآن وفيه طلبك.',
      'footer.tag': 'أكثر من مجرد قائمة.', 'footer.loc': 'سلطنة عُمان', 'footer.rights': 'جميع الحقوق محفوظة.',
      'demo.chef': 'اختيار الشيف', 'demo.add': 'أضف إلى الطلب', 'demo.order': 'عرض الطلب', 'demo.items': 'أصناف', 'demo.total': 'الإجمالي',
      'demo.send': 'أرسل الطلب عبر واتساب', 'demo.note': 'عرض تجريبي: في قائمتك يُرسَل الطلب إلى واتساب مطعمك.',
      'demo.back': 'رجوع', 'demo.empty': 'طلبك فارغ.', 'demo.omr': 'ر.ع'
    }
  },

  /* ---------- services ---------- */
  services: [
    { id: 'menu', img: 'food/mushroom', en: { name: 'Interactive Digital Menus', items: ['Beautiful digital menus', 'Mobile-friendly interface', 'Food photography', 'Detailed food descriptions', 'Arabic and English support'] },
      ar: { name: 'القوائم الرقمية التفاعلية', items: ['قوائم رقمية أنيقة', 'واجهة مريحة على الهاتف', 'تصوير الأطباق', 'وصف مفصّل لكل طبق', 'دعم العربية والإنجليزية'] } },
    { id: 'qr', img: 'qr', en: { name: 'QR Code Design', items: ['Custom restaurant QR codes', 'Branded QR designs', 'Individual table QR codes', 'Printable QR table displays'] },
      ar: { name: 'تصميم رموز QR', items: ['رموز QR خاصة بمطعمك', 'رموز بهوية مطعمك', 'رمز مستقل لكل طاولة', 'حوامل طاولات جاهزة للطباعة'] } },
    { id: 'brand', img: 'food/steak', en: { name: 'Restaurant Branding', items: ['Custom menu colours', 'Professional typography', 'Restaurant branding integration', 'Premium menu layouts'] },
      ar: { name: 'هوية المطعم', items: ['ألوان مخصّصة للقائمة', 'خطوط احترافية', 'دمج هوية المطعم', 'تخطيطات فاخرة للقائمة'] } },
    { id: 'manage', img: 'food/smash', en: { name: 'Menu Management', items: ['Update food prices', 'Add or remove dishes', 'Change food images', 'Update daily offers', 'Maintain menu information'] },
      ar: { name: 'إدارة القائمة', items: ['تحديث الأسعار', 'إضافة الأطباق أو حذفها', 'تغيير صور الأطباق', 'تحديث العروض اليومية', 'متابعة معلومات القائمة'] } }
  ],

  /* ---------- pricing ---------- */
  plans: [
    { id: 'basic', price: 35, en: { name: 'Basic', items: ['Digital menu design', 'Custom QR code', 'Mobile-friendly design', 'Arabic and English', 'Basic customisation', 'One revision'] },
      ar: { name: 'الأساسية', items: ['تصميم قائمة رقمية', 'رمز QR مخصّص', 'تصميم مريح على الهاتف', 'العربية والإنجليزية', 'تخصيص أساسي', 'تعديل واحد'] } },
    { id: 'pro', price: 65, popular: true, en: { name: 'Professional', items: ['Everything in Basic', 'Premium custom design', 'Food descriptions', 'Professional food images supplied by the client', 'Three revisions', '30 days of support'] },
      ar: { name: 'الاحترافية', items: ['كل ما في الباقة الأساسية', 'تصميم مخصّص فاخر', 'وصف الأطباق', 'صور احترافية للأطباق يزوّدنا بها العميل', 'ثلاثة تعديلات', 'دعم لمدة ٣٠ يومًا'] } },
    { id: 'premium', price: 120, en: { name: 'Premium', items: ['Everything in Professional', 'Advanced custom design', 'Video integration', 'Individual table QR codes', 'Premium animations', 'Three months of support'] },
      ar: { name: 'المميّزة', items: ['كل ما في الباقة الاحترافية', 'تصميم مخصّص متقدّم', 'دمج الفيديو', 'رمز QR لكل طاولة', 'حركات تفاعلية فاخرة', 'دعم لمدة ثلاثة أشهر'] } }
  ],
  /* What each monthly plan includes — edit to match how you work. */
  subscriptions: [
    { id: 'basic', price: 5, en: { name: 'Basic care', items: ['Your menu stays online on its link and QR code', 'One update per month (prices or dishes)', 'WhatsApp support within 48 hours'] },
      ar: { name: 'الرعاية الأساسية', items: ['تبقى قائمتك متاحة على رابطها ورمزها', 'تحديث واحد شهريًا (أسعار أو أطباق)', 'دعم عبر واتساب خلال ٤٨ ساعة'] } },
    { id: 'pro', price: 7, en: { name: 'Professional care', items: ['Everything in Basic care', 'Up to four updates per month, including new photos', 'Daily or weekly offers changed for you', 'WhatsApp support within 24 hours'] },
      ar: { name: 'الرعاية الاحترافية', items: ['كل ما في الرعاية الأساسية', 'حتى أربعة تحديثات شهريًا تشمل الصور الجديدة', 'نغيّر لك العروض اليومية أو الأسبوعية', 'دعم عبر واتساب خلال ٢٤ ساعة'] } },
    { id: 'premium', price: 10, en: { name: 'Premium care', items: ['Everything in Professional care', 'Unlimited small updates', 'Seasonal menus such as Ramadan and Eid', 'Video and animation changes', 'Same-day priority support'] },
      ar: { name: 'الرعاية المميّزة', items: ['كل ما في الرعاية الاحترافية', 'تحديثات صغيرة دون حدّ', 'قوائم موسمية مثل رمضان والعيد', 'تغيير الفيديو والحركات', 'دعم ذو أولوية في اليوم نفسه'] } }
  ],

  /* ---------- process ---------- */
  steps: {
    en: [['Choose your package', 'Pick the plan that fits your restaurant, or ask us to recommend one.'],
         ['Send your restaurant menu', 'Share your dishes, prices, photos and logo on WhatsApp. Paper menus are fine.'],
         ['We design your digital menu', 'We build your menu in your colours, in Arabic and English.'],
         ['Review and approve', 'Try it on your phone and request changes within your revisions.'],
         ['Go live and receive your QR code', 'Your menu goes online and you receive print-ready QR codes.']],
    ar: [['اختر باقتك', 'اختر الباقة التي تناسب مطعمك، أو اطلب منّا أن نقترح عليك واحدة.'],
         ['أرسل قائمة مطعمك', 'شاركنا الأطباق والأسعار والصور والشعار عبر واتساب، ولا بأس بالقائمة الورقية.'],
         ['نصمّم قائمتك الرقمية', 'نبني قائمتك بألوان مطعمك، بالعربية والإنجليزية.'],
         ['راجِع ووافِق', 'جرّبها على هاتفك واطلب التعديلات ضمن عدد التعديلات في باقتك.'],
         ['انطلق واستلم رمز QR', 'تصبح قائمتك متاحة على الإنترنت، وتستلم رموز QR جاهزة للطباعة.']]
  },

  /* ---------- portfolio ---------- */
  portfolio: [
    { kind: 'real', video: '../videos/scircle-nana.mp4', poster: '../assets/img/nana-frame.webp',
      en: ['Nana Tea House', 'QR menu and in-store screen for a tea and dessert café: large photography, gentle motion, the café’s own colours.'],
      ar: ['مقهى نعنع', 'قائمة QR وشاشة عرض لمقهى شاي وحلويات: صور كبيرة وحركة هادئة وألوان المقهى نفسه.'] },
    { kind: 'concept', demo: 'lux', dish: 'food/steak', bg: 'radial-gradient(80% 80% at 70% 20%,#3a2f1e,#0E0D0B 70%)',
      en: ['Saffron & Silk', 'Fine dining in black and gold for an evening restaurant.'], ar: ['زعفران وحرير', 'مطعم مسائي راقٍ بالأسود والذهبي.'] },
    { kind: 'concept', demo: 'cafe', dish: 'karam', bg: 'radial-gradient(80% 80% at 70% 20%,#e9d9bf,#b9905e 85%)',
      en: ['Haven Coffee', 'A warm, quick café menu built for the morning rush.'], ar: ['مقهى الملاذ', 'قائمة مقهى دافئة وسريعة تناسب زحمة الصباح.'] },
    { kind: 'concept', demo: 'burger', dish: 'food/smash', bg: 'radial-gradient(80% 80% at 70% 20%,#4a3a12,#121212 70%)',
      en: ['STACKED', 'A loud burger bar menu with one-tap ordering.'], ar: ['ستاكد', 'قائمة برغر جريئة بطلب من لمسة واحدة.'] },
    { kind: 'concept', shot: '../assets/img/atlas-shot.webp',
      en: ['Atlas', 'A museum-plate menu where every dish has its own page.'], ar: ['أطلس', 'قائمة على هيئة لوحات متحف، لكل طبق صفحته.'] }
  ],

  /* ---------- dishes (shared by the demos) ---------- */
  dishes: {
    steak: { img: 'food/steak', en: ['Steak & Rösti', 'Beef medallions on golden potato rösti with demi-glace and crispy shoestring potatoes.'], ar: ['ستيك على الروستي', 'قطع لحم بقري على روستي البطاطس الذهبية، مع صلصة الديمي غلاس وبطاطس رفيعة مقرمشة.'] },
    salmon: { img: 'food/salmon', en: ['Grilled Salmon Salad', 'Pepper-seared salmon over crisp leaves, cherry tomatoes, olives and feta.'], ar: ['سلطة السلمون المشوي', 'سلمون مشوي بالفلفل على أوراق خضراء وطماطم كرزية وزيتون وجبنة فيتا.'] },
    mushroom: { img: 'food/mushroom', en: ['Mushroom Tagliatelle', 'Tagliatelle in a creamy sauce with browned mushrooms and parsley.'], ar: ['تالياتيلي بالفطر', 'تالياتيلي بصلصة كريمية مع فطر محمّر وبقدونس.'] },
    alfredo: { img: 'food/alfredo', en: ['Fettuccine Alfredo', 'Fettuccine in classic Alfredo sauce with parsley.'], ar: ['فيتوتشيني ألفريدو', 'فيتوتشيني بصلصة الألفريدو الكلاسيكية والبقدونس.'] },
    penne: { img: 'food/penne', en: ['Mediterranean Penne', 'Penne in cream sauce with sun-dried tomatoes and black olives.'], ar: ['بيني متوسطي', 'بيني بصلصة كريمية مع طماطم مجفّفة وزيتون أسود.'] },
    pomodoro: { img: 'food/pomodoro', en: ['Spaghetti Pomodoro', 'Spaghetti in slow-cooked tomato sauce with fresh basil.'], ar: ['سباغيتي بومودورو', 'سباغيتي بصلصة الطماطم المطهوّة ببطء والريحان الطازج.'] },
    parmesan: { img: 'food/parmesan', en: ['Parmesan Spaghetti', 'Spaghetti with cream, parmesan and herbs.'], ar: ['سباغيتي بالبارميزان', 'سباغيتي بالكريمة والبارميزان والأعشاب.'] },
    fusilli: { img: 'food/fusilli', en: ['Fusilli Primavera', 'Fusilli with broccoli, mushrooms, peppers and tomatoes.'], ar: ['فوسيلي بريمافيرا', 'فوسيلي بالبروكلي والفطر والفلفل والطماطم.'] },
    smash: { img: 'food/smash', en: ['Double Smash Burger', 'Two smashed beef patties, melted cheese, pickles and special sauce.'], ar: ['برغر سماش مزدوج', 'قطعتا لحم بقري مضغوطتان، وجبن ذائب، ومخلل، وصلصة خاصة.'] },
    crispy: { img: 'food/crispyburger', en: ['Crispy Onion Burger', 'Beef patty, cheddar, crispy fried onions and house sauce, with fries.'], ar: ['برغر البصل المقرمش', 'لحم بقري وشيدر وبصل مقلي مقرمش وصلصة المنزل، مع بطاطس.'] },
    blue: { img: 'food/blueburger', en: ['Blue Cheese Burger', 'Grilled beef, creamy blue cheese and rocket, with fries.'], ar: ['برغر الجبن الأزرق', 'لحم بقري مشوي مع جبن أزرق كريمي وجرجير، مع بطاطس.'] },
    avo: { img: 'food/avoburger', en: ['Chicken Avocado Burger', 'Grilled chicken, mozzarella, avocado, tomato and rocket.'], ar: ['برغر الدجاج والأفوكادو', 'دجاج مشوي وموزاريلا وأفوكادو وطماطم وجرجير.'] },
    loaded: { img: 'food/loaded', en: ['Loaded Chicken Fries', 'Crispy chicken and fries under cheese sauce, ranch and hot sauce.'], ar: ['بطاطس محمّلة بالدجاج', 'دجاج مقرمش وبطاطس مغطّاة بصلصة الجبن والرانش والصلصة الحارة.'] },
    nanatea: { img: 'nanatea', en: ['Nana Tea', 'Black tea brewed with fresh mint.'], ar: ['شاي بالنعناع', 'شاي أسود يُخمَّر مع النعناع الطازج.'] },
    talqeema: { img: 'talqeema', en: ['Talqeema', 'Strong, slow-brewed tea.'], ar: ['تلقيمة', 'شاي مخمَّر ببطء بنكهة قوية.'] },
    mint: { img: 'mint', en: ['Mint Green Tea', 'Light green tea with mint leaves.'], ar: ['شاي أخضر بالنعناع', 'شاي أخضر خفيف بأوراق النعناع.'] },
    karkade: { img: 'karkade', en: ['Iced Karkade', 'Chilled hibiscus with a creamy top and mint.'], ar: ['كركديه مثلّج', 'كركديه بارد بطبقة كريمية ونعناع.'] },
    herbs: { img: 'herbs', en: ['Herb & Cheese Pie', 'Baked pastry filled with herbs and cheese.'], ar: ['فطيرة الأعشاب والجبن', 'فطيرة مخبوزة محشوّة بالأعشاب والجبن.'] },
    waffle: { img: 'combo_waffle', en: ['Waffle Box', 'Mini waffles with chocolate drizzle and a cup of tea.'], ar: ['علبة الوافل', 'وافل صغير بصلصة الشوكولاتة مع كوب شاي.'] },
    minis: { img: 'waffle6', en: ['Mini Waffles', 'Six bite-size waffles with chocolate.'], ar: ['وافل صغير', 'ست قطع وافل صغيرة بالشوكولاتة.'] },
    lemon: { img: 'lemoncake', en: ['Lemon Cake', 'Soft lemon pound cake.'], ar: ['كيك الليمون', 'كيك ليمون طريّ.'] },
    trifle: { img: 'trifle', en: ['Trifle', 'Layers of sponge, custard and cream.'], ar: ['ترايفل', 'طبقات من الكيك والكاسترد والكريمة.'] },
    basbousa: { img: 'basbousa', en: ['Basbousa', 'Semolina cake with syrup and pistachio.'], ar: ['بسبوسة', 'كيك السميد بالقَطر والفستق.'] },
    cakeduo: { img: 'combo_cake', en: ['Cake Duo', 'Lemon and marble cake slices.'], ar: ['ثنائي الكيك', 'شريحتا كيك بالليمون والرخامي.'] },
    karam: { img: 'karam', en: ['Karam Tray', 'Tea pot, cups, nuts and sweets to share.'], ar: ['صينية الكرم', 'دلّة وأكواب ومكسرات وحلويات للمشاركة.'] },
    dhiyafa: { img: 'dhiyafa', en: ['Dhiyafa Tray', 'Coffee pot, cups and ma’amoul.'], ar: ['صينية الضيافة', 'دلّة قهوة وأكواب ومعمول.'] },
    keif: { img: 'keif', en: ['Keif Set', 'Tea pot with glass cups.'], ar: ['طقم الكيف', 'دلّة شاي مع أكواب زجاجية.'] },
    nuts: { img: 'nuts', en: ['Mixed Nuts', 'A cup of roasted mixed nuts.'], ar: ['مكسرات مشكّلة', 'كوب من المكسرات المحمّصة.'] }
  },

  /* ---------- the three live demos (fictional restaurants, sample prices) ---------- */
  demos: [
    { id: 'lux', feat: 'steak',
      en: { name: 'Saffron & Silk', type: 'Luxury Restaurant', blurb: 'Fine dining in black and gold. Quiet type, large photography, every dish given room.' },
      ar: { name: 'زعفران وحرير', type: 'مطعم فاخر', blurb: 'مطعم راقٍ بالأسود والذهبي، بخطوط هادئة وصور كبيرة تمنح كل طبق مساحته.' },
      theme: { bg: '#0E0D0B', surface: '#18160F', ink: '#F3EBDD', muted: '#A59A86', accent: '#C9A46A', line: 'rgba(243,235,221,.12)', display: "'Bodoni Moda','Markazi Text',serif", displayAr: "'Markazi Text','Bodoni Moda',serif", radius: '4px' },
      cats: [ { en: 'Signatures', ar: 'الأطباق المميّزة', items: [['steak', 9.5], ['salmon', 7.8]] },
              { en: 'Pasta', ar: 'المعكرونة', items: [['mushroom', 5.2], ['alfredo', 4.9], ['penne', 4.9], ['pomodoro', 4.2]] },
              { en: 'Desserts', ar: 'الحلويات', items: [['trifle', 2.8], ['lemon', 2.2]] },
              { en: 'Beverages', ar: 'المشروبات', items: [['karkade', 1.8], ['mint', 1.5]] } ] },
    { id: 'cafe', feat: 'karam',
      en: { name: 'Haven Coffee', type: 'Modern Café', blurb: 'Warm paper tones, soft corners and quick categories for a busy counter.' },
      ar: { name: 'مقهى الملاذ', type: 'مقهى عصري', blurb: 'ألوان دافئة وزوايا ناعمة وأقسام سريعة تناسب مقهى مزدحمًا.' },
      theme: { bg: '#F4EEE4', surface: '#FFFFFF', ink: '#2A2420', muted: '#7E7367', accent: '#A9693A', line: 'rgba(42,36,32,.1)', display: "'Hanken Grotesk','Readex Pro',sans-serif", displayAr: "'Readex Pro',sans-serif", radius: '16px' },
      cats: [ { en: 'Tea', ar: 'الشاي', items: [['nanatea', 0.6], ['talqeema', 0.7], ['mint', 0.6]] },
              { en: 'Cold drinks', ar: 'مشروبات باردة', items: [['karkade', 1.2]] },
              { en: 'Bakery', ar: 'المخبوزات', items: [['herbs', 1.4], ['waffle', 2.3], ['minis', 1.3]] },
              { en: 'Sweets', ar: 'الحلويات', items: [['lemon', 0.9], ['trifle', 1.6], ['basbousa', 1.0], ['cakeduo', 1.9]] },
              { en: 'To share', ar: 'للمشاركة', items: [['karam', 6.5], ['dhiyafa', 4.5], ['keif', 3.5], ['nuts', 1.1]] } ] },
    { id: 'burger', feat: 'smash',
      en: { name: 'STACKED', type: 'Burger & Fast Food', blurb: 'Bold, loud and fast: big type, mustard accents and one-tap ordering.' },
      ar: { name: 'ستاكد', type: 'برغر ووجبات سريعة', blurb: 'جريء وسريع: خطوط كبيرة ولمسات خردلية وطلب بلمسة واحدة.' },
      theme: { bg: '#121212', surface: '#1E1E1E', ink: '#FFF6E5', muted: '#B5AB98', accent: '#F2B544', line: 'rgba(255,246,229,.1)', display: "'Bricolage Grotesque','Alexandria',sans-serif", displayAr: "'Alexandria',sans-serif", radius: '10px', heavy: true },
      cats: [ { en: 'Burgers', ar: 'البرغر', items: [['smash', 3.5], ['crispy', 3.9], ['blue', 4.2], ['avo', 3.4]] },
              { en: 'Sides', ar: 'الأطباق الجانبية', items: [['loaded', 3.2]] },
              { en: 'Grill', ar: 'المشويات', items: [['steak', 6.9]] },
              { en: 'Drinks', ar: 'المشروبات', items: [['karkade', 1.0], ['mint', 0.5]] } ] }
  ]
};
