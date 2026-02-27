import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { G, btn, card } from "@/lib/nexgo-theme";
import { PHeader, Spinner } from "@/components/nexgo/SharedUI";
import { toast } from "@/components/nexgo/ToastContainer";

export function NexTrip({ wallet }: any) {
  const { user, refreshWallet } = useAuth();
  const [routes, setRoutes] = useState<any[]>([]);
  const [sel, setSel] = useState<any>(null);
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("trip_routes").select("*").eq("active", true).then(({ data }) => { if (data) setRoutes(data); });
  }, []);

  const doBook = async () => {
    if (!user || !sel) return;
    setLoading(true);
    if (wallet < sel.price) { toast("Insufficient wallet balance", "error"); setLoading(false); return; }

    const code = "NX-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    const { error } = await supabase.from("trip_bookings").insert({
      route_id: sel.id, student_id: user.id, boarding_code: code,
    });
    if (error) { toast(error.message, "error"); setLoading(false); return; }

    const { data: deductResult } = await supabase.rpc("deduct_wallet", { _user_id: user.id, _amount: sel.price, _label: `NexTrip ${sel.from_location} → ${sel.to_location}`, _icon: "🚌" });
    const dr = deductResult as any;
    if (!dr?.success) { toast(dr?.message || "Wallet deduction failed", "error"); setLoading(false); return; }
    refreshWallet();

    setLoading(false); setBooked(true);
    toast("Seat booked!", "success");
  };

  if (booked && sel) return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16, animation: "fadeUp .4s ease", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ fontSize: 72 }}>🚌</div>
      <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 30, color: G.gold, fontWeight: 700 }}>Seat Reserved!</div>
      <div style={{ color: G.whiteDim, textAlign: "center", fontSize: 14 }}>Your seat on <strong style={{ color: G.white }}>{sel.from_location} → {sel.to_location}</strong> is confirmed.</div>
      <button onClick={() => { setBooked(false); setSel(null); }} style={{ ...btn("outline") }}>Book Another</button>
    </div>
  );

  return (
    <div style={{ padding: "24px 16px", animation: "fadeUp .4s ease", maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <PHeader title="NexTrip" sub="Campus shuttle booking" icon="🚌" />
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20 }}>
        {routes.map((r: any) => (
          <div key={r.id} onClick={() => setSel(r)} style={{ ...card({ cursor: "pointer", border: `1.5px solid ${sel?.id === r.id ? G.gold : G.b5}`, background: sel?.id === r.id ? G.goldGlow : G.b3, transition: "all .2s" }) }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, color: G.white, fontSize: 15 }}>{r.from_location}</div>
                <div style={{ color: G.gold, fontSize: 22, margin: "4px 0" }}>↓</div>
                <div style={{ fontWeight: 700, color: G.white, fontSize: 15 }}>{r.to_location}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: G.gold, fontWeight: 700, fontFamily: "'DM Mono'", fontSize: 18 }}>₦{r.price}</div>
                <div style={{ fontSize: 12, color: G.whiteDim, marginTop: 4 }}>🚌 {r.seats_available} seats left</div>
                <div style={{ fontSize: 12, color: G.success, marginTop: 2 }}>Next: {r.next_departure}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {sel && <button onClick={doBook} disabled={loading} style={{ ...btn("gold", { width: "100%", padding: "15px", borderRadius: 14, fontSize: 15, marginTop: 20, opacity: loading ? .7 : 1 }) }}>
        {loading ? <Spinner /> : `Book Seat · ₦${sel.price} →`}
      </button>}
    </div>
  );
}
