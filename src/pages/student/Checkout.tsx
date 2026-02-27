import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { G, btn, card, inp } from "@/lib/nexgo-theme";
import { STitle, PHeader, Spinner } from "@/components/nexgo/SharedUI";
import { toast } from "@/components/nexgo/ToastContainer";

export function Checkout({ cart, setCart, wallet, onBack, onDone, restaurantId }: any) {
  const { user, refreshWallet } = useAuth();
  const [pay, setPay] = useState("wallet");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone_] = useState(false);
  const placedRef = useRef(false);
  const fee = 150;
  const subtotal = cart.reduce((a: number, c: any) => a + c.price * c.qty, 0);
  const total = subtotal + fee;

  const place = async () => {
    if (!user) return;
    if (placedRef.current) return;
    placedRef.current = true;
    if (!address) { toast("Please enter delivery address", "error"); placedRef.current = false; return; }
    if (pay === "wallet" && wallet < total) { toast("Insufficient wallet balance", "error"); placedRef.current = false; return; }
    setLoading(true);

    let payRef: string | null = null;
    if (pay === "transfer") {
      const { data, error } = await supabase.functions.invoke("initialize-payment", { body: { amount: total } });
      if (error || !data?.checkout_url) { toast("Payment failed to initialize", "error"); setLoading(false); placedRef.current = false; return; }
      payRef = data.reference;
      window.open(data.checkout_url, "_blank");
      toast("Complete payment in the new tab", "info");
    }

    const orderNum = "NX-" + Date.now().toString(36).toUpperCase();
    const { data: order, error } = await supabase.from("orders").insert({
      order_number: orderNum,
      student_id: user.id,
      restaurant_id: restaurantId,
      total_amount: total,
      delivery_fee: fee,
      delivery_address: address,
      payment_method: pay,
      payment_reference: payRef,
      status: "Pending",
    }).select().single();

    if (error) { toast("Failed to place order: " + error.message, "error"); setLoading(false); placedRef.current = false; return; }

    const items = cart.map((c: any) => ({
      order_id: order.id,
      menu_item_id: c.id,
      name: c.name,
      price: c.price,
      quantity: c.qty,
    }));
    await supabase.from("order_items").insert(items);

    if (pay === "wallet") {
      const { data: deductResult } = await supabase.rpc("deduct_wallet", { _user_id: user.id, _amount: total, _label: `NexChow ${orderNum}`, _icon: "🍽️" });
      const dr = deductResult as any;
      if (!dr?.success) { toast(dr?.message || "Wallet deduction failed", "error"); setLoading(false); placedRef.current = false; return; }
      refreshWallet();
    }

    setLoading(false); setDone_(true); setCart([]);
    setTimeout(onDone, 2500);
  };

  if (done) return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
      <div style={{ fontSize: 80, animation: "fadeUp .4s ease" }}>🎉</div>
      <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 36, fontWeight: 700, color: G.gold, textAlign: "center" }}>Order Placed!</div>
      <div style={{ color: G.whiteDim, textAlign: "center", fontSize: 14, maxWidth: 260 }}>Your food is being prepared. Estimated delivery: 25 minutes.</div>
    </div>
  );

  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 18, animation: "fadeUp .4s ease", maxWidth: 800, margin: "0 auto", width: "100%", paddingBottom: 100 }}>
      <button onClick={onBack} style={{ ...btn("ghost", { width: "fit-content", padding: "8px 16px", fontSize: 13 }) }}>← Back</button>
      <PHeader title="Checkout" sub="Review your order" icon="🛒" />
      <div style={card()}>
        <STitle>Order Summary</STitle>
        <div style={{ marginTop: 12 }}>
          {cart.map((item: any) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${G.b5}` }}>
              <span style={{ color: G.white, fontSize: 14 }}>{item.name} x{item.qty}</span>
              <span style={{ color: G.gold, fontFamily: "'DM Mono'", fontSize: 14 }}>₦{(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${G.b5}` }}>
            <span style={{ color: G.whiteDim, fontSize: 13 }}>Delivery fee</span>
            <span style={{ color: G.whiteDim, fontFamily: "'DM Mono'", fontSize: 13 }}>₦{fee}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12 }}>
            <span style={{ fontWeight: 700, color: G.white }}>Total</span>
            <span style={{ fontWeight: 700, color: G.gold, fontFamily: "'DM Mono'", fontSize: 18 }}>₦{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div style={card()}>
        <STitle>Delivery Address</STitle>
        <input style={{ ...inp({ marginTop: 12 }) }} value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter your delivery address" />
      </div>
      <div style={card()}>
        <STitle>Payment</STitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {[{ id: "wallet", label: "NexGo Wallet", sub: `Balance: ₦${wallet.toLocaleString()}`, icon: "💳" }, { id: "transfer", label: "Bank Transfer", sub: "Pay via bank app", icon: "🏦" }].map((m: any) => (
            <div key={m.id} onClick={() => setPay(m.id)} style={{ padding: 14, borderRadius: 10, border: `2px solid ${pay === m.id ? G.gold : G.b5}`, background: pay === m.id ? G.goldGlow : G.b4, cursor: "pointer", display: "flex", gap: 12, alignItems: "center", transition: "all .2s" }}>
              <span style={{ fontSize: 24 }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: G.white, fontSize: 14 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: G.whiteDim }}>{m.sub}</div>
              </div>
              {pay === m.id && <span style={{ color: G.gold, fontSize: 20 }}>✓</span>}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "fixed", bottom: 82, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 500, zIndex: 101 }}>
        <button onClick={place} disabled={loading} style={{ ...btn("gold", { width: "100%", padding: "16px", borderRadius: 14, fontSize: 15, opacity: loading ? .7 : 1, boxShadow: `0 8px 24px rgba(201,168,76,0.35)` }) }}>
          {loading ? <><Spinner /> Placing…</> : `Place Order · ₦${total.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
}
