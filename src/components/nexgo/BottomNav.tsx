import { useState } from "react";
import { G } from "@/lib/nexgo-theme";
import NEXGO_LOGO from "@/assets/nexgo-logo.png";

export function BottomNav({ role, tab, setTab, cartCount }: any) {
  const [showMore, setShowMore] = useState(false);
  const cfg: any = {
    student: {
      left: [{ id: "home", icon: "⊞", label: "Home" }, { id: "chow", icon: "🍽️", label: "NexChow" }],
      right: [{ id: "wallet", icon: "💳", label: "Wallet" }, { id: "profile", icon: "👤", label: "Profile" }],
      more: [{ id: "dispatch", icon: "📦", label: "Dispatch" }, { id: "trip", icon: "🚌", label: "NexTrip" }, { id: "chat", icon: "💬", label: "Support" }],
    },
    vendor: {
      left: [{ id: "dashboard", icon: "📊", label: "Dashboard" }, { id: "orders", icon: "📦", label: "Orders" }],
      right: [{ id: "menu", icon: "🍽️", label: "Menu" }, { id: "profile", icon: "👤", label: "Profile" }],
      more: [{ id: "earnings", icon: "💳", label: "Earnings" }, { id: "chat", icon: "💬", label: "Support" }],
    },
    rider: {
      left: [{ id: "rdashboard", icon: "📊", label: "Dashboard" }, { id: "deliveries", icon: "🏍️", label: "Active" }],
      right: [{ id: "earnings", icon: "💳", label: "Earnings" }, { id: "profile", icon: "👤", label: "Profile" }],
      more: [{ id: "chat", icon: "💬", label: "Support" }],
    },
    admin: {
      left: [{ id: "adashboard", icon: "📊", label: "Dashboard" }, { id: "users", icon: "👥", label: "Users" }],
      right: [{ id: "analytics", icon: "📈", label: "Analytics" }, { id: "profile", icon: "👤", label: "Profile" }],
      more: [],
    },
  }[role] || { left: [], right: [], more: [] };

  const NavBtn = ({ t }: any) => (
    <button onClick={() => { setTab(t.id); setShowMore(false); }} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 2px", background: "transparent", border: "none", cursor: "pointer", position: "relative" }}>
      <div style={{ fontSize: 20, filter: t.id === tab ? `drop-shadow(0 0 6px ${G.gold})` : "none", transition: "filter .2s" }}>{t.icon}</div>
      {t.id === "chow" && cartCount > 0 && <div style={{ position: "absolute", top: 2, right: "14%", width: 16, height: 16, borderRadius: "50%", background: G.gold, color: G.black, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</div>}
      <div style={{ fontSize: 10, fontWeight: 600, color: t.id === tab ? G.gold : G.whiteDim, transition: "color .2s" }}>{t.label}</div>
      {t.id === tab && <div style={{ position: "absolute", bottom: -14, left: "50%", transform: "translateX(-50%)", width: 18, height: 2, background: G.gold, borderRadius: 1 }} />}
    </button>
  );

  return (
    <>
      {showMore && <div onClick={() => setShowMore(false)} style={{ position: "fixed", inset: 0, zIndex: 98, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />}
      {showMore && cfg.more.length > 0 && (
        <div style={{ position: "fixed", bottom: 82, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 500, background: G.b3, border: `1px solid ${G.goldBorder}`, borderRadius: 20, zIndex: 99, padding: "18px 14px 14px", boxShadow: "0 -8px 40px rgba(0,0,0,0.8)", animation: "popUp .28s cubic-bezier(0.34,1.56,0.64,1)" }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: G.whiteDim, textAlign: "center", marginBottom: 14 }}>More Services</div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(cfg.more.length, 3)},1fr)`, gap: 10 }}>
            {cfg.more.map((t: any) => (
              <button key={t.id} onClick={() => { setTab(t.id); setShowMore(false); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, background: t.id === tab ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${t.id === tab ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.06)"}`, borderRadius: 14, padding: "14px 8px", cursor: "pointer", transition: "all .2s" }}>
                <div style={{ fontSize: 26 }}>{t.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: t.id === tab ? G.gold : G.whiteDim, textAlign: "center", letterSpacing: "0.04em", textTransform: "uppercase" }}>{t.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: G.b2, borderTop: `1px solid rgba(201,168,76,0.2)`, display: "flex", alignItems: "center", padding: "8px 4px 14px", zIndex: 100 }}>
        {cfg.left.map((t: any) => <NavBtn key={t.id} t={t} />)}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", marginTop: -24 }} onClick={() => setShowMore((p: boolean) => !p)}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg,${G.goldDark},${G.gold},${G.goldLight})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 -4px 20px rgba(201,168,76,0.5),0 4px 16px rgba(0,0,0,0.6)`, border: `3px solid ${G.b2}`, transition: "transform .28s cubic-bezier(0.34,1.56,0.64,1)", transform: showMore ? "rotate(45deg) scale(1.08)" : "rotate(0deg) scale(1)" }}>
            <img src={NEXGO_LOGO} alt="" style={{ width: 32, height: 32, objectFit: "contain" }} />
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, color: G.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>{showMore ? "Close" : "Menu"}</div>
        </div>
        {cfg.right.map((t: any) => <NavBtn key={t.id} t={t} />)}
      </div>
    </>
  );
}
