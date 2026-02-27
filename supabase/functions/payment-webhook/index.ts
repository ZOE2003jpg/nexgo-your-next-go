import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const event = body.event;
    const data = body.data;

    if (event !== "charge.success") {
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reference = data?.reference;
    const amount = data?.amount;
    const userId = data?.metadata?.user_id;

    if (!reference || !amount || !userId) {
      return new Response(JSON.stringify({ error: "Missing data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Idempotency check - look for existing transaction with this reference
    const { data: existing } = await supabase
      .from("wallet_transactions")
      .select("id")
      .eq("label", `KoraPay ${reference}`)
      .limit(1);

    if (existing && existing.length > 0) {
      // Already processed - idempotent
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Credit wallet
    const { data: wallet } = await supabase
      .from("wallets")
      .select("id, balance")
      .eq("user_id", userId)
      .single();

    if (!wallet) {
      console.error("Wallet not found for user:", userId);
      return new Response(JSON.stringify({ error: "Wallet not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase
      .from("wallets")
      .update({ balance: wallet.balance + amount })
      .eq("id", wallet.id);

    await supabase.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      user_id: userId,
      amount: amount,
      label: `KoraPay ${reference}`,
      icon: "💳",
    });

    return new Response(JSON.stringify({ received: true, credited: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
