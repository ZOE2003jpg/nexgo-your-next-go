export const G = {
  gold: "#C9A84C",
  goldLight: "#E8C97A",
  goldDark: "#9A7A2E",
  goldGlow: "rgba(201,168,76,0.15)",
  goldBorder: "rgba(201,168,76,0.3)",
  black: "#0A0A0A",
  b2: "#111111",
  b3: "#1A1A1A",
  b4: "#242424",
  b5: "#2E2E2E",
  white: "#F5F0E8",
  whiteDim: "rgba(245,240,232,0.55)",
  danger: "#E05555",
  success: "#4CAF7A",
};

export const injectStyles = () => {
  if (document.getElementById("nexgo-styles")) return;
  const s = document.createElement("style");
  s.id = "nexgo-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html,body,#root{height:100%;background:#0A0A0A;color:#F5F0E8;font-family:'DM Sans',sans-serif;}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#111}::-webkit-scrollbar-thumb{background:#9A7A2E;border-radius:2px}
    @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    @keyframes shimmer{0%,100%{opacity:.6}50%{opacity:1}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes glow{0%,100%{text-shadow:0 0 20px rgba(201,168,76,0.3)}50%{text-shadow:0 0 60px rgba(201,168,76,0.9)}}
    @keyframes popUp{from{opacity:0;transform:translateX(-50%) translateY(24px) scale(0.94)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}
    @keyframes slideIn{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
    input,textarea,select{outline:none;font-family:inherit;}
    button{cursor:pointer;font-family:inherit;border:none;}
    .hover-gold:hover{border-color:rgba(201,168,76,0.4)!important;background:rgba(201,168,76,0.06)!important;}
    .hover-lift:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.4)!important;}
  `;
  document.head.appendChild(s);
};

export const btn = (v = "gold", ex: any = {}) => ({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  padding: "12px 24px", borderRadius: 10, fontWeight: 600, fontSize: 14,
  letterSpacing: ".03em", cursor: "pointer", border: "none", transition: "all .2s",
  ...(v === "gold" ? { background: `linear-gradient(135deg,${G.gold},${G.goldDark})`, color: G.black } :
    v === "outline" ? { background: "transparent", border: `1.5px solid ${G.gold}`, color: G.gold } :
      { background: G.b4, color: G.white }),
  ...ex,
});

export const card = (ex: any = {}) => ({ background: G.b3, border: `1px solid ${G.b5}`, borderRadius: 16, padding: 20, ...ex });
export const inp = (ex: any = {}) => ({ width: "100%", padding: "13px 16px", background: G.b4, border: `1.5px solid ${G.b5}`, borderRadius: 10, color: G.white, fontSize: 14, ...ex });
