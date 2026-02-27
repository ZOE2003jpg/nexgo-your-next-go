import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { G, btn, card } from "@/lib/nexgo-theme";

export function RestaurantDetail({ r, cart, setCart, onBack, onCheckout }: any) {
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("menu_items").select("*").eq("restaurant_id", r.id).eq("available", true)
      .then(({ data }) => { if (data) setMenuItems(data); });
  }, [r.id]);

  const add = (item: any) => setCart((p: any) => { const ex = p.find((c: any) => c.id === item.id); return ex ? p.map((c: any) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c) : [...p, { ...item, qty: 1 }]; });
  const dec = (item: any) => setCart((p: any) => p.map((c: any) => c.id === item.id ? { ...c, qty: Math.max(0, c.qty - 1) } : c).filter((c: any) => c.qty > 0));
  const qtyOf = (id: string) => cart.find((c: any) => c.id === id)?.qty || 0;
  const total = cart.reduce((a: number, c: any) => a + c.price * c.qty, 0);

  return (
    <div style={{ padding: "24px 16px", animation: "fadeUp .4s ease", maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <button onClick={onBack} style={{ ...btn("ghost", { padding: "8px 16px", fontSize: 13, marginBottom: 16 }) }}>← Back</button>
      <div style={{ ...card({ display: "flex", gap: 16, alignItems: "center", marginBottom: 20, background: G.b4 }) }}>
        <div style={{ fontSize: 52 }}>{r.image}</div>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 24, fontWeight: 700, color: G.white }}>{r.name}</div>
          <div style={{ fontSize: 13, color: G.whiteDim }}>{r.cuisine}</div>
          <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 13, color: G.gold }}>
            <span>⭐ {r.rating}</span><span>🕐 {r.delivery_time}</span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: total > 0 ? 80 : 0 }}>
        {menuItems.map((item: any) => (
          <div key={item.id} style={card({ display: "flex", justifyContent: "space-between", alignItems: "center" })}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1 }}>
              <span style={{ fontSize: 28 }}>{item.image}</span>
              <div>
                <div style={{ fontWeight: 600, color: G.white, fontSize: 14 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: G.whiteDim }}>{item.description}</div>
                <div style={{ color: G.gold, fontFamily: "'DM Mono'", fontSize: 13, marginTop: 3 }}>₦{item.price.toLocaleString()}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {qtyOf(item.id) > 0 && (
                <>
                  <button onClick={() => dec(item)} style={{ width: 30, height: 30, borderRadius: "50%", background: G.b5, border: "none", color: G.white, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <span style={{ fontWeight: 700, color: G.gold, minWidth: 20, textAlign: "center", fontFamily: "'DM Mono'" }}>{qtyOf(item.id)}</span>
                </>
              )}
              <button onClick={() => add(item)} style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${G.gold},${G.goldDark})`, border: "none", color: G.black, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>
          </div>
        ))}
      </div>
      {total > 0 && (
        <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 500, zIndex: 90 }}>
          <button onClick={onCheckout} style={{ ...btn("gold", { width: "100%", padding: "16px", borderRadius: 14, fontSize: 15, justifyContent: "space-between", boxShadow: `0 8px 24px rgba(201,168,76,0.35)`, gap: 0 }) }}>
            <span>🛒 Checkout</span>
            <span>₦{total.toLocaleString()}</span>
          </button>
        </div>
      )}
    </div>
  );
}
