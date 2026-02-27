import { useState, useEffect } from "react";
import { G } from "@/lib/nexgo-theme";
import NEXGO_LOGO from "@/assets/nexgo-logo.png";

export function Splash({ onDone }: any) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setProgress((p: number) => { if (p >= 100) { clearInterval(t); setTimeout(onDone, 400); return 100; } return p + 1.2; }), 22);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 800);
    const t3 = setTimeout(() => setPhase(3), 1300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);
  return (
    <div style={{ height: "100vh", background: `radial-gradient(ellipse at 50% 40%, #1a1510 0%, ${G.black} 70%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40, overflow: "hidden", position: "relative" }}>
      <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle,rgba(201,168,76,0.12) 0%,transparent 55%)`, top: "-25%", right: "-15%", pointerEvents: "none", animation: "shimmer 4s ease infinite" }} />
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,rgba(201,168,76,0.06) 0%,transparent 60%)`, bottom: "-10%", left: "-10%", pointerEvents: "none", animation: "shimmer 5s ease 1s infinite" }} />
      <div style={{ position: "absolute", top: "18%", left: "50%", transform: "translateX(-50%)", width: 180, height: 1, background: `linear-gradient(90deg,transparent,${G.gold}40,transparent)`, opacity: phase >= 1 ? 1 : 0, transition: "opacity 1s ease" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? "translateY(0) scale(1)" : "translateY(30px) scale(0.9)", transition: "all .8s cubic-bezier(0.16,1,0.3,1)" }}>
        <img src={NEXGO_LOGO} alt="NexGo" style={{ width: 260, objectFit: "contain", filter: "drop-shadow(0 0 40px rgba(201,168,76,0.4)) drop-shadow(0 0 80px rgba(201,168,76,0.15))" }} />
      </div>
      <div style={{ opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? "translateY(0)" : "translateY(16px)", transition: "all .6s cubic-bezier(0.16,1,0.3,1) .1s", textAlign: "center" }}>
        <div style={{ color: G.whiteDim, fontSize: 13, letterSpacing: "5px", textTransform: "uppercase", fontWeight: 300 }}>Campus Super App</div>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 18 }}>
          {[{ ic: "🍽️", l: "Food" }, { ic: "📦", l: "Dispatch" }, { ic: "🚌", l: "Rides" }].map((s, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: phase >= 3 ? 1 : 0, transform: phase >= 3 ? "translateY(0)" : "translateY(12px)", transition: `all .5s cubic-bezier(0.16,1,0.3,1) ${i * 0.15}s` }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `rgba(201,168,76,0.08)`, border: `1px solid rgba(201,168,76,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{s.ic}</div>
              <div style={{ fontSize: 10, color: G.whiteDim, letterSpacing: ".08em", fontWeight: 500 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ width: 200, opacity: phase >= 2 ? 1 : 0, transition: "opacity .5s ease .3s" }}>
        <div style={{ height: 2, background: `rgba(201,168,76,0.15)`, borderRadius: 1, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg,${G.goldDark},${G.gold},${G.goldLight})`, borderRadius: 1, transition: "width .03s linear", boxShadow: `0 0 12px ${G.gold}60` }} />
        </div>
      </div>
      <div style={{ position: "absolute", bottom: "18%", left: "50%", transform: "translateX(-50%)", width: 120, height: 1, background: `linear-gradient(90deg,transparent,${G.gold}30,transparent)`, opacity: phase >= 2 ? 1 : 0, transition: "opacity 1s ease .5s" }} />
    </div>
  );
}
