// Oman reference data. Values are stored in English; label(v) shows them in the current language.
(function () {
  const AR = {
    // Governorates
    "Muscat": "مسقط", "Dhofar": "ظفار", "Musandam": "مسندم", "Al Buraimi": "البريمي", "Ad Dakhiliyah": "الداخلية",
    "North Al Batinah": "شمال الباطنة", "South Al Batinah": "جنوب الباطنة", "North Ash Sharqiyah": "شمال الشرقية",
    "South Ash Sharqiyah": "جنوب الشرقية", "Ad Dhahirah": "الظاهرة", "Al Wusta": "الوسطى",
    // Wilayats
    "Muttrah": "مطرح", "Bawshar": "بوشر", "As Seeb": "السيب", "Al Amarat": "العامرات", "Qurayyat": "قريات",
    "Salalah": "صلالة", "Taqah": "طاقة", "Mirbat": "مرباط", "Thumrait": "ثمريت", "Rakhyut": "رخيوت", "Dhalkut": "ضلكوت",
    "Al Mazyona": "المزيونة", "Muqshin": "مقشن", "Sadah": "سدح", "Shalim and the Hallaniyat Islands": "شليم وجزر الحلانيات",
    "Khasab": "خصب", "Dibba": "دبا", "Bukha": "بخا", "Madha": "مدحاء", "Mahdah": "محضة", "As Sunaynah": "السنينة",
    "Nizwa": "نزوى", "Bahla": "بهلاء", "Manah": "منح", "Al Hamra": "الحمراء", "Adam": "أدم", "Izki": "إزكي", "Samail": "سمائل",
    "Bidbid": "بدبد", "Al Jabal Al Akhdar": "الجبل الأخضر", "Sohar": "صحار", "Shinas": "شناص", "Liwa": "لوى", "Saham": "صحم",
    "Al Khaburah": "الخابورة", "As Suwayq": "السويق", "Barka": "بركاء", "Rustaq": "الرستاق", "Al Musanaah": "المصنعة",
    "Nakhal": "نخل", "Wadi Al Maawil": "وادي المعاول", "Al Awabi": "العوابي", "Ibra": "إبراء", "Al Mudhaibi": "المضيبي",
    "Bidiyah": "بدية", "Al Qabil": "القابل", "Wadi Bani Khalid": "وادي بني خالد", "Dima Wa At Taiyyin": "دماء والطائيين",
    "Sinaw": "سناو", "Sur": "صور", "Al Kamil Wal Wafi": "الكامل والوافي", "Jaalan Bani Bu Hassan": "جعلان بني بو حسن",
    "Jaalan Bani Bu Ali": "جعلان بني بو علي", "Masirah": "مصيرة", "Ibri": "عبري", "Yanqul": "ينقل", "Dhank": "ضنك",
    "Haima": "هيماء", "Duqm": "الدقم", "Mahout": "محوت", "Al Jazer": "الجازر",
    // Categories
    "Restaurant": "مطعم", "Café": "مقهى", "Bakery": "مخبز", "Dessert shop": "محل حلويات", "Juice bar": "محل عصائر",
    "Fast food": "وجبات سريعة", "Fine dining": "مطعم فاخر", "Food truck": "فود ترك", "Home kitchen": "مطبخ منزلي", "Catering": "تموين",
    // Cuisines
    "Omani": "عُماني", "Arabic": "عربي", "Lebanese & Syrian": "لبناني وسوري", "Turkish": "تركي", "Iranian": "إيراني",
    "Indian": "هندي", "Pakistani": "باكستاني", "Yemeni & Mandi": "يمني ومندي", "Grills & BBQ": "مشويات", "Seafood": "مأكولات بحرية",
    "Shawarma & Fast food": "شاورما ووجبات سريعة", "Burgers & American": "برجر وأمريكي", "Italian & Pizza": "إيطالي وبيتزا",
    "Asian": "آسيوي", "Chinese": "صيني", "Japanese & Sushi": "ياباني وسوشي", "Thai": "تايلندي", "Filipino": "فلبيني",
    "Healthy & Salads": "صحي وسلطات", "Café & Coffee": "قهوة", "Desserts & Sweets": "حلويات", "Juice & Smoothies": "عصائر",
    "Breakfast": "فطور", "Other": "أخرى",
    // Features
    "Family section": "قسم عائلات", "Outdoor seating": "جلسات خارجية", "Delivery": "توصيل", "Takeaway": "طلبات خارجية",
    "Parking": "مواقف سيارات", "Wheelchair access": "مناسب لذوي الإعاقة", "Wi-Fi": "واي فاي", "Kids area": "منطقة أطفال",
    "Private dining": "غرف خاصة", "Open late": "مفتوح لوقت متأخر",
    // Price ranges
    "Under OMR 3 per person": "أقل من 3 ر.ع. للشخص", "OMR 3 to 7 per person": "من 3 إلى 7 ر.ع. للشخص",
    "OMR 7 to 15 per person": "من 7 إلى 15 ر.ع. للشخص", "Over OMR 15 per person": "أكثر من 15 ر.ع. للشخص",
    // Days
    "Saturday": "السبت", "Sunday": "الأحد", "Monday": "الاثنين", "Tuesday": "الثلاثاء", "Wednesday": "الأربعاء", "Thursday": "الخميس", "Friday": "الجمعة"
  };
  window.DINE_DATA = {
    label: v => (window.DINE_LANG === "en" ? v : AR[v] || v),
    governorates: [
      { en: "Muscat", cities: ["Muscat", "Muttrah", "Bawshar", "As Seeb", "Al Amarat", "Qurayyat"] },
      { en: "Dhofar", cities: ["Salalah", "Taqah", "Mirbat", "Thumrait", "Rakhyut", "Dhalkut", "Al Mazyona", "Muqshin", "Sadah", "Shalim and the Hallaniyat Islands"] },
      { en: "Musandam", cities: ["Khasab", "Dibba", "Bukha", "Madha"] },
      { en: "Al Buraimi", cities: ["Al Buraimi", "Mahdah", "As Sunaynah"] },
      { en: "Ad Dakhiliyah", cities: ["Nizwa", "Bahla", "Manah", "Al Hamra", "Adam", "Izki", "Samail", "Bidbid", "Al Jabal Al Akhdar"] },
      { en: "North Al Batinah", cities: ["Sohar", "Shinas", "Liwa", "Saham", "Al Khaburah", "As Suwayq"] },
      { en: "South Al Batinah", cities: ["Barka", "Rustaq", "Al Musanaah", "Nakhal", "Wadi Al Maawil", "Al Awabi"] },
      { en: "North Ash Sharqiyah", cities: ["Ibra", "Al Mudhaibi", "Bidiyah", "Al Qabil", "Wadi Bani Khalid", "Dima Wa At Taiyyin", "Sinaw"] },
      { en: "South Ash Sharqiyah", cities: ["Sur", "Al Kamil Wal Wafi", "Jaalan Bani Bu Hassan", "Jaalan Bani Bu Ali", "Masirah"] },
      { en: "Ad Dhahirah", cities: ["Ibri", "Yanqul", "Dhank"] },
      { en: "Al Wusta", cities: ["Haima", "Duqm", "Mahout", "Al Jazer"] }
    ],
    categories: ["Restaurant", "Café", "Bakery", "Dessert shop", "Juice bar", "Fast food", "Fine dining", "Food truck", "Home kitchen", "Catering"],
    cuisines: ["Omani", "Arabic", "Lebanese & Syrian", "Turkish", "Iranian", "Indian", "Pakistani", "Yemeni & Mandi",
      "Grills & BBQ", "Seafood", "Shawarma & Fast food", "Burgers & American", "Italian & Pizza", "Asian",
      "Chinese", "Japanese & Sushi", "Thai", "Filipino", "Healthy & Salads", "Café & Coffee", "Bakery",
      "Desserts & Sweets", "Juice & Smoothies", "Breakfast", "Fine dining", "Food truck", "Home kitchen", "Other"],
    features: ["Family section", "Outdoor seating", "Delivery", "Takeaway", "Parking", "Wheelchair access", "Wi-Fi", "Kids area", "Private dining", "Open late"],
    priceRanges: ["Under OMR 3 per person", "OMR 3 to 7 per person", "OMR 7 to 15 per person", "Over OMR 15 per person"],
    days: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  };
})();
