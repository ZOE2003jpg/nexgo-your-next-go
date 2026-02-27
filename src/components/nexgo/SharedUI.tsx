import { G } from "@/lib/nexgo-theme";

export const STitle = ({ children }: any) => (
  <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 20, fontWeight: 700, color: G.white }}>{children}</div>
);

export const PHeader = ({ title, sub, icon }: any) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <span style={{ fontSize: 26 }}>{icon}</span>
    <div>
      <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 26, fontWeight: 700, color: G.white, lineHeight: 1.1 }}>{title}</div>
      <div style={{ color: G.whiteDim, fontSize: 12 }}>{sub}</div>
    </div>
  </div>
);

export const Lbl = ({ children }: any) => (
  <div style={{ fontSize: 11, fontWeight: 600, color: G.whiteDim, letterSpacing: ".06em", textTransform: "uppercase" }}>{children}</div>
);

export const Chip = ({ children }: any) => (
  <div style={{ background: G.goldGlow, border: `1px solid ${G.goldDark}`, color: G.gold, fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>{children}</div>
);

export const Badge = ({ status }: any) => {
  const c: any = ({ delivered: G.success, Delivered: G.success, Done: G.success, Active: G.gold, out_for_delivery: G.gold, "In Transit": G.gold, preparing: "#E8A030", Preparing: "#E8A030", Pending: G.whiteDim, accepted: G.gold, ready: G.goldLight, Ready: G.goldLight, Open: G.success, Suspended: G.danger, Confirmed: G.success, cancelled: G.danger, under_review: "#E8A030" })[status] || G.whiteDim;
  return <div style={{ background: `${c}22`, color: c, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6, display: "inline-block", whiteSpace: "nowrap" }}>{status}</div>;
};

export const Spinner = ({ size = 16, color = G.black }: any) => (
  <span style={{ display: "inline-block", width: size, height: size, border: `2px solid ${color}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin .8s linear infinite" }} />
);
