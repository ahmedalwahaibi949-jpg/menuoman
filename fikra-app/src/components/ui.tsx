import { useEffect, useRef, useState, type ReactNode } from "react";

/** Fades content up when it scrolls into view. Content stays visible if observers are unavailable. */
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el || seen || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { setSeen(true); io.disconnect(); } }, { rootMargin: "0px 0px -8% 0px" });
    io.observe(el); return () => io.disconnect();
  }, [seen]);
  // Content is visible by default; the entrance animation is added only at the moment it scrolls in.
  return <div ref={ref} className={`${seen ? "animate-rise" : ""} ${className}`} style={{ animationDelay: `${delay}ms` }}>{children}</div>;
}

/** Counts up to a real number when visible. */
export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let raf = 0;
    const run = () => { const t0 = performance.now(); const tick = (t: number) => { const p = Math.min(1, (t - t0) / 900); setN(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); }; raf = requestAnimationFrame(tick); };
    if (typeof IntersectionObserver === "undefined" || matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(to); return; }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { run(); io.disconnect(); } });
    io.observe(el); return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to]);
  return <span ref={ref} className="tabular-nums">{n}{suffix}</span>;
}

export function Logo({ light = false, size = 34 }: { light?: boolean; size?: number }) {
  const fg = light ? "#F7F8F5" : "#071426";
  return (
    <span className="inline-flex items-center gap-2.5" dir="ltr">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <path d="M16 50V20c0-2.8 2.2-5 5-5h25l-6 8H25v6h17l-6 8H25v13z" fill={fg} />
        <path d="M40 15h6l-6 8h-6z" fill="#00D6C5" />
        <path d="M9 40c8 9 26 8 46-8-14 16-38 22-46 8z" fill="#00D6C5" />
        <rect x="49" y="20" width="5" height="5" fill="#00D6C5" /><rect x="56" y="27" width="4" height="4" fill={fg} opacity=".7" /><rect x="50" y="29" width="4" height="4" fill="#00D6C5" opacity=".6" />
      </svg>
      <span className="leading-none">
        <span className="block font-display text-[19px] font-extrabold tracking-[.08em]" style={{ color: fg }}>FIKRA</span>
        <span className="block font-display text-[9.5px] font-semibold tracking-[.42em] text-teal-600">DIGITAL</span>
      </span>
    </span>
  );
}

/** A browser-window frame for demos and previews. */
export function BrowserFrame({ url, children, className = "" }: { url: string; children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-card ${className}`} dir="ltr">
      <div className="flex items-center gap-2 border-b border-navy/10 bg-mist px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#F26B5E]" /><span className="h-2.5 w-2.5 rounded-full bg-[#F5BD4F]" /><span className="h-2.5 w-2.5 rounded-full bg-[#5FCB5A]" />
        <span className="ms-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-[12px] text-slate">{url}</span>
      </div>
      {children}
    </div>
  );
}

export function Field({ label, error, children, hint }: { label: string; error?: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block min-w-0">
      <span className="label">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-[13px] text-slate">{hint}</span>}
      {error && <span className="mt-1 block text-[13px] font-medium text-red-700" role="alert">{error}</span>}
    </label>
  );
}

export function Toast({ msg, bad }: { msg: string; bad?: boolean }) {
  return <div role="status" className={`fixed bottom-6 left-1/2 z-[90] max-w-[92vw] -translate-x-1/2 rounded-xl px-5 py-3 text-[15px] text-white shadow-card ${bad ? "bg-red-700" : "bg-navy"}`}>{msg}</div>;
}
export function useToast() {
  const [t, setT] = useState<{ msg: string; bad?: boolean } | null>(null);
  useEffect(() => { if (!t) return; const id = setTimeout(() => setT(null), 3600); return () => clearTimeout(id); }, [t]);
  return { toast: (msg: string, bad?: boolean) => setT({ msg, bad }), node: t ? <Toast {...t} /> : null };
}

export const Arrow = ({ className = "" }: { className?: string }) => (
  <svg className={`h-4 w-4 rtl:rotate-180 ${className}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
);
export const Check = () => (
  <svg className="mt-1 h-4 w-4 flex-none text-teal-600" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 5" /></svg>
);

/** 3D tilt: the child leans toward the pointer and a soft light follows it. Still under reduced-motion and on touch. */
export function Tilt({ children, className = "", max = 9 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(hover: none)").matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--ry", `${(x - .5) * max * 2}deg`); el.style.setProperty("--rx", `${(.5 - y) * max * 2}deg`);
      el.style.setProperty("--gx", `${x * 100}%`); el.style.setProperty("--gy", `${y * 100}%`); el.style.setProperty("--go", "1");
    };
    const leave = () => { el.style.setProperty("--ry", "0deg"); el.style.setProperty("--rx", "0deg"); el.style.setProperty("--go", "0"); };
    el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  }, [max]);
  return (
    <div ref={ref} className={`tilt ${className}`}>
      <div className="tilt-inner">{children}<span className="tilt-glare" aria-hidden="true" /></div>
    </div>
  );
}

/** Layers inside move by different amounts as the pointer moves, giving depth. Mark layers with data-depth="0.5". */
export function useParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(hover: none)").matches) return;
    const layers = [...el.querySelectorAll<HTMLElement>("[data-depth]")];
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      layers.forEach(l => { const d = +(l.dataset.depth || 0); l.style.translate = `${-x * d * 60}px ${-y * d * 60}px`; });
      el.style.setProperty("--prx", `${-y * 8}deg`); el.style.setProperty("--pry", `${x * 10}deg`);
    };
    const leave = () => { layers.forEach(l => { l.style.translate = "0 0"; }); el.style.setProperty("--prx", "0deg"); el.style.setProperty("--pry", "0deg"); };
    const host = el.closest("section") || el;
    host.addEventListener("pointermove", move as EventListener); host.addEventListener("pointerleave", leave);
    return () => { host.removeEventListener("pointermove", move as EventListener); host.removeEventListener("pointerleave", leave); };
  }, []);
  return ref;
}
