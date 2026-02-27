import { useState, useEffect } from "react";
import { G } from "@/lib/nexgo-theme";

let _toastSetter: any = null;
export const toast = (msg: string, type = "info") => _toastSetter && _toastSetter((p: any) => [...p, { id: Date.now(), msg, type }]);

export function ToastContainer() {
  const [toasts, setToasts] = useState<any[]>([]);
  useEffect(() => { _toastSetter = setToasts; return () => { _toastSetter = null; }; }, []);
  useEffect(() => {
    if (!toasts.length) return;
    const t = setTimeout(() => setToasts(p => p.slice(1)), 3000);
    return () => clearTimeout(t);
  }, [toasts]);
  if (!toasts.length) return null;
  const colors: any = { success: G.success, error: G.danger, info: G.gold };
  const icons: any = { success: "✅", error: "❌", info: "ℹ️" };
  return (
    <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, width: "calc(100% - 32px)", maxWidth: 500, pointerEvents: "none" }}>
      {toasts.map((t: any) => (
        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, background: G.b3, border: `1px solid ${colors[t.type]}50`, borderLeft: `3px solid ${colors[t.type]}`, borderRadius: 10, padding: "12px 16px", boxShadow: "0 8px 32px rgba(0,0,0,0.6)", animation: "slideIn .3s ease", fontSize: 14, color: G.white, fontWeight: 500 }}>
          <span>{icons[t.type]}</span><span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
