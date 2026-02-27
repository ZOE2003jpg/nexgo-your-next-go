import { useAuth } from "@/hooks/useAuth";
import { G, btn, card } from "@/lib/nexgo-theme";

export function ProfileScreen({ onLogout }: any) {
  const { profile, role } = useAuth();
  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp .4s ease", maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <div style={{ textAlign: "center", paddingTop: 10 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg,${G.goldDark},${G.gold})`, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 700, color: G.black }}>{profile?.full_name?.[0] || "?"}</div>
        <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 28, fontWeight: 700, color: G.white }}>{profile?.full_name}</div>
        <div style={{ color: G.gold, fontSize: 12, marginTop: 4, fontFamily: "'DM Mono'", textTransform: "capitalize" }}>{role}</div>
      </div>
      <div style={card()}>
        {[{ icon: "👤", label: "Edit Profile" }, { icon: "🔔", label: "Notifications" }, { icon: "🔒", label: "Security & Privacy" }, { icon: "❓", label: "Help & Support" }].map((item: any, i: number, arr: any[]) => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < arr.length - 1 ? `1px solid ${G.b5}` : "none", cursor: "pointer" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ color: G.white, fontWeight: 500, fontSize: 14 }}>{item.label}</span>
            </div>
            <span style={{ color: G.whiteDim }}>›</span>
          </div>
        ))}
      </div>
      <button onClick={onLogout} style={{ ...btn("ghost", { width: "100%", padding: "14px", color: G.danger, border: `1px solid ${G.danger}40` }) }}>Sign Out</button>
    </div>
  );
}
