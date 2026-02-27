import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { G, btn, card, inp } from "@/lib/nexgo-theme";
import { STitle, PHeader, Spinner } from "@/components/nexgo/SharedUI";
import { toast } from "@/components/nexgo/ToastContainer";

export function WalletScreen({ wallet }: any) {
  const { user, profile, refreshWallet } = useAuth();
  const [amt, setAmt] = useState("");
  const [txns, setTxns] = useState<any[]>([]);
  const [fundMethod, setFundMethod] = useState<"wallet" | "korapay">("wallet");
  const [fundingKora, setFundingKora] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("wallet_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => { if (data) setTxns(data); });
  }, [user, wallet]);

  const fund = async () => {
    if (!user) return;
    const v = parseInt(amt);
    if (isNaN(v) || v <= 0) { toast("Enter a valid amount", "error"); return; }

    if (fundMethod === "korapay") {
      setFundingKora(true);
      const { data, error } = await supabase.functions.invoke("initialize-payment", { body: { amount: v } });
      setFundingKora(false);
      if (error || !data?.checkout_url) { toast("Payment initialization failed", "error"); return; }
      window.open(data.checkout_url, "_blank");
      toast("Complete payment in the new tab", "info");
      return;
    }

    const { data: topupResult } = await supabase.rpc("topup_wallet", { _user_id: user.id, _amount: v });
    const tr = topupResult as any;
    if (!tr?.success) { toast(tr?.message || "Top-up failed", "error"); return; }
    refreshWallet();
    setAmt("");
    toast(`₦${v.toLocaleString()} added!`, "success");
  };

  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp .4s ease", maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <PHeader title="NexWallet" sub="Your campus money" icon="💳" />
      <div style={{ background: `linear-gradient(135deg,${G.goldDark},${G.gold})`, borderRadius: 22, padding: "32px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <div style={{ fontSize: 12, color: G.black, opacity: .7, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>Total Balance</div>
        <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 52, fontWeight: 700, color: G.black, lineHeight: 1 }}>₦{wallet.toLocaleString()}</div>
        <div style={{ fontSize: 13, color: G.black, opacity: .6, marginTop: 8 }}>{profile?.full_name}</div>
      </div>
      <div style={card()}>
        <STitle>Fund Wallet</STitle>
        <div style={{ display: "flex", gap: 8, marginTop: 12, marginBottom: 12, flexWrap: "wrap" }}>
          {[500, 1000, 2000, 5000].map((v: number) => (
            <button key={v} onClick={() => setAmt(String(v))} style={{ padding: "8px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, background: amt === String(v) ? G.goldGlow : G.b4, border: `1px solid ${amt === String(v) ? G.gold : G.b5}`, color: amt === String(v) ? G.gold : G.whiteDim, cursor: "pointer", transition: "all .2s" }}>₦{v.toLocaleString()}</button>
          ))}
        </div>
        <input style={{ ...inp({ marginBottom: 12 }) }} type="number" placeholder="Enter amount…" value={amt} onChange={e => setAmt(e.target.value)} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {[{ id: "wallet" as const, label: "Demo Top-up", sub: "Instant (dev mode)", icon: "💳" }, { id: "korapay" as const, label: "KoraPay", sub: "Pay with card/bank", icon: "🏦" }].map(m => (
            <div key={m.id} onClick={() => setFundMethod(m.id)} style={{ padding: 12, borderRadius: 10, border: `2px solid ${fundMethod === m.id ? G.gold : G.b5}`, background: fundMethod === m.id ? G.goldGlow : G.b4, cursor: "pointer", display: "flex", gap: 12, alignItems: "center", transition: "all .2s" }}>
              <span style={{ fontSize: 20 }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: G.white, fontSize: 13 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: G.whiteDim }}>{m.sub}</div>
              </div>
              {fundMethod === m.id && <span style={{ color: G.gold, fontSize: 18 }}>✓</span>}
            </div>
          ))}
        </div>
        <button onClick={fund} disabled={fundingKora} style={{ ...btn("gold", { width: "100%", padding: "13px", opacity: fundingKora ? .6 : 1 }) }}>
          {fundingKora ? <><Spinner /> Connecting…</> : fundMethod === "korapay" ? "Pay with KoraPay →" : "Fund Wallet →"}
        </button>
      </div>
      <div>
        <STitle>Transactions</STitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {txns.length === 0 && <div style={{ ...card(), textAlign: "center", color: G.whiteDim }}>No transactions yet</div>}
          {txns.map((tx: any) => (
            <div key={tx.id} style={card({ display: "flex", justifyContent: "space-between", alignItems: "center" })}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: G.b4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{tx.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: G.white }}>{tx.label}</div>
                  <div style={{ fontSize: 11, color: G.whiteDim }}>{new Date(tx.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontFamily: "'DM Mono'", fontSize: 14, color: tx.amount > 0 ? G.success : G.danger }}>{tx.amount > 0 ? "+" : ""}₦{Math.abs(tx.amount).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
