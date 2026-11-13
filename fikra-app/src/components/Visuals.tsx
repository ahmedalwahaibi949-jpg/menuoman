import { useEffect, useRef } from "react";
import { useParallax } from "./ui";

/** Hero visual: an idea (spark) connecting into interface pieces. Canvas network behind floating UI cards. */
export function HeroVisual() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, on = true;
    const N = 46;
    const pts = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - .5) * .0007, vy: (Math.random() - .5) * .0007 }));
    const size = () => { const r = c.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1); w = r.width; h = r.height; c.width = w * d; c.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > 1) p.vx *= -1; if (p.y < 0 || p.y > 1) p.vy *= -1; }
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        const a = pts[i], b = pts[j], dx = (a.x - b.x) * w, dy = (a.y - b.y) * h, d = Math.hypot(dx, dy);
        if (d < 130) { ctx.strokeStyle = `rgba(0,214,197,${(1 - d / 130) * .28})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x * w, a.y * h); ctx.lineTo(b.x * w, b.y * h); ctx.stroke(); }
      }
      for (const p of pts) { ctx.fillStyle = "rgba(0,214,197,.75)"; ctx.beginPath(); ctx.arc(p.x * w, p.y * h, 1.6, 0, 7); ctx.fill(); }
      if (on && !still) raf = requestAnimationFrame(draw);
    };
    size(); draw();
    const ro = new ResizeObserver(() => { size(); if (still) draw(); }); ro.observe(c);
    const io = new IntersectionObserver(es => { const v = es[0].isIntersecting; if (v && !on) { on = true; draw(); } else if (!v) { on = false; cancelAnimationFrame(raf); } }); io.observe(c);
    return () => { on = false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, []);

  const par = useParallax<HTMLDivElement>();
  return (
    <div ref={par} className="relative mx-auto aspect-[1/1.02] w-full max-w-[520px]" style={{ perspective: "1200px" }} aria-hidden="true" dir="ltr">
     <div className="parallax-3d absolute inset-0">
      <canvas ref={ref} className="absolute inset-0 h-full w-full" data-depth="0.15" />
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal/25 blur-3xl" />
      {/* browser card */}
      <div data-depth="0.5" className="absolute left-[6%] top-[10%] w-[64%] animate-float rounded-2xl border border-white/10 bg-navy-800/90 p-3 shadow-glow backdrop-blur">
        <div className="mb-3 flex gap-1.5"><i className="h-2 w-2 rounded-full bg-white/25" /><i className="h-2 w-2 rounded-full bg-white/25" /><i className="h-2 w-2 rounded-full bg-teal" /></div>
        <div className="h-3 w-2/3 rounded bg-paper/90" /><div className="mt-2 h-2 w-1/2 rounded bg-white/25" />
        <div className="mt-4 grid grid-cols-3 gap-2">{[0, 1, 2].map(i => <div key={i} className="h-14 rounded-lg bg-gradient-to-br from-navy-600 to-navy-700" />)}</div>
        <div className="mt-3 h-7 w-24 rounded-full bg-teal" />
      </div>
      {/* chart card */}
      <div data-depth="0.9" className="absolute bottom-[12%] left-[0%] w-[44%] animate-float rounded-2xl border border-white/10 bg-navy-800/90 p-3 backdrop-blur" style={{ animationDelay: "-2.5s" }}>
        <div className="mb-2 h-2 w-16 rounded bg-white/30" />
        <div className="flex h-20 items-end gap-1.5">{[38, 62, 45, 80, 58, 96].map((v, i) => <span key={i} className="flex-1 origin-bottom rounded-t bg-gradient-to-t from-teal-700 to-teal" style={{ height: `${v}%`, animation: `grow 1.1s cubic-bezier(.2,.7,.2,1) ${i * 90}ms both` }} />)}</div>
      </div>
      {/* phone card */}
      <div data-depth="1.3" className="absolute right-[2%] top-[26%] w-[30%] animate-float rounded-[22px] border border-white/15 bg-navy-800/95 p-2 backdrop-blur" style={{ animationDelay: "-4s" }}>
        <div className="rounded-2xl bg-paper p-2">
          <div className="aspect-square rounded-xl bg-gradient-to-br from-teal to-teal-700" />
          <div className="mt-2 h-2 w-3/4 rounded bg-navy/80" /><div className="mt-1.5 h-2 w-1/2 rounded bg-navy/25" />
          <div className="mt-2 h-5 rounded-full bg-navy" />
        </div>
      </div>
      {/* spark */}
      <svg data-depth="1.8" className="absolute right-[18%] top-[4%] h-12 w-12 animate-pulseDot text-teal" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c.6 6.5 5 11 12 12-7 1-11.4 5.500-12 12-.6-6.500-5-11-12-12 7-1 11.400-5.500 12-12z" /></svg>
      <div className="absolute bottom-[6%] right-[10%] grid grid-cols-3 gap-1.5">{[1, 0, 1, 0, 1, 1, 1, 0, 0].map((v, i) => <i key={i} className={`h-3 w-3 ${v ? "bg-teal" : "bg-white/15"} animate-pulseDot`} style={{ animationDelay: `${i * 160}ms` }} />)}</div>
     </div>
    </div>
  );
}

/** Small looping demonstrations for the four service cards. */
export function ServiceVisual({ kind }: { kind: "web" | "shop" | "saas" | "interactive" }) {
  const shell = "relative h-44 overflow-hidden rounded-2xl bg-navy p-4 grid-glow";
  if (kind === "web") return (
    <div className={shell} aria-hidden="true" dir="ltr">
      <div className="h-full rounded-xl bg-paper p-3">
        <div className="flex items-center justify-between"><i className="h-2 w-10 rounded bg-navy" /><span className="flex gap-1.5">{[0, 1, 2].map(i => <i key={i} className="h-1.5 w-5 rounded bg-navy/25" />)}</span></div>
        <div className="mt-4 h-3 w-3/5 rounded bg-navy" style={{ animation: "rise .8s both" }} />
        <div className="mt-2 h-2 w-2/5 rounded bg-navy/30" style={{ animation: "rise .8s .15s both" }} />
        <div className="mt-3 h-6 w-20 rounded-full bg-teal" style={{ animation: "rise .8s .3s both" }} />
        <div className="mt-3 grid grid-cols-3 gap-2">{[0, 1, 2].map(i => <i key={i} className="h-8 rounded-md bg-mist" style={{ animation: `rise .8s ${.45 + i * .12}s both` }} />)}</div>
      </div>
    </div>
  );
  if (kind === "shop") return (
    <div className={shell} aria-hidden="true" dir="ltr">
      <div className="grid h-full grid-cols-3 gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-xl bg-paper p-2" style={{ animation: `rise .7s ${i * .12}s both` }}>
            <div className="aspect-square rounded-lg bg-gradient-to-br from-teal-soft to-mist" />
            <i className="mt-2 block h-1.5 w-4/5 rounded bg-navy/70" /><i className="mt-1 block h-1.5 w-2/5 rounded bg-teal-600" />
          </div>
        ))}
      </div>
      <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-teal px-3 py-1.5 text-[11px] font-bold text-navy shadow-glow animate-float"><svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 2h2l2 8h7l2-6H4" /><circle cx="6" cy="13" r="1" /><circle cx="12" cy="13" r="1" /></svg>3</div>
    </div>
  );
  if (kind === "saas") return (
    <div className={shell} aria-hidden="true" dir="ltr">
      <div className="grid h-full grid-cols-[52px_1fr] gap-2">
        <div className="grid content-start gap-2 rounded-xl bg-navy-700 p-2">{[1, 0, 0, 0].map((a, i) => <i key={i} className={`h-2 rounded ${a ? "bg-teal" : "bg-white/20"}`} />)}</div>
        <div className="rounded-xl bg-paper p-3">
          <div className="grid grid-cols-3 gap-2">{[0, 1, 2].map(i => <div key={i} className="rounded-md bg-mist p-1.5"><i className="block h-1.5 w-3/5 rounded bg-navy/30" /><i className="mt-1 block h-2.5 w-4/5 rounded bg-navy" /></div>)}</div>
          <svg className="mt-3 h-14 w-full" viewBox="0 0 200 56" fill="none" preserveAspectRatio="none">
            <path d="M0 46 C30 40 40 20 70 26 S110 44 135 22 S175 8 200 12" stroke="#00B3A5" strokeWidth="3" strokeLinecap="round" strokeDasharray="320" strokeDashoffset="320" style={{ animation: "draw 2.2s ease-out .2s forwards" }} />
          </svg>
        </div>
      </div>
    </div>
  );
  return (
    <div className={shell} aria-hidden="true" dir="ltr">
      <div className="flex h-full items-center justify-center gap-6">
        <div className="grid h-24 w-24 grid-cols-5 gap-[3px] rounded-xl bg-paper p-2">{Array.from({ length: 25 }, (_, i) => <i key={i} className={`rounded-[2px] ${[0, 1, 3, 4, 5, 9, 10, 12, 14, 15, 19, 20, 21, 23, 24, 7, 17].includes(i) ? "bg-navy" : "bg-transparent"}`} />)}</div>
        <svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="#00D6C5" strokeWidth="2" strokeLinecap="round" className="animate-pulseDot"><path d="M1 7h22M17 1l6 6-6 6" /></svg>
        <div className="h-36 w-[74px] rounded-[18px] border border-white/20 bg-navy-700 p-1.5">
          <div className="h-full rounded-[13px] bg-paper p-1.5">
            <div className="aspect-square animate-float rounded-full bg-gradient-to-br from-[#F2B34A] to-[#D9792B]" />
            <i className="mt-2 block h-1.5 w-4/5 rounded bg-navy" /><i className="mt-1 block h-1.5 w-1/2 rounded bg-teal-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
