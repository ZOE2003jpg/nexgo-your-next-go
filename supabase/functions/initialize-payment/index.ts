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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { amount } = await req.json();
    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reference = `NXW-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const koraKey = Deno.env.get("KORAPAY_SECRET_KEY");
    if (!koraKey) {
      return new Response(JSON.stringify({ error: "Payment not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user email - prefer auth email (always valid), fallback to profile
    let customerEmail = user.email;
    // KoraPay rejects non-standard TLDs like .test — use fallback
    if (!customerEmail || !customerEmail.includes("@") || customerEmail.endsWith(".test")) {
      customerEmail = `nexgo-user-${user.id.substring(0, 8)}@nexgo.app`;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const koraRes = await fetch("https://api.korapay.com/merchant/api/v1/charges/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${koraKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        redirect_url: `${req.headers.get("origin") || "https://nexgo.app"}`,
        currency: "NGN",
        reference,
        customer: {
          email: customerEmail,
          name: profile?.full_name || "NexGo User",
        },
        metadata: {
          user_id: user.id,
          type: "wallet_funding",
        },
      }),
    });

    const koraData = await koraRes.json();

    if (!koraRes.ok || !koraData.data?.checkout_url) {
      console.error("KoraPay error:", koraData);
      return new Response(
        JSON.stringify({ error: "Payment initialization failed", details: koraData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        checkout_url: koraData.data.checkout_url,
        reference,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
