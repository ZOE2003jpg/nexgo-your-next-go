import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { G, btn, card, inp } from "@/lib/nexgo-theme";
import { PHeader, Lbl, Badge, Spinner } from "@/components/nexgo/SharedUI";
import { toast } from "@/components/nexgo/ToastContainer";

export function NexDispatch() {
  const { user } = useAuth();
  const [view, setView] = useState("send");
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);
  const [dispatchId, setDispatchId] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pkgDesc, setPkgDesc] = useState("");
  const [dispatches, setDispatches] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("dispatches").select("*").eq("student_id", user.id).order("created_at", { ascending: false }).limit(10)
      .then(({ data }) => { if (data) setDispatches(data); });
  }, [user, requested]);

  const doRequest = async () => {
    if (!user || !pickup || !dropoff) { toast("Fill in pickup and dropoff locations", "error"); return; }
    setLoading(true);
    const num = "DP-" + Math.floor(Math.random() * 9000 + 1000);
    const { error } = await supabase.from("dispatches").insert({
      dispatch_number: num, student_id: user.id, pickup_location: pickup, dropoff_location: dropoff, package_description: pkgDesc,
    });
    setLoading(false);
    if (error) { toast(error.message, "error"); return; }
    setDispatchId(num); setRequested(true);
    toast("Rider requested!", "success");
  };

  if (requested) return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 16, animation: "fadeUp .4s ease", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ fontSize: 72 }}>🏍️</div>
      <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 30, fontWeight: 700, color: G.gold }}>Rider on the way!</div>
      <div style={{ color: G.whiteDim, textAlign: "center", fontSize: 14 }}>Your package will be picked up in ~8 minutes.</div>
      <div style={{ background: `${G.success}22`, border: `1px solid ${G.success}`, borderRadius: 14, padding: "16px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: G.whiteDim, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>Tracking ID</div>
        <div style={{ fontFamily: "'DM Mono'", fontSize: 20, fontWeight: 700, color: G.gold }}>#{dispatchId}</div>
      </div>
      <button onClick={() => { setRequested(false); setPickup(""); setDropoff(""); setPkgDesc(""); }} style={{ ...btn("outline") }}>Send Another</button>
    </div>
  );

  return (
    <div style={{ padding: "24px 16px", animation: "fadeUp .4s ease", maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <PHeader title="NexDispatch" sub="Send campus packages" icon="📦" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
        {[{ id: "send", icon: "📤", label: "Send Package", sub: "Request pickup" }, { id: "track", icon: "📍", label: "Track Package", sub: "Live updates" }].map((v: any) => (
          <button key={v.id} onClick={() => setView(v.id)} style={{ ...card({ cursor: "pointer", textAlign: "center", border: `1.5px solid ${view === v.id ? G.gold : G.b5}`, background: view === v.id ? G.goldGlow : G.b3, transition: "all .2s" }), width: "100%" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{v.icon}</div>
            <div style={{ fontWeight: 700, color: G.white }}>{v.label}</div>
            <div style={{ fontSize: 12, color: G.whiteDim, marginTop: 4 }}>{v.sub}</div>
          </button>
        ))}
      </div>
      {view === "send" && (
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <Lbl>Pickup Location</Lbl><input style={inp()} placeholder="e.g. Library, Block A" value={pickup} onChange={e => setPickup(e.target.value)} />
          <Lbl>Delivery Location</Lbl><input style={inp()} placeholder="e.g. Hostel B, Room 12" value={dropoff} onChange={e => setDropoff(e.target.value)} />
          <Lbl>Package Description</Lbl><input style={inp()} placeholder="e.g. Textbooks x2" value={pkgDesc} onChange={e => setPkgDesc(e.target.value)} />
          <div style={{ ...card({ background: G.goldGlow, border: `1px solid ${G.goldDark}` }) }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: G.whiteDim, fontSize: 14 }}>Estimated Fee</span>
              <span style={{ color: G.gold, fontWeight: 700, fontFamily: "'DM Mono'" }}>₦250</span>
            </div>
          </div>
          <button onClick={doRequest} disabled={loading} style={{ ...btn("gold", { width: "100%", padding: "14px", opacity: loading ? .7 : 1 }) }}>
            {loading ? <><Spinner /> Requesting…</> : "Request Rider →"}
          </button>
        </div>
      )}
      {view === "track" && (
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          {dispatches.length === 0 && <div style={{ ...card(), textAlign: "center", color: G.whiteDim }}>No dispatches yet</div>}
          {dispatches.map((d: any) => (
            <div key={d.id} style={card({ display: "flex", justifyContent: "space-between", alignItems: "center" })}>
              <div>
                <div style={{ fontWeight: 600, color: G.white, fontSize: 14 }}>{d.package_description || "Package"}</div>
                <div style={{ fontSize: 12, color: G.whiteDim, marginTop: 2 }}>{d.pickup_location} → {d.dropoff_location}</div>
                <div style={{ fontSize: 12, color: G.gold, fontFamily: "'DM Mono'", marginTop: 4 }}>₦{d.fee}</div>
              </div>
              <Badge status={d.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
