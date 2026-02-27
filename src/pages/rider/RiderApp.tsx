import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { G, btn, card, inp } from "@/lib/nexgo-theme";
import { STitle, PHeader, Badge, Spinner } from "@/components/nexgo/SharedUI";
import { toast } from "@/components/nexgo/ToastContainer";
import { ProfileScreen } from "@/pages/shared/ProfileScreen";
import { ChatScreen } from "@/pages/shared/ChatScreen";

export function RiderApp({ tab, onLogout }: any) {
  const { user } = useAuth();
  const [online, setOnline] = useState(true);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [otpOrderId, setOtpOrderId] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const fetchData = useCallback(() => {
    if (!user) return;
    supabase.from("orders").select("*, restaurants(name)").eq("rider_id", user.id).order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => { if (data) setDeliveries(data); });
    supabase.from("dispatches").select("*").eq("rider_id", user.id).order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => { if (data) setDispatches(data); });
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('rider-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `rider_id=eq.${user.id}` }, () => { fetchData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dispatches', filter: `rider_id=eq.${user.id}` }, () => { fetchData(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchData]);

  const updateOrder = async (id: string, newStatus: string) => {
    if (!user) return;
    setUpdatingId(id);

    if (newStatus === "out_for_delivery") {
      const { data: validation } = await supabase.rpc("validate_order_transition", { _order_id: id, _new_status: newStatus, _user_id: user.id });
      const v = validation as any;
      if (!v?.valid) { toast(v?.message || "Invalid transition", "error"); setUpdatingId(null); return; }
      await supabase.rpc("generate_delivery_otp", { _order_id: id });
      await supabase.from("orders").update({ status: newStatus }).eq("id", id);
      setDeliveries(p => p.map(d => d.id === id ? { ...d, status: newStatus } : d));
      toast("Marked out for delivery. OTP sent to student.", "success");
      setUpdatingId(null);
      return;
    }

    if (newStatus === "delivered") {
      setOtpOrderId(id);
      setUpdatingId(null);
      return;
    }

    await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    setDeliveries(p => p.map(d => d.id === id ? { ...d, status: newStatus } : d));
    setUpdatingId(null);
  };

  const verifyOtpAndDeliver = async () => {
    if (!otpOrderId || !otpInput) return;
    setVerifyingOtp(true);
    const { data: valid } = await supabase.rpc("verify_delivery_otp", { _order_id: otpOrderId, _otp: otpInput });
    if (!valid) { toast("Invalid or expired OTP", "error"); setVerifyingOtp(false); return; }
    await supabase.from("orders").update({ status: "delivered" }).eq("id", otpOrderId);
    setDeliveries(p => p.map(d => d.id === otpOrderId ? { ...d, status: "delivered" } : d));
    toast("Delivery confirmed! ✅", "success");
    setOtpOrderId(null); setOtpInput(""); setVerifyingOtp(false);
  };

  const updateDispatch = async (id: string, status: string) => {
    setUpdatingId(id);
    await supabase.from("dispatches").update({ status }).eq("id", id);
    setDispatches(p => p.map(d => d.id === id ? { ...d, status } : d));
    setUpdatingId(null);
  };

  if (tab === "profile") return <ProfileScreen onLogout={onLogout} />;
  if (tab === "chat") return <ChatScreen />;

  if (tab === "earnings") return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp .4s ease", maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <PHeader title="Earnings" sub="Your delivery income" icon="💰" />
      <div style={{ background: `linear-gradient(135deg,${G.goldDark},${G.gold})`, borderRadius: 20, padding: "28px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ fontSize: 12, color: G.black, opacity: .7, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>Deliveries</div>
        <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 48, fontWeight: 700, color: G.black }}>{deliveries.length + dispatches.length}</div>
        <div style={{ fontSize: 13, color: G.black, opacity: .6, marginTop: 6 }}>total assignments</div>
      </div>
    </div>
  );

  // Rider Dashboard
  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp .4s ease", maxWidth: 800, margin: "0 auto", width: "100%" }}>
      {otpOrderId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => { setOtpOrderId(null); setOtpInput(""); }}>
          <div onClick={e => e.stopPropagation()} style={{ ...card({ maxWidth: 380, width: "100%", textAlign: "center" }) }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
            <STitle>Enter Delivery OTP</STitle>
            <div style={{ fontSize: 13, color: G.whiteDim, margin: "8px 0 16px" }}>Ask the student for their 6-digit delivery code</div>
            <input style={{ ...inp({ textAlign: "center", fontSize: 24, fontFamily: "'DM Mono'", letterSpacing: "8px", marginBottom: 16 }) }} placeholder="000000" maxLength={6} value={otpInput} onChange={e => setOtpInput(e.target.value.replace(/\D/g, ""))} />
            <button onClick={verifyOtpAndDeliver} disabled={verifyingOtp || otpInput.length !== 6} style={{ ...btn("gold", { width: "100%", padding: "14px", opacity: verifyingOtp || otpInput.length !== 6 ? .5 : 1 }) }}>
              {verifyingOtp ? <><Spinner /> Verifying…</> : "Confirm Delivery ✓"}
            </button>
          </div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ color: G.whiteDim, fontSize: 13 }}>Rider Dashboard</div>
          <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 30, fontWeight: 700, color: G.white }}>🏍️</div>
        </div>
        <div onClick={() => setOnline(o => !o)} style={{ background: online ? `${G.success}22` : G.b4, border: `1.5px solid ${online ? G.success : G.b5}`, borderRadius: 20, padding: "8px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700, color: online ? G.success : G.whiteDim, transition: "all .3s" }}>
          {online ? "🟢 Online" : "⚫ Offline"}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[{ v: String(deliveries.length), l: "Orders" }, { v: String(dispatches.length), l: "Dispatches" }].map((s: any) => (
          <div key={s.l} style={card({ textAlign: "center" })}>
            <div style={{ fontFamily: "'DM Mono'", fontSize: 18, fontWeight: 700, color: G.gold }}>{s.v}</div>
            <div style={{ fontSize: 11, color: G.whiteDim, marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <STitle>Active Orders</STitle>
      {deliveries.filter(d => !["delivered", "cancelled", "Done"].includes(d.status)).map((d: any) => (
        <div key={d.id} style={card({ border: `1.5px solid ${G.gold}` })}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontWeight: 700, color: G.white }}>{d.order_number}</span><Badge status={d.status} />
          </div>
          <div style={{ fontSize: 13, color: G.whiteDim, marginBottom: 4 }}>🏪 {(d.restaurants as any)?.name}</div>
          {d.delivery_address && <div style={{ fontSize: 13, color: G.whiteDim }}>🏠 {d.delivery_address}</div>}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <span style={{ color: G.gold, fontFamily: "'DM Mono'", fontWeight: 700 }}>₦{d.delivery_fee}</span>
            {d.status === "ready" && (
              <button onClick={() => updateOrder(d.id, "out_for_delivery")} disabled={updatingId === d.id} style={{ ...btn("gold", { padding: "8px 16px", fontSize: 13, opacity: updatingId === d.id ? .5 : 1 }) }}>
                {updatingId === d.id ? <Spinner size={12} /> : "Pick Up"}
              </button>
            )}
            {d.status === "out_for_delivery" && (
              <button onClick={() => updateOrder(d.id, "delivered")} disabled={updatingId === d.id} style={{ ...btn("gold", { padding: "8px 16px", fontSize: 13 }) }}>
                🔐 Enter OTP to Deliver
              </button>
            )}
          </div>
        </div>
      ))}
      <STitle>Dispatch Pickups</STitle>
      {dispatches.filter(d => d.status !== "Delivered" && d.status !== "Done").map((d: any) => (
        <div key={d.id} style={card()}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontWeight: 700, color: G.white }}>{d.dispatch_number}</span><Badge status={d.status} />
          </div>
          <div style={{ fontSize: 13, color: G.whiteDim }}>📍 {d.pickup_location} → {d.dropoff_location}</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
            <span style={{ color: G.gold, fontFamily: "'DM Mono'" }}>₦{d.fee}</span>
            <button onClick={() => updateDispatch(d.id, d.status === "Pending" ? "In Transit" : "Delivered")} disabled={updatingId === d.id} style={{ ...btn("gold", { padding: "8px 16px", fontSize: 12, opacity: updatingId === d.id ? .5 : 1 }) }}>
              {d.status === "Pending" ? "Accept" : "Complete"}
            </button>
          </div>
        </div>
      ))}
      {deliveries.length === 0 && dispatches.length === 0 && <div style={{ ...card(), textAlign: "center", color: G.whiteDim }}>No active deliveries</div>}
    </div>
  );
}
