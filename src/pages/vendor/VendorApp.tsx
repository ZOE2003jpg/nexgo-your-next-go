import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { G, btn, card } from "@/lib/nexgo-theme";
import { STitle, PHeader, Badge, Spinner } from "@/components/nexgo/SharedUI";
import { toast } from "@/components/nexgo/ToastContainer";
import { ProfileScreen } from "@/pages/shared/ProfileScreen";

export function VendorApp({ tab, onLogout }: any) {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("restaurants").select("*").eq("owner_id", user.id).limit(1).maybeSingle()
      .then(({ data }) => { if (data) { setRestaurant(data); setIsOpen(data.is_open); } });
  }, [user]);

  const fetchOrders = useCallback(() => {
    if (!restaurant) return;
    supabase.from("orders").select("*, order_items(*)").eq("restaurant_id", restaurant.id).order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => { if (data) setOrders(data); });
  }, [restaurant]);

  useEffect(() => {
    if (!restaurant) return;
    fetchOrders();
    supabase.from("menu_items").select("*").eq("restaurant_id", restaurant.id)
      .then(({ data }) => { if (data) setMenuItems(data); });
  }, [restaurant, fetchOrders]);

  useEffect(() => {
    if (!restaurant) return;
    const channel = supabase.channel('vendor-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurant.id}` }, () => { fetchOrders(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [restaurant, fetchOrders]);

  const toggleOpen = async () => {
    if (!restaurant) return;
    const newState = !isOpen;
    await supabase.from("restaurants").update({ is_open: newState }).eq("id", restaurant.id);
    setIsOpen(newState);
  };

  const nextStatus = async (id: string, current: string) => {
    if (!user) return;
    setUpdatingId(id);
    const statusMap: any = { "Pending": "accepted", "accepted": "preparing", "preparing": "ready" };
    const next = statusMap[current];
    if (!next) { toast("No valid next status", "error"); setUpdatingId(null); return; }

    const { data: validation } = await supabase.rpc("validate_order_transition", { _order_id: id, _new_status: next, _user_id: user.id });
    const v = validation as any;
    if (!v?.valid) { toast(v?.message || "Invalid transition", "error"); setUpdatingId(null); return; }

    await supabase.from("orders").update({ status: next }).eq("id", id);
    setOrders(p => p.map(o => o.id === id ? { ...o, status: next } : o));
    toast(`Order → ${next}`, "success");
    setUpdatingId(null);
  };

  const cancelOrder = async (id: string) => {
    if (!user) return;
    setUpdatingId(id);
    const { data: validation } = await supabase.rpc("validate_order_transition", { _order_id: id, _new_status: "cancelled", _user_id: user.id });
    const v = validation as any;
    if (!v?.valid) { toast(v?.message || "Cannot cancel", "error"); setUpdatingId(null); return; }
    await supabase.from("orders").update({ status: "cancelled", cancelled_by: user.id, cancellation_reason: "Cancelled by vendor" }).eq("id", id);
    setOrders(p => p.map(o => o.id === id ? { ...o, status: "cancelled" } : o));
    toast("Order cancelled", "success");
    setUpdatingId(null);
  };

  const restName = restaurant?.name || profile?.full_name || "Vendor";
  const statusLabel: any = { "Pending": "Accept", "accepted": "Start Prep", "preparing": "Mark Ready" };

  if (tab === "orders") return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 14, animation: "fadeUp .4s ease", maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <PHeader title="Orders" sub="Manage incoming orders" icon="📦" />
      {orders.length === 0 && <div style={{ ...card(), textAlign: "center", color: G.whiteDim }}>No orders yet</div>}
      {orders.map((o: any) => (
        <div key={o.id} style={card()}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontWeight: 700, color: G.white }}>{o.order_number}</span><Badge status={o.status} />
          </div>
          <div style={{ fontSize: 13, color: G.whiteDim, marginBottom: 3 }}>{o.order_items?.map((i: any) => `${i.name} x${i.quantity}`).join(", ")}</div>
          <div style={{ fontSize: 13, color: G.whiteDim, marginBottom: 12 }}>{new Date(o.created_at).toLocaleString()}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: G.gold, fontFamily: "'DM Mono'", fontWeight: 700 }}>₦{o.total_amount?.toLocaleString()}</span>
            <div style={{ display: "flex", gap: 8 }}>
              {statusLabel[o.status] && (
                <button onClick={() => nextStatus(o.id, o.status)} disabled={updatingId === o.id} style={{ ...btn("gold", { padding: "8px 16px", fontSize: 12, opacity: updatingId === o.id ? .5 : 1 }) }}>
                  {updatingId === o.id ? <Spinner size={12} /> : statusLabel[o.status]}
                </button>
              )}
              {["Pending", "accepted", "preparing"].includes(o.status) && (
                <button onClick={() => cancelOrder(o.id)} disabled={updatingId === o.id} style={{ ...btn("ghost", { padding: "8px 12px", fontSize: 12, color: G.danger, border: `1px solid ${G.danger}40` }) }}>✕</button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (tab === "menu") return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 14, animation: "fadeUp .4s ease", maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <PHeader title="Menu" sub="Manage your items" icon="🍽️" />
      </div>
      {menuItems.length === 0 && <div style={{ ...card(), textAlign: "center", color: G.whiteDim }}>No menu items yet</div>}
      {menuItems.map((item: any) => (
        <div key={item.id} style={card({ display: "flex", justifyContent: "space-between", alignItems: "center" })}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 28 }}>{item.image}</span>
            <div>
              <div style={{ fontWeight: 600, color: G.white, fontSize: 14 }}>{item.name}</div>
              <div style={{ fontSize: 12, color: G.whiteDim }}>{item.description}</div>
              <div style={{ color: G.gold, fontFamily: "'DM Mono'", fontSize: 13, marginTop: 3 }}>₦{item.price.toLocaleString()}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (tab === "profile") return <ProfileScreen onLogout={onLogout} />;

  // Vendor Dashboard (default)
  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp .4s ease", maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: G.whiteDim, fontSize: 13 }}>Welcome back,</div>
          <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 30, fontWeight: 700, color: G.white }}>{restName} 🍲</div>
        </div>
        <div onClick={toggleOpen} style={{ background: isOpen ? `${G.success}22` : G.b4, border: `1px solid ${isOpen ? G.success : G.b5}`, borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 700, color: isOpen ? G.success : G.whiteDim, cursor: "pointer", transition: "all .3s" }}>
          {isOpen ? "🟢 Open" : "⚫ Closed"}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { l: "Today's Orders", v: String(orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length), ic: "📦", c: G.gold },
          { l: "Pending", v: String(orders.filter(o => o.status === "Pending").length), ic: "⏳", c: G.danger },
          { l: "Menu Items", v: String(menuItems.length), ic: "🍽️", c: G.goldLight },
          { l: "Avg Rating", v: restaurant?.rating ? `${restaurant.rating} ⭐` : "N/A", ic: "⭐", c: G.success },
        ].map((s: any) => (
          <div key={s.l} style={card()}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.ic}</div>
            <div style={{ fontFamily: "'DM Mono'", fontSize: 22, fontWeight: 700, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 12, color: G.whiteDim, marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={card()}>
        <STitle>Recent Orders</STitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {orders.slice(0, 3).map((o: any) => (
            <div key={o.id} style={{ padding: 14, background: G.b4, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, color: G.white, fontSize: 14 }}>{o.order_items?.map((i: any) => i.name).join(", ") || o.order_number}</div>
                <div style={{ fontSize: 12, color: G.whiteDim }}>{new Date(o.created_at).toLocaleString()}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <Badge status={o.status} />
                <div style={{ color: G.gold, fontFamily: "'DM Mono'", fontSize: 13, marginTop: 4 }}>₦{o.total_amount?.toLocaleString()}</div>
              </div>
            </div>
          ))}
          {orders.length === 0 && <div style={{ textAlign: "center", color: G.whiteDim, fontSize: 13, padding: 20 }}>No orders yet</div>}
        </div>
      </div>
    </div>
  );
}
