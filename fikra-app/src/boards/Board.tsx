// Renders one TV screen (1920 × 1080 logical pixels, scaled to its container) for a design, menu and set of categories.
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Bi, Lang } from "../lib/i18n";
import { activeOffers, type Cat, type Design, type Item, type Menu, type Offer, type Theme } from "./boards";

export const photoUrl = (p?: string) => (!p ? "" : /^(data:|https?:|blob:)/.test(p) ? p : `./boards/${p}`);

type Ctx = { th: Theme; menu: Menu; cats: Cat[]; items: Item[]; photos: Item[]; texts: Item[]; L: (b: Bi) => string; ar: boolean; head: CSSProperties; cur: string; screen: number; of: number };

const Price = ({ c, v, size = 44, color }: { c: Ctx; v: number; size?: number; color?: string }) => (
  <span style={{ fontFamily: c.th.head, fontSize: size, color: color || c.th.ac, whiteSpace: "nowrap", lineHeight: 1, direction: "ltr", unicodeBidi: "isolate" }}>{v.toFixed(3)}<small style={{ fontSize: size * 0.42, marginInlineStart: 6, fontFamily: c.th.body, opacity: .8 }}>{c.cur}</small></span>
);
const Img = ({ it, style, zoom }: { it?: Item | Offer; style?: CSSProperties; zoom?: boolean }) => (
  <div style={{ overflow: "hidden", background: "rgba(128,128,128,.18)", ...style }}>{it?.photo && <img src={photoUrl(it.photo)} alt="" className={zoom ? "tv-zoom" : ""} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}</div>
);
const Row = ({ c, it, size = 40 }: { c: Ctx; it: Item; size?: number }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 16, fontSize: size, lineHeight: 1.25 }}>
    <span style={{ fontWeight: 600 }}>{c.L(it.name)}{it.best && <b style={{ fontSize: size * 0.42, background: c.th.ac, color: c.th.bg, padding: "2px 12px", borderRadius: 99, marginInlineStart: 14, verticalAlign: "middle", fontFamily: c.th.body }}>{c.ar ? "الأكثر طلبًا" : "BEST SELLER"}</b>}</span>
    <i style={{ flex: 1, borderBottom: `3px dotted ${c.th.fg}`, opacity: .28, transform: "translateY(-8px)" }} />
    <Price c={c} v={it.price} size={size} />
  </div>
);
const Brand = ({ c, size = 84, sub = true, color }: { c: Ctx; size?: number; sub?: boolean; color?: string }) => (
  <div><div style={{ ...c.head, fontSize: size, lineHeight: 1, color: color || c.th.fg }}>{c.L(c.menu.name)}</div>{sub && <div style={{ fontSize: size * 0.3, opacity: .75, marginTop: 10 }}>{c.L(c.menu.tagline)}</div>}</div>
);
const CatTitle = ({ c, cat, size = 46, color }: { c: Ctx; cat: Cat; size?: number; color?: string }) => <div style={{ ...c.head, fontSize: size, color: color || c.th.ac, lineHeight: 1.1 }}>{c.L(cat.name)}</div>;
const Hours = ({ c, size = 26 }: { c: Ctx; size?: number }) => <div style={{ fontSize: size, opacity: .7 }}>{c.L(c.menu.hours)}</div>;

const ORN: Record<Theme["orn"], (t: Theme) => CSSProperties> = {
  none: () => ({}),
  checker: t => ({ backgroundImage: `repeating-conic-gradient(${t.ac} 0 25%, transparent 0 50%)`, backgroundSize: "56px 56px" }),
  dots: t => ({ backgroundImage: `radial-gradient(${t.ac2} 18%, transparent 19%)`, backgroundSize: "44px 44px", opacity: .25 }),
  lines: t => ({ backgroundImage: `repeating-linear-gradient(135deg, ${t.ac} 0 3px, transparent 3px 26px)`, opacity: .16 }),
  gold: t => ({ backgroundImage: `linear-gradient(90deg, transparent, ${t.ac}, transparent)` }),
  arabesque: t => ({ backgroundImage: `radial-gradient(circle at 50% 100%, transparent 26px, ${t.ac2} 27px 31px, transparent 32px), radial-gradient(circle at 50% 0, transparent 26px, ${t.ac2} 27px 31px, transparent 32px)`, backgroundSize: "64px 64px", opacity: .5 }),
  wave: t => ({ backgroundImage: `radial-gradient(circle at 50% 0, transparent 28px, ${t.ac2} 29px 33px, transparent 34px)`, backgroundSize: "68px 34px", opacity: .45 }),
  grain: t => ({ backgroundImage: `radial-gradient(${t.ac2} 1.5px, transparent 2px)`, backgroundSize: "14px 14px", opacity: .35 })
};
const Orn = ({ c, style }: { c: Ctx; style: CSSProperties }) => <div style={{ position: "absolute", pointerEvents: "none", ...ORN[c.th.orn](c.th), ...style }} />;

/* ------------------------------------------------------------------ the 15 layouts */
const LAYOUT: Record<Design["layout"], (c: Ctx) => ReactNode> = {
  // 1. Full-height hero photo on one side, lists on the other.
  hero: c => (<div style={{ display: "grid", gridTemplateColumns: "820px 1fr", height: "100%" }}>
    <div style={{ position: "relative" }}><Img it={c.photos[0]} zoom style={{ position: "absolute", inset: 0 }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${c.th.bg} 2%, transparent 55%)` }} />
      {c.photos[0] && <div style={{ position: "absolute", insetInlineStart: 56, bottom: 56 }}><div style={{ ...c.head, fontSize: 72 }}>{c.L(c.photos[0].name)}</div><Price c={c} v={c.photos[0].price} size={88} /></div>}</div>
    <div style={{ padding: "48px 72px", display: "flex", flexDirection: "column", gap: 24, position: "relative", overflow: "hidden" }}><Orn c={c} style={{ insetInlineEnd: 0, top: 0, width: 220, height: "100%" }} />
      <Brand c={c} size={84} />{c.cats.map(k => <div key={k.id} style={{ display: "grid", gap: 8 }}><CatTitle c={c} cat={k} />{k.items.map(i => <Row key={i.id} c={c} it={i} size={32} />)}</div>)}<div style={{ marginTop: "auto" }}><Hours c={c} /></div></div></div>),
  // 2. Card grid.
  grid: c => (<div style={{ padding: 56, height: "100%", display: "flex", flexDirection: "column", gap: 36, position: "relative" }}><Orn c={c} style={{ inset: 0 }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative" }}><Brand c={c} size={84} /><Hours c={c} /></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 30, flex: 1, position: "relative" }}>{[...c.photos, ...c.texts].slice(0, 6).map((i, n) => (
      <div key={i.id} style={{ background: c.th.pn, borderRadius: c.th.radius, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 16px 40px -24px rgba(0,0,0,.4)" }}>
        {i.photo ? <Img it={i} zoom={n === 0} style={{ flex: 1 }} /> : <div style={{ flex: 1, background: n % 2 ? c.th.ac : c.th.ac2, opacity: .9 }} />}
        <div style={{ padding: "20px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14 }}><span style={{ fontSize: 34, fontWeight: 700, lineHeight: 1.15 }}>{c.L(i.name)}</span><Price c={c} v={i.price} size={40} /></div></div>))}</div></div>),
  // 3. Three typographic columns, one per category.
  columns: c => (<div style={{ padding: "60px 70px", height: "100%", display: "flex", flexDirection: "column", gap: 40 }}>
    <div style={{ textAlign: "center", position: "relative" }}><Brand c={c} size={92} /><Orn c={c} style={{ insetInline: 0, bottom: -24, height: 10 }} /></div>
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(1, c.cats.length)}, 1fr)`, gap: 54, flex: 1 }}>{c.cats.map(k => { const p = k.items.find(i => i.photo); return (
      <div key={k.id} style={{ display: "flex", flexDirection: "column", gap: 20, borderInlineStart: `3px solid ${c.th.ac}`, paddingInlineStart: 34 }}>
        <Img it={p} style={{ height: 280, borderRadius: c.th.radius }} /><CatTitle c={c} cat={k} size={50} />{k.items.map(i => <Row key={i.id} c={c} it={i} size={36} />)}</div>); })}</div><Hours c={c} /></div>),
  // 4. Diner: patterned bands, round photo badges with price bursts.
  diner: c => (<div style={{ height: "100%", display: "flex", flexDirection: "column" }}><Orn c={c} style={{ position: "relative", height: 56, flex: "none" }} />
    <div style={{ padding: "36px 70px", flex: 1, display: "flex", flexDirection: "column", gap: 30 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><Brand c={c} size={104} color={c.th.ac} /><Hours c={c} size={28} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 36 }}>{c.photos.slice(0, 4).map(i => (
        <div key={i.id} style={{ textAlign: "center", position: "relative" }}><Img it={i} style={{ width: 330, height: 330, borderRadius: "50%", margin: "0 auto", border: `10px solid ${c.th.pn}`, boxShadow: `0 0 0 6px ${c.th.ac2}` }} />
          <div className="tv-pulse" style={{ position: "absolute", top: 0, insetInlineEnd: 20, background: c.th.ac, color: "#fff", borderRadius: "50%", width: 150, height: 150, display: "grid", placeItems: "center", transform: "rotate(-10deg)" }}><Price c={c} v={i.price} size={38} color="#fff" /></div>
          <div style={{ fontSize: 38, fontWeight: 700, marginTop: 14 }}>{c.L(i.name)}</div></div>))}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 80px", marginTop: "auto" }}>{[...c.photos.slice(4), ...c.texts].slice(0, 6).map(i => <Row key={i.id} c={c} it={i} size={34} />)}</div></div>
    <Orn c={c} style={{ position: "relative", height: 56, flex: "none" }} /></div>),
  // 5. Poster: one large round hero in the centre, lists either side.
  poster: c => (<div style={{ height: "100%", display: "grid", gridTemplateColumns: "1fr 640px 1fr", alignItems: "center", gap: 50, padding: "56px 70px", position: "relative" }}>
    <Orn c={c} style={{ insetInline: 70, top: 44, height: 3 }} /><Orn c={c} style={{ insetInline: 70, bottom: 44, height: 3 }} />
    <div style={{ display: "grid", gap: 16 }}><Brand c={c} size={78} /><div style={{ height: 22 }} />{c.cats[0] && <><CatTitle c={c} cat={c.cats[0]} />{c.cats[0].items.map(i => <Row key={i.id} c={c} it={i} size={34} />)}</>}</div>
    <div style={{ position: "relative", textAlign: "center" }}><Img it={c.photos[0]} zoom style={{ width: 600, height: 600, borderRadius: "50%", border: `6px solid ${c.th.ac}`, margin: "0 auto", boxShadow: `0 0 0 22px ${c.th.pn}, 0 40px 90px -30px #000` }} />
      {c.photos[0] && <div style={{ marginTop: 26 }}><div style={{ ...c.head, fontSize: 56 }}>{c.L(c.photos[0].name)}</div><Price c={c} v={c.photos[0].price} size={64} /></div>}</div>
    <div style={{ display: "grid", gap: 16 }}>{c.cats.slice(1).map(k => <div key={k.id} style={{ display: "grid", gap: 12, marginBottom: 18 }}><CatTitle c={c} cat={k} />{k.items.map(i => <Row key={i.id} c={c} it={i} size={34} />)}</div>)}<Hours c={c} /></div></div>),
  // 6. Minimal: generous white space, large type, one tall photo.
  minimal: c => (<div style={{ height: "100%", display: "grid", gridTemplateColumns: "1fr 560px", gap: 90, padding: "90px 100px" }}>
    <div style={{ display: "flex", flexDirection: "column" }}><Brand c={c} size={72} /><div style={{ height: 3, width: 120, background: c.th.ac, margin: "40px 0 46px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 90px", alignContent: "start", flex: 1 }}>{c.items.slice(0, 10).map(i => (
        <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 20, padding: "22px 0", borderBottom: `1.5px solid ${c.th.ac2}` }}><span style={{ fontSize: 40 }}>{c.L(i.name)}</span><Price c={c} v={i.price} size={38} color={c.th.fg} /></div>))}</div><Hours c={c} /></div>
    <Img it={c.photos[0]} zoom style={{ borderRadius: c.th.radius, height: "100%" }} /></div>),
  // 7. Orbit: a row of circular photos under a curved header.
  orbit: c => (<div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
    <div style={{ background: c.th.ac, color: c.th.bg, padding: "50px 70px 80px", borderRadius: "0 0 50% 50% / 0 0 90px 90px", textAlign: "center", position: "relative" }}><Brand c={c} size={96} color={c.th.bg} /><Orn c={c} style={{ insetInline: 0, bottom: 0, height: 34 }} /></div>
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(5, Math.max(1, c.photos.length))}, 1fr)`, gap: 30, padding: "0 60px", marginTop: -50 }}>{c.photos.slice(0, 5).map((i, n) => (
      <div key={i.id} style={{ textAlign: "center" }}><Img it={i} zoom={n === 2} style={{ width: 300, height: 300, borderRadius: "50%", margin: "0 auto", border: `10px solid ${c.th.bg}`, boxShadow: "0 24px 50px -24px rgba(0,0,0,.5)" }} />
        <div style={{ fontSize: 36, fontWeight: 700, marginTop: 18, lineHeight: 1.15 }}>{c.L(i.name)}</div><Price c={c} v={i.price} size={42} /></div>))}</div>
    <div style={{ marginTop: "auto", padding: "0 70px 46px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px 60px" }}>{c.texts.slice(0, 6).map(i => <Row key={i.id} c={c} it={i} size={30} />)}</div></div>),
  // 8. Frames: bordered panels with tabbed titles.
  frames: c => (<div style={{ height: "100%", padding: "56px 64px", display: "flex", flexDirection: "column", gap: 44 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}><Brand c={c} size={88} /><Hours c={c} /><Orn c={c} style={{ insetInline: 0, bottom: -22, height: 3 }} /></div>
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(1, c.cats.length)}, 1fr)`, gap: 40, flex: 1 }}>{c.cats.map(k => { const p = k.items.find(i => i.photo); return (
      <div key={k.id} style={{ border: `3px solid ${c.th.ac}`, outline: `1.5px solid ${c.th.ac}`, outlineOffset: 8, borderRadius: c.th.radius, padding: "50px 34px 30px", position: "relative", display: "flex", flexDirection: "column", gap: 16, background: c.th.pn }}>
        <div style={{ position: "absolute", top: -34, insetInlineStart: 30, background: c.th.bg, padding: "0 20px" }}><CatTitle c={c} cat={k} size={50} /></div>
        <Img it={p} style={{ height: 250, borderRadius: c.th.radius }} />{k.items.map(i => <Row key={i.id} c={c} it={i} size={34} />)}</div>); })}</div></div>),
  // 9. Magazine: asymmetric photos with an oversized word.
  magazine: c => (<div style={{ height: "100%", position: "relative" }}>
    <Img it={c.photos[0]} zoom style={{ position: "absolute", insetInlineEnd: 0, top: 0, width: 960, height: 640 }} /><Img it={c.photos[1]} style={{ position: "absolute", insetInlineStart: 80, bottom: 70, width: 430, height: 430, border: `10px solid ${c.th.bg}` }} />
    <div style={{ position: "absolute", insetInlineStart: 80, top: 70, width: 800 }}><Brand c={c} size={110} /><div style={{ width: 160, height: 4, background: c.th.ac, marginTop: 30 }} /></div>
    <div style={{ position: "absolute", insetInlineStart: 580, bottom: 70, width: 620, display: "grid", gap: 10 }}>{c.cats[0] && <CatTitle c={c} cat={c.cats[0]} />}{c.items.slice(0, 5).map(i => <Row key={i.id} c={c} it={i} size={32} />)}</div>
    <div style={{ position: "absolute", insetInlineEnd: 70, bottom: 70, width: 560, display: "grid", gap: 10, background: c.th.pn, padding: 34 }}>{c.items.slice(5, 9).map(i => <Row key={i.id} c={c} it={i} size={30} />)}<Hours c={c} size={22} /></div></div>),
  // 10. Filmstrip of photos across the top, lists below.
  strip: c => (<div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(5, Math.max(1, c.photos.length))}, 1fr)`, gap: 12, height: 400, padding: 12 }}>{c.photos.slice(0, 5).map((i, n) => <div key={i.id} style={{ position: "relative" }}><Img it={i} zoom={n === 0} style={{ height: "100%", borderRadius: c.th.radius }} />
      <div style={{ position: "absolute", insetInline: 14, bottom: 14, background: c.th.bg, borderRadius: c.th.radius, padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}><span style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>{c.L(i.name)}</span><Price c={c} v={i.price} size={28} /></div></div>)}</div>
    <div style={{ flex: 1, padding: "40px 70px 46px", display: "grid", gridTemplateColumns: "520px 1fr", gap: 70, position: "relative" }}><Orn c={c} style={{ insetInline: 0, bottom: 0, height: 40 }} />
      <div><Brand c={c} size={92} color={c.th.ac} /><div style={{ marginTop: 26 }}><Hours c={c} /></div></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 70px", alignContent: "start" }}>{c.items.slice(0, 10).map(i => <Row key={i.id} c={c} it={i} size={32} />)}</div></div></div>),
  // 11. Rail: a photo rail on one side, thumbnail rows on the other.
  rail: c => (<div style={{ height: "100%", display: "grid", gridTemplateColumns: "560px 1fr", gap: 0 }}>
    <div style={{ background: c.th.ac, padding: 40, display: "flex", flexDirection: "column", gap: 24 }}><Brand c={c} size={72} color={c.th.bg} sub={false} /><Img it={c.photos[0]} zoom style={{ flex: 1, borderRadius: c.th.radius }} /><Img it={c.photos[1]} style={{ flex: 1, borderRadius: c.th.radius }} /></div>
    <div style={{ padding: "56px 64px", display: "flex", flexDirection: "column", gap: 20 }}><div style={{ fontSize: 30, opacity: .7 }}>{c.L(c.menu.tagline)}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, flex: 1, alignContent: "start" }}>{c.items.slice(0, 10).map(i => (
        <div key={i.id} style={{ display: "grid", gridTemplateColumns: "96px 1fr auto", gap: 20, alignItems: "center", background: c.th.pn, borderRadius: c.th.radius, padding: 14 }}>
          {i.photo ? <Img it={i} style={{ width: 96, height: 96, borderRadius: c.th.radius * .7 }} /> : <div style={{ width: 96, height: 96, borderRadius: c.th.radius * .7, background: c.th.ac2, opacity: .5 }} />}
          <span style={{ fontSize: 32, fontWeight: 600, lineHeight: 1.15 }}>{c.L(i.name)}</span><Price c={c} v={i.price} size={34} /></div>))}</div><Hours c={c} /></div></div>),
  // 12. Arches: photos in arched frames.
  arches: c => (<div style={{ height: "100%", padding: "50px 64px", display: "flex", flexDirection: "column", gap: 30, position: "relative" }}><Orn c={c} style={{ insetInline: 0, top: 0, height: 34 }} /><Orn c={c} style={{ insetInline: 0, bottom: 0, height: 34 }} />
    <div style={{ textAlign: "center", marginTop: 20 }}><Brand c={c} size={92} color={c.th.ac} /></div>
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(4, Math.max(1, c.photos.length))}, 1fr)`, gap: 40 }}>{c.photos.slice(0, 4).map((i, n) => (
      <div key={i.id} style={{ textAlign: "center" }}><Img it={i} zoom={n === 1} style={{ height: 400, borderRadius: "999px 999px 16px 16px", border: `5px solid ${c.th.ac2}`, outline: `2px solid ${c.th.ac}`, outlineOffset: 8 }} />
        <div style={{ ...c.head, fontSize: 40, marginTop: 24 }}>{c.L(i.name)}</div><Price c={c} v={i.price} size={42} /></div>))}</div>
    <div style={{ marginTop: "auto", marginBottom: 26, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px 60px" }}>{[...c.photos.slice(4), ...c.texts].slice(0, 6).map(i => <Row key={i.id} c={c} it={i} size={30} />)}</div></div>),
  // 13. Bands: full-height photo bands with overlaid names.
  bands: c => (<div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
    <div style={{ padding: "34px 60px", display: "flex", justifyContent: "space-between", alignItems: "center" }}><Brand c={c} size={96} sub={false} /><div style={{ ...c.head, fontSize: 40, color: c.th.ac }}>{c.L(c.menu.tagline)}</div></div>
    <div style={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(${Math.min(5, Math.max(1, c.photos.length))}, 1fr)`, gap: 8 }}>{c.photos.slice(0, 5).map((i, n) => (
      <div key={i.id} style={{ position: "relative" }}><Img it={i} zoom={n % 2 === 0} style={{ position: "absolute", inset: 0 }} /><div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.82), transparent 55%)" }} />
        <div style={{ position: "absolute", insetInline: 26, bottom: 30, color: "#fff" }}><div style={{ ...c.head, fontSize: 46, lineHeight: 1.05 }}>{c.L(i.name)}</div><div style={{ marginTop: 10 }}><Price c={c} v={i.price} size={56} color={c.th.ac} /></div></div></div>))}</div>
    <div style={{ background: c.th.ac2, color: "#fff", padding: "18px 60px", display: "flex", gap: 60, fontSize: 30, overflow: "hidden", whiteSpace: "nowrap" }}>{c.texts.slice(0, 5).map(i => <span key={i.id}>{c.L(i.name)} <b style={{ color: c.th.ac, direction: "ltr", unicodeBidi: "isolate" }}>{i.price.toFixed(3)}</b></span>)}</div></div>),
  // 14. Zen: a vertical band, one square photo, a hairline grid of names.
  zen: c => (<div style={{ height: "100%", display: "grid", gridTemplateColumns: "190px 700px 1fr", gap: 0 }}>
    <div style={{ background: c.th.ac, color: c.th.bg === "#F5F2EC" ? "#fff" : c.th.bg, display: "grid", placeItems: "center" }}><div style={{ ...c.head, fontSize: 84, writingMode: "vertical-rl", letterSpacing: c.ar ? 0 : 8 }}>{c.L(c.menu.name)}</div></div>
    <div style={{ padding: 70, display: "flex", flexDirection: "column", gap: 30 }}><Img it={c.photos[0]} zoom style={{ flex: 1, borderRadius: c.th.radius }} />{c.photos[0] && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span style={{ ...c.head, fontSize: 52 }}>{c.L(c.photos[0].name)}</span><Price c={c} v={c.photos[0].price} size={52} /></div>}</div>
    <div style={{ padding: "70px 80px 60px 10px", display: "flex", flexDirection: "column" }}><div style={{ fontSize: 30, opacity: .65, marginBottom: 20 }}>{c.L(c.menu.tagline)}</div>
      {c.items.filter(i => i !== c.photos[0]).slice(0, 8).map(i => <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "22px 0", borderTop: `1.5px solid ${c.th.fg}33`, fontSize: 40 }}><span>{c.L(i.name)}</span><Price c={c} v={i.price} size={38} /></div>)}<div style={{ marginTop: "auto" }}><Hours c={c} /></div></div></div>),
  // 15. Tags: numbered rows with round photos, and an offer panel.
  tags: c => (<div style={{ height: "100%", display: "grid", gridTemplateColumns: "1fr 600px", position: "relative" }}><Orn c={c} style={{ inset: 0 }} />
    <div style={{ padding: "50px 60px", display: "flex", flexDirection: "column", gap: 18, position: "relative" }}><Brand c={c} size={100} />
      {c.photos.slice(0, 5).map((i, n) => <div key={i.id} style={{ display: "grid", gridTemplateColumns: "110px 130px 1fr auto", gap: 26, alignItems: "center", background: c.th.pn, borderRadius: c.th.radius, padding: "12px 30px 12px 20px", color: c.th.pn === "#FFF7DC" ? c.th.fg : undefined }}>
        <span style={{ ...c.head, fontSize: 84, color: c.th.ac2, lineHeight: 1 }}>{n + 1}</span><Img it={i} style={{ width: 130, height: 130, borderRadius: "50%" }} /><span style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.1 }}>{c.L(i.name)}</span><Price c={c} v={i.price} size={52} color={c.th.pn === "#FFF7DC" ? c.th.ac2 : c.th.ac} /></div>)}</div>
    <div style={{ background: c.th.ac2, color: "#fff", padding: 50, display: "flex", flexDirection: "column", gap: 16, position: "relative" }}><div style={{ ...c.head, fontSize: 60 }}>{c.ar ? "أيضًا" : "ALSO"}</div>
      {c.texts.slice(0, 6).map(i => <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 34, borderBottom: "2px solid rgba(255,255,255,.25)", padding: "12px 0" }}><span>{c.L(i.name)}</span><b style={{ direction: "ltr", unicodeBidi: "isolate" }}>{i.price.toFixed(3)}</b></div>)}<div style={{ marginTop: "auto", fontSize: 26, opacity: .85 }}>{c.L(c.menu.hours)}</div></div></div>)
};

/* ------------------------------------------------------------------ promo and best-seller slides */
function PromoSlide({ c, o, label }: { c: Ctx; o: Offer | Item; label: string }) {
  const price = o.price, title = "title" in o ? c.L(o.title) : c.L(o.name), text = "text" in o ? c.L(o.text) : c.L(c.menu.tagline);
  return (<div style={{ height: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", background: c.th.pn }}>
    <div style={{ padding: "90px 90px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 26, position: "relative" }}><Orn c={c} style={{ insetInline: 0, top: 0, height: 40 }} />
      <span className="tv-slide-in" style={{ alignSelf: "flex-start", background: c.th.ac, color: c.th.bg, fontSize: 34, fontWeight: 700, padding: "10px 30px", borderRadius: 99 }}>{label}</span>
      <div className="tv-slide-in" style={{ ...c.head, fontSize: 130, lineHeight: 1, animationDelay: ".12s" }}>{title}</div>
      <div className="tv-slide-in" style={{ fontSize: 48, opacity: .85, animationDelay: ".24s" }}>{text}</div>
      {price != null && <div className="tv-pulse" style={{ alignSelf: "flex-start", marginTop: 10 }}><Price c={c} v={price} size={150} /></div>}
      <div style={{ ...c.head, fontSize: 40, opacity: .6, marginTop: "auto" }}>{c.L(c.menu.name)}</div></div>
    <Img it={o} zoom style={{ height: "100%" }} /></div>);
}

/* ------------------------------------------------------------------ screen */
export type ScreenProps = { design: Design; menu: Menu; catIds: string[]; lang: Lang; playing: boolean; slideSeconds: number; screen?: number; of?: number; showOffers?: boolean; tick?: number };

export function Screen({ design, menu, catIds, lang, playing, slideSeconds, screen = 1, of = 1, showOffers = true }: ScreenProps) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);
  const [idx, setIdx] = useState(0);
  useEffect(() => { const el = box.current; if (!el) return; const f = () => setScale(el.clientWidth / 1920); f(); const ro = new ResizeObserver(f); ro.observe(el); return () => ro.disconnect(); }, []);

  const ar = lang === "ar", th = design.theme;
  const c: Ctx = useMemo(() => {
    const cats = menu.cats.filter(k => catIds.includes(k.id)), items = cats.flatMap(k => k.items);
    return { th, menu, cats, items, photos: items.filter(i => i.photo), texts: items.filter(i => !i.photo), L: (b: Bi) => (ar ? b.ar || b.en : b.en || b.ar), ar,
      head: { fontFamily: ar ? th.headAr : th.head, textTransform: th.upper && !ar ? "uppercase" : undefined, letterSpacing: th.upper && !ar ? 2 : undefined, fontWeight: 700 }, cur: ar ? "ر.ع" : "OMR", screen, of };
  }, [menu, catIds, ar, th, screen, of]);

  const slides = useMemo(() => {
    const s: { key: string; node: ReactNode }[] = [];
    if (c.cats.length) s.push({ key: "menu", node: LAYOUT[design.layout](c) });
    const best = c.items.find(i => i.best && i.photo);
    if (best) s.push({ key: "best", node: <PromoSlide c={c} o={best} label={ar ? "الأكثر طلبًا" : "Best seller"} /> });
    if (showOffers) activeOffers(menu).forEach(o => s.push({ key: o.id, node: <PromoSlide c={c} o={o} label={ar ? "عرض خاص" : "Special offer"} /> }));
    if (!s.length) s.push({ key: "brand", node: <div style={{ height: "100%", display: "grid", placeItems: "center", textAlign: "center" }}><div><Brand c={c} size={160} /><div style={{ marginTop: 30 }}><Hours c={c} size={40} /></div></div></div> });
    return s;
  }, [c, design.layout, menu, showOffers, ar]);

  useEffect(() => { setIdx(i => (i >= slides.length ? 0 : i)); }, [slides.length]);
  useEffect(() => {
    if (!playing || slides.length < 2) return;
    const id = setInterval(() => setIdx(i => (i + 1) % slides.length), Math.max(3, slideSeconds) * 1000);
    return () => clearInterval(id);
  }, [playing, slides.length, slideSeconds]);

  return (
    <div ref={box} style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden", background: th.bg }} dir={ar ? "rtl" : "ltr"}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: "0 0", color: th.fg, fontFamily: ar ? "'Tajawal',sans-serif" : th.body, background: th.bg }} className={playing ? "tv-playing" : ""}>
        {slides.map((s, i) => <div key={s.key} style={{ position: "absolute", inset: 0, opacity: i === idx ? 1 : 0, transition: "opacity .9s ease", zIndex: i === idx ? 1 : 0 }} aria-hidden={i !== idx}>{i === idx || slides.length < 4 ? s.node : null}</div>)}
        {slides.length > 1 && <div style={{ position: "absolute", insetInlineEnd: 30, bottom: 22, display: "flex", gap: 10, zIndex: 3 }}>{slides.map((s, i) => <i key={s.key} style={{ width: i === idx ? 44 : 14, height: 8, borderRadius: 8, background: i === idx ? th.ac : `${th.fg}55`, transition: "width .4s" }} />)}</div>}
      </div>
    </div>
  );
}
