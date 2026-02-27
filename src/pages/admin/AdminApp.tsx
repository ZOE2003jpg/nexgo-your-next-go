import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { G, card } from "@/lib/nexgo-theme";
import { STitle, PHeader, Badge } from "@/components/nexgo/SharedUI";
import { ProfileScreen } from "@/pages/shared/ProfileScreen";
import { inp } from "@/lib/nexgo-theme";

export function AdminApp({ tab, onLogout }: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("profiles").select("id, full_name, created_at, avatar_url").order("created_at", { ascending: false })
      .then(async ({ data: profiles }) => {
        if (!profiles) return;
        const enriched = await Promise.all(profiles.map(async (p: any) => {
          const { data: roleData } = await supabase.rpc("get_user_role", { _user_id: p.id });
          return { ...p, role: roleData || "student" };
        }));
        setUsers(enriched);
      });
    supabase.from("orders").select("id, order_number, total_amount, status, created_at").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => { if (data) setOrders(data); });
    supabase.from("restaurants").select("*").then(({ data }) => { if (data) setRestaurants(data); });
  }, []);

  if (tab === "users") return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 14, animation: "fadeUp .4s ease", maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <PHeader title="Users" sub="Manage all users" icon="👥" />
      <input style={inp()} placeholder="🔍  Search users…" value={search} onChange={e => setSearch(e.target.value)} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {users.filter((u: any) => u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.role?.toLowerCase().includes(search.toLowerCase())).map((u: any) => (
          <div key={u.id} style={card()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg,${G.goldDark},${G.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: G.black }}>{u.full_name?.[0] || "?"}</div>
                <div>
                  <div style={{ fontWeight: 600, color: G.white, fontSize: 14 }}>{u.full_name}</div>
                  <div style={{ fontSize: 11, color: G.whiteDim, textTransform: "capitalize" }}>{u.role} · Joined {new Date(u.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (tab === "analytics") return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp .4s ease", maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <PHeader title="Analytics" sub="Platform insights" icon="📈" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[{ l: "Total Users", v: String(users.length), ic: "👥" }, { l: "Total Orders", v: String(orders.length), ic: "📦" }, { l: "Restaurants", v: String(restaurants.length), ic: "🍽️" }, { l: "Revenue", v: `₦${orders.reduce((a: number, o: any) => a + (o.total_amount || 0), 0).toLocaleString()}`, ic: "💰" }].map((s: any) => (
          <div key={s.l} style={card()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 12, color: G.whiteDim, marginBottom: 6 }}>{s.l}</div>
                <div style={{ fontFamily: "'DM Mono'", fontSize: 22, fontWeight: 700, color: G.gold }}>{s.v}</div>
              </div>
              <span style={{ fontSize: 24 }}>{s.ic}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (tab === "profile") return <ProfileScreen onLogout={onLogout} />;

  // Admin Dashboard
  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp .4s ease", maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <PHeader title="Admin Panel" sub="NexGo operations overview" icon="⚙️" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[{ label: "Total Users", value: String(users.length), icon: "👥" }, { label: "Orders", value: String(orders.length), icon: "📦" }, { label: "Restaurants", value: String(restaurants.length), icon: "🍽️" }, { label: "Revenue", value: `₦${orders.reduce((a: number, o: any) => a + (o.total_amount || 0), 0).toLocaleString()}`, icon: "💰" }].map((s: any) => (
          <div key={s.label} style={card()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 12, color: G.whiteDim, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontFamily: "'DM Mono'", fontSize: 22, fontWeight: 700, color: G.gold }}>{s.value}</div>
              </div>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={card()}>
        <STitle>Recent Users</STitle>
        {users.slice(0, 5).map((u: any, i: number, arr: any[]) => (
          <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < arr.length - 1 ? `1px solid ${G.b5}` : "none" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${G.goldDark},${G.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: G.black }}>{u.full_name?.[0] || "?"}</div>
              <div>
                <div style={{ fontWeight: 600, color: G.white, fontSize: 14 }}>{u.full_name}</div>
                <div style={{ fontSize: 11, color: G.whiteDim, textTransform: "capitalize" }}>{u.role} · {new Date(u.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
