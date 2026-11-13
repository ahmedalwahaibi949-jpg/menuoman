// TV menu board concepts: data model, the 30 designs (layout + theme) and their sample menus.
import type { Bi } from "../lib/i18n";
import raw from "./concepts.json";

export type Item = { id: string; name: Bi; price: number; photo?: string; best?: boolean };
export type Cat = { id: string; name: Bi; items: Item[] };
export type Offer = { id: string; title: Bi; text: Bi; price?: number; photo?: string; days?: number[]; from?: string; to?: string };
export type Menu = { name: Bi; tagline: Bi; hours: Bi; cats: Cat[]; offers: Offer[] };
export type Settings = { designId: string; screens: 1 | 2 | 3 | 4; slideSeconds: number; assign: string[][] };
export type LayoutId = "hero" | "grid" | "columns" | "diner" | "poster" | "minimal" | "orbit" | "frames" | "magazine" | "strip" | "rail" | "arches" | "bands" | "zen" | "tags";
export type Group = "burger" | "coffee" | "arabic" | "juice" | "fine" | "pizza";
export type Theme = { bg: string; fg: string; ac: string; ac2: string; pn: string; head: string; headAr: string; body: string; orn: "none" | "checker" | "dots" | "lines" | "gold" | "arabesque" | "wave" | "grain"; upper?: boolean; radius: number };
export type Design = { id: string; group: Group; name: Bi; layout: LayoutId; theme: Theme; menu: Menu };

const b = (en: string, ar: string): Bi => ({ en, ar });
export const GROUPS: { id: Group; label: Bi }[] = [
  { id: "burger", label: b("Burger & Fast Food", "برغر ووجبات سريعة") }, { id: "coffee", label: b("Coffee Shops", "المقاهي") },
  { id: "arabic", label: b("Arabic Restaurants", "المطاعم العربية") }, { id: "juice", label: b("Juice & Desserts", "العصائر والحلويات") },
  { id: "fine", label: b("Fine Dining", "المطاعم الفاخرة") }, { id: "pizza", label: b("Pizza & Casual Dining", "البيتزا والمطاعم العائلية") }
];

// Text-only items that fill out each sample menu.
const EXTRA: Record<Group, [string, string, number][]> = {
  burger: [["Chicken Tenders", "أصابع الدجاج", 1.8], ["Mozzarella Sticks", "أصابع الموزاريلا", 1.4], ["Soft Drink", "مشروب غازي", 0.3], ["Mineral Water", "مياه معدنية", 0.2], ["Kids Meal", "وجبة أطفال", 1.9], ["Extra Sauce", "صلصة إضافية", 0.1]],
  coffee: [["Spanish Latte", "سبانش لاتيه", 1.9], ["Mocha", "موكا", 1.8], ["V60 Pour Over", "قهوة V60", 2.0], ["Tea Pot", "إبريق شاي", 1.0], ["Cookie", "كوكيز", 0.7], ["Still Water", "مياه", 0.2]],
  arabic: [["Lentil Soup", "شوربة عدس", 0.9], ["Arabic Salad", "سلطة عربية", 0.8], ["Laban", "لبن", 0.3], ["Fresh Juice", "عصير طازج", 1.0], ["Rice Portion", "طبق أرز", 0.8], ["Tea", "شاي", 0.2]],
  juice: [["Lemon Mint", "ليمون بالنعناع", 0.9], ["Avocado Shake", "عصير أفوكادو", 1.5], ["Strawberry Juice", "عصير فراولة", 1.1], ["Mixed Cocktail", "كوكتيل مشكل", 1.3], ["Extra Topping", "إضافة", 0.3], ["Mineral Water", "مياه معدنية", 0.2]],
  fine: [["Soup of the Day", "شوربة اليوم", 3.0], ["Garden Salad", "سلطة خضراء", 2.8], ["Bread Basket", "سلة خبز", 1.2], ["Sparkling Water", "مياه غازية", 1.0], ["Cheese Selection", "تشكيلة أجبان", 5.5], ["Espresso", "إسبريسو", 1.2]],
  pizza: [["Garden Salad", "سلطة خضراء", 1.4], ["Chicken Wings", "أجنحة دجاج", 2.0], ["Soft Drink", "مشروب غازي", 0.3], ["Fresh Juice", "عصير طازج", 1.0], ["Extra Cheese", "جبن إضافي", 0.5], ["Dessert of the Day", "حلوى اليوم", 1.5]]
};
const CATS: [Bi, Bi, Bi] = [b("Signature", "المميّز"), b("Favourites", "المفضّل"), b("Also try", "جرّب أيضًا")];
const TAG: Record<Group, Bi> = {
  burger: b("Fresh. Hot. Made to order.", "طازج وساخن ويُحضّر عند الطلب."), coffee: b("Roasted with care, served with calm.", "قهوة محمّصة بعناية."),
  arabic: b("The taste of home.", "طعم البيت."), juice: b("Fresh every day.", "طازج كل يوم."), fine: b("An evening to remember.", "أمسية لا تُنسى."), pizza: b("Good food, shared.", "أكل طيب يجمعنا.")
};

const F = { tajawal: "'Tajawal',sans-serif", cairo: "'Cairo',sans-serif", amiri: "'Amiri',serif", kufi: "'Reem Kufi',sans-serif", lalezar: "'Lalezar',sans-serif", messiri: "'El Messiri',sans-serif" };
const th = (bg: string, fg: string, ac: string, ac2: string, pn: string, head: string, headAr: string, body: string, orn: Theme["orn"], radius = 18, upper = false): Theme => ({ bg, fg, ac, ac2, pn, head, headAr, body, orn, radius, upper });

// layout + theme per concept. Within each category the five layouts differ; each layout is shared by two concepts in different categories.
const LOOK: Record<string, [LayoutId, Theme]> = {
  "urban-burger":      ["hero",     th("#111111", "#F5F1E8", "#FFB800", "#E5371B", "#1C1C1C", "'Bebas Neue',sans-serif", F.lalezar, "'Oswald',sans-serif", "lines", 6, true)],
  "american-diner":    ["diner",    th("#FBF3E4", "#1E2B4A", "#D7263D", "#1E2B4A", "#FFFFFF", "'Lobster',cursive", F.lalezar, "'Poppins',sans-serif", "checker", 24)],
  "red-hot":           ["bands",    th("#B3150F", "#FFF4E0", "#FFD400", "#111111", "#8E0F0A", "'Anton',sans-serif", F.lalezar, "'Oswald',sans-serif", "none", 0, true)],
  "street-food":       ["tags",     th("#F2C230", "#17130E", "#17130E", "#E5371B", "#FFF7DC", "'Archivo Black',sans-serif", F.cairo, "'Poppins',sans-serif", "dots", 14, true)],
  "premium-burger":    ["poster",   th("#1B1714", "#EFE4D2", "#C8963E", "#7A5C2E", "#26201B", "'Playfair Display',serif", F.messiri, "'Poppins',sans-serif", "gold", 10)],

  "minimal-coffee":    ["minimal",  th("#F6F4F0", "#1A1A1A", "#1A1A1A", "#9A8F80", "#FFFFFF", "'Poppins',sans-serif", F.tajawal, "'Poppins',sans-serif", "none", 4)],
  "luxury-cafe":       ["magazine", th("#1F1A17", "#F1E6D6", "#C9A227", "#7B5E3B", "#2B2420", "'Cormorant Garamond',serif", F.amiri, "'Poppins',sans-serif", "gold", 2)],
  "matcha-bar":        ["orbit",    th("#EEF3E2", "#243119", "#6B8E3A", "#C4D7A0", "#FFFFFF", "'DM Serif Display',serif", F.messiri, "'Poppins',sans-serif", "wave", 30)],
  "brown-aesthetic":   ["strip",    th("#E9DDCF", "#3B2A20", "#8B5E3C", "#C9A27E", "#F5ECE1", "'Fraunces',serif", F.messiri, "'Poppins',sans-serif", "grain", 22)],
  "modern-cafe":       ["grid",     th("#FFFFFF", "#101828", "#2563EB", "#F97316", "#F3F5F9", "'Poppins',sans-serif", F.cairo, "'Poppins',sans-serif", "none", 26)],

  "omani-heritage":    ["arches",   th("#F4EBDD", "#3A2416", "#9C2F1F", "#C9963B", "#FBF6EC", "'Cinzel',serif", F.amiri, "'Tajawal',sans-serif", "arabesque", 8)],
  "arabian-luxury":    ["frames",   th("#0F2A2A", "#F2E6CC", "#D4AF37", "#1F4A49", "#143838", "'Cinzel',serif", F.amiri, "'Tajawal',sans-serif", "gold", 4)],
  "modern-khaleeji":   ["rail",     th("#F7F5F2", "#1C1C1C", "#0E7C7B", "#E2B04A", "#FFFFFF", "'Poppins',sans-serif", F.kufi, "'Tajawal',sans-serif", "none", 20)],
  "levantine":         ["columns",  th("#FAF7EF", "#2B3A21", "#5E7F3A", "#D9603B", "#FFFFFF", "'DM Serif Display',serif", F.messiri, "'Tajawal',sans-serif", "lines", 14)],
  "traditional-majlis":["orbit",    th("#5B1F1A", "#F6E7CF", "#E0B25A", "#8A2E25", "#6D2620", "'Cinzel',serif", F.amiri, "'Tajawal',sans-serif", "arabesque", 12)],

  "tropical-juice":    ["bands",    th("#FF8A00", "#FFFFFF", "#FFE600", "#0B7A3B", "#E57600", "'Righteous',sans-serif", F.lalezar, "'Poppins',sans-serif", "none", 0)],
  "smoothie-bar":      ["grid",     th("#FDF2F6", "#3A1230", "#E6398B", "#7BC96F", "#FFFFFF", "'Righteous',sans-serif", F.cairo, "'Poppins',sans-serif", "dots", 34)],
  "chocolate-luxury":  ["poster",   th("#24130C", "#F3E3CF", "#D9A441", "#5A2E18", "#32190F", "'Playfair Display',serif", F.amiri, "'Poppins',sans-serif", "gold", 6)],
  "ice-cream-studio":  ["diner",    th("#E9F7FB", "#22304A", "#FF6FA5", "#3DB8D9", "#FFFFFF", "'Righteous',sans-serif", F.lalezar, "'Poppins',sans-serif", "dots", 36)],
  "french-bakery":     ["frames",   th("#F8F1E4", "#3B2B1E", "#1F3A5F", "#C08B4C", "#FFFDF8", "'Playfair Display',serif", F.amiri, "'Poppins',sans-serif", "lines", 2)],

  "black-gold":        ["magazine", th("#0A0A0A", "#EFE6D2", "#D4AF37", "#3A3220", "#141414", "'Cinzel',serif", F.amiri, "'Poppins',sans-serif", "gold", 0, true)],
  "ivory-luxury":      ["minimal",  th("#FBF8F1", "#2A2622", "#A8875A", "#D9CDB8", "#FFFFFF", "'Cormorant Garamond',serif", F.amiri, "'Poppins',sans-serif", "none", 0)],
  "italian-classic":   ["columns",  th("#F7F2E7", "#22331F", "#B5271F", "#2E6B3F", "#FFFFFF", "'Playfair Display',serif", F.messiri, "'Poppins',sans-serif", "lines", 6)],
  "seafood-luxury":    ["hero",     th("#06202E", "#E9F3F5", "#5FD0D6", "#C9A227", "#0B2D3F", "'Cormorant Garamond',serif", F.amiri, "'Poppins',sans-serif", "wave", 4)],
  "japanese-minimal":  ["zen",      th("#F5F2EC", "#161616", "#C0392B", "#161616", "#FFFFFF", "'Cormorant Garamond',serif", F.kufi, "'Poppins',sans-serif", "none", 0)],

  "italian-pizza":     ["strip",    th("#FFFDF7", "#1F1A16", "#C8102E", "#1E7B3A", "#F6EFE2", "'Lobster',cursive", F.lalezar, "'Poppins',sans-serif", "checker", 16)],
  "modern-pasta":      ["rail",     th("#1D1D1B", "#F4EFE6", "#F2B84B", "#D9603B", "#292927", "'Fraunces',serif", F.messiri, "'Poppins',sans-serif", "none", 24)],
  "family-combos":     ["tags",     th("#0B3D91", "#FFFFFF", "#FFD23F", "#E63946", "#0E4BAF", "'Archivo Black',sans-serif", F.cairo, "'Poppins',sans-serif", "none", 20, true)],
  "mediterranean":     ["arches",   th("#FFFFFF", "#12355B", "#1B6CA8", "#E8A33D", "#F1F6FA", "'DM Serif Display',serif", F.messiri, "'Poppins',sans-serif", "wave", 14)],
  "fast-casual":       ["zen",      th("#101820", "#FFFFFF", "#B6F23A", "#FF5A3C", "#1A2530", "'Anton',sans-serif", F.cairo, "'Poppins',sans-serif", "none", 12, true)]
};

type RawDish = { en: string; ar: string; price: number; photo: string | null };
type RawConcept = { id: string; group: Group; en: string; ar: string; dishes: RawDish[] };

function buildMenu(c: RawConcept): Menu {
  const ex = EXTRA[c.group];
  const dish = (d: RawDish, i: number): Item => ({ id: `${c.id}-d${i}`, name: b(d.en, d.ar), price: d.price, photo: d.photo || undefined, best: i === 0 });
  const extra = (i: number): Item => ({ id: `${c.id}-x${i}`, name: b(ex[i][0], ex[i][1]), price: ex[i][2] });
  const d = c.dishes.map(dish);
  const combo = +(c.dishes[0].price + c.dishes[2].price - 0.3).toFixed(1);
  return {
    name: b(c.en, c.ar), tagline: TAG[c.group], hours: b("Open daily · 10 am to 12 midnight", "مفتوح يوميًا · 10 صباحًا إلى 12 منتصف الليل"),
    cats: [
      { id: "c1", name: CATS[0], items: [d[0], d[1], extra(0), extra(1)] },
      { id: "c2", name: CATS[1], items: [d[2], d[3], extra(2), extra(3)] },
      { id: "c3", name: CATS[2], items: [d[4], extra(4), extra(5)] }
    ],
    offers: [
      { id: "o1", title: b("Meal Deal", "عرض الوجبة"), text: b(`${c.dishes[0].en} + ${c.dishes[2].en}`, `${c.dishes[0].ar} + ${c.dishes[2].ar}`), price: combo, photo: c.dishes[0].photo || undefined },
      { id: "o2", title: b("Today’s Special", "عرض اليوم"), text: b(c.dishes[1].en, c.dishes[1].ar), price: +(c.dishes[1].price * 0.85).toFixed(1), photo: c.dishes[1].photo || undefined }
    ]
  };
}

export const DESIGNS: Design[] = (raw as RawConcept[]).map(c => ({ id: c.id, group: c.group, name: b(c.en, c.ar), layout: LOOK[c.id][0], theme: LOOK[c.id][1], menu: buildMenu(c) }));
export const designById = (id: string) => DESIGNS.find(d => d.id === id);

/** Which categories each screen shows, for a given number of screens. */
export function defaultAssign(menu: Menu, screens: number): string[][] {
  const ids = menu.cats.map(c => c.id);
  if (screens <= 1) return [ids];
  if (screens === 2) return [ids.slice(0, Math.ceil(ids.length / 2)), ids.slice(Math.ceil(ids.length / 2))];
  if (screens === 3) return [ids.slice(0, 1), ids.slice(1, 2), ids.slice(2)];
  return [ids.slice(0, 1), ids.slice(1, 2), ids.slice(2), []]; // 4th screen: offers and announcements
}
export const defaultSettings = (designId: string, menu: Menu): Settings => ({ designId, screens: 1, slideSeconds: 10, assign: defaultAssign(menu, 1) });

/** Offers that apply right now, given optional day and time windows. */
export function activeOffers(menu: Menu, now = new Date()): Offer[] {
  const hm = now.toTimeString().slice(0, 5), day = now.getDay();
  return menu.offers.filter(o => (!o.days || !o.days.length || o.days.includes(day)) && (!o.from || hm >= o.from) && (!o.to || hm <= o.to));
}

export const BOARD_FONTS = "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Anton&family=Archivo+Black&family=Bebas+Neue&family=Cairo:wght@400;700;900&family=Cinzel:wght@500;700&family=Cormorant+Garamond:wght@500;700&family=DM+Serif+Display&family=El+Messiri:wght@500;700&family=Fraunces:wght@500;800&family=Lalezar&family=Lobster&family=Oswald:wght@400;600&family=Playfair+Display:wght@500;800&family=Poppins:wght@400;500;700&family=Reem+Kufi:wght@500;700&family=Righteous&display=swap";
