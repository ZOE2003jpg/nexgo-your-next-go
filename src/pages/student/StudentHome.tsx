import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { G, btn, card, inp } from "@/lib/nexgo-theme";
import { STitle, Badge, Spinner } from "@/components/nexgo/SharedUI";
import { toast } from "@/components/nexgo/ToastContainer";

export function StudentHome({ wallet, setTab, profile }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const { user, refreshWallet } = useAuth();

  const fetchOrders = useCallback(() => {
    if (!user) return;
    supabase.from("orders").select("id, order_number, total_amount, status, created_at, restaurant_id, delivery_fee, disputed_at, restaurants(name)").eq("student_id", user.id).order("created_at", { ascending: false }).limit(10)
      .then(({ data }) => { if (data) setOrders(data); });
  }, [user]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('student-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `student_id=eq.${user.id}` }, () => { fetchOrders(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchOrders]);

  const cancelOrder = async (orderId: string) => {
    if (!user) return;
    setCancellingId(orderId);
    const { data: result } = await supabase.rpc("refund_order", { _order_id: orderId, _user_id: user.id });
    const r = result as any;
    if (!r?.success) { toast(r?.message || "Cannot cancel this order", "error"); setCancellingId(null); return; }
    refreshWallet();
    toast(`Order cancelled & ₦${r.refunded?.toLocaleString() || 0} refunded`, "success");
    setCancellingId(null);
    fetchOrders();
  };

  const submitDispute = async () => {
    if (!user || !disputeId || !disputeReason) return;
    const order = orders.find(o => o.id === disputeId);
    if (!order) return;
    const ageMs = Date.now() - new Date(order.created_at).getTime();
    if (ageMs > 30 * 60 * 1000) { toast("Dispute window closed (30 min)", "error"); setDisputeId(null); return; }
    await supabase.from("orders").update({ status: "under_review", dispute_reason: disputeReason, disputed_at: new Date().toISOString() }).eq("id", disputeId);
    toast("Dispute submitted for review", "success");
    setDisputeId(null); setDisputeReason("");
    fetchOrders();
  };

  const firstName = profile?.full_name?.split(" ")[0] || "Student";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 24, animation: "fadeUp .4s ease", maxWidth: 800, margin: "0 auto", width: "100%" }}>
      {disputeId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setDisputeId(null)}>
          <div onClick={e => e.stopPropagation()} style={{ ...card({ maxWidth: 400, width: "100%" }) }}>
            <STitle>Flag Order</STitle>
            <div style={{ fontSize: 13, color: G.whiteDim, margin: "8px 0 12px" }}>Describe your issue (within 30 min of delivery)</div>
            <textarea style={{ ...inp({ height: 80, resize: "none" as any }), marginBottom: 12 }} placeholder="What went wrong?" value={disputeReason} onChange={e => setDisputeReason(e.target.value)} />
            <button onClick={submitDispute} style={{ ...btn("gold", { width: "100%", padding: "13px" }) }}>Submit Dispute</button>
          </div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: G.whiteDim, fontSize: 13 }}>{greeting},</div>
          <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 34, fontWeight: 700, color: G.white, lineHeight: 1.1 }}>{firstName} 👋</div>
        </div>
        <div onClick={() => setTab("wallet")} style={{ background: G.b3, border: `1px solid ${G.b5}`, borderRadius: 12, padding: "10px 16px", textAlign: "right", cursor: "pointer" }}>
          <div style={{ fontSize: 10, color: G.whiteDim, letterSpacing: ".05em" }}>WALLET</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: G.gold, fontFamily: "'DM Mono'" }}>₦{wallet.toLocaleString()}</div>
        </div>
      </div>
      <div onClick={() => setTab("chow")} style={{ background: `linear-gradient(135deg,${G.goldDark},${G.gold})`, borderRadius: 20, padding: "26px 22px", position: "relative", overflow: "hidden", cursor: "pointer" }}>
        <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: G.black, opacity: 0.7, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>🎉 Today Only</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: G.black, marginBottom: 6 }}>Free delivery on NexChow!</div>
        <div style={{ fontSize: 13, color: G.black, opacity: 0.7 }}>Order any meal, zero delivery fee</div>
      </div>
      <div>
        <STitle>Quick Actions</STitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 12 }}>
          {[{ icon: "🍽️", label: "NexChow", sub: "Food & drinks", tab: "chow" }, { icon: "📦", label: "Dispatch", sub: "Send packages", tab: "dispatch" }, { icon: "🚌", label: "NexTrip", sub: "Campus rides", tab: "trip" }].map((a: any) => (
            <div key={a.label} onClick={() => setTab(a.tab)} className="hover-gold" style={{ ...card({ textAlign: "center", cursor: "pointer", padding: 16, transition: "all .2s" }) }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>{a.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: G.white }}>{a.label}</div>
              <div style={{ fontSize: 11, color: G.whiteDim, marginTop: 3 }}>{a.sub}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <STitle>Recent Orders</STitle>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {orders.length === 0 && <div style={{ ...card(), textAlign: "center", color: G.whiteDim, fontSize: 14 }}>No orders yet. Try NexChow!</div>}
          {orders.map((o: any) => (
            <div key={o.id} style={card({ cursor: "pointer" })}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: G.white }}>{(o.restaurants as any)?.name || "Order"}</div>
                  <div style={{ fontSize: 12, color: G.whiteDim, marginTop: 2 }}>{o.order_number} · {new Date(o.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, color: G.gold, fontFamily: "'DM Mono'", fontSize: 13 }}>₦{o.total_amount?.toLocaleString()}</div>
                  <Badge status={o.status} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                {o.status === "Pending" && (
                  <button onClick={(e) => { e.stopPropagation(); cancelOrder(o.id); }} disabled={cancellingId === o.id} style={{ ...btn("ghost", { padding: "6px 12px", fontSize: 12, color: G.danger, border: `1px solid ${G.danger}40`, opacity: cancellingId === o.id ? .5 : 1 }) }}>
                    {cancellingId === o.id ? <Spinner size={12} color={G.danger} /> : "Cancel"}
                  </button>
                )}
                {o.status === "Delivered" && !o.disputed_at && (() => {
                  const ageMs = Date.now() - new Date(o.created_at).getTime();
                  return ageMs <= 30 * 60 * 1000;
                })() && (
                    <button onClick={(e) => { e.stopPropagation(); setDisputeId(o.id); }} style={{ ...btn("ghost", { padding: "6px 12px", fontSize: 12, color: "#E8A030", border: "1px solid rgba(232,160,48,0.4)" }) }}>
                      ⚠️ Dispute
                    </button>
                  )}
                {o.status === "under_review" && <span style={{ fontSize: 11, color: "#E8A030", fontWeight: 600 }}>🔍 Under Review</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
