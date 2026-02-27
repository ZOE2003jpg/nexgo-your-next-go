import { useState, useEffect } from "react";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import { G, injectStyles } from "@/lib/nexgo-theme";
import { Spinner } from "@/components/nexgo/SharedUI";
import { ToastContainer } from "@/components/nexgo/ToastContainer";
import { BottomNav } from "@/components/nexgo/BottomNav";
import { Splash } from "@/components/nexgo/Splash";
import { Auth } from "@/pages/Auth";
import { StudentHome } from "@/pages/student/StudentHome";
import { NexChow } from "@/pages/student/NexChow";
import { RestaurantDetail } from "@/pages/student/RestaurantDetail";
import { Checkout } from "@/pages/student/Checkout";
import { NexDispatch } from "@/pages/student/NexDispatch";
import { NexTrip } from "@/pages/student/NexTrip";
import { WalletScreen } from "@/pages/student/WalletScreen";
import { ProfileScreen } from "@/pages/shared/ProfileScreen";
import { ChatScreen } from "@/pages/shared/ChatScreen";
import { VendorApp } from "@/pages/vendor/VendorApp";
import { RiderApp } from "@/pages/rider/RiderApp";
import { AdminApp } from "@/pages/admin/AdminApp";

function NexGoInner() {
  useEffect(() => { injectStyles(); }, []);
  const { user, profile, role: authRole, walletBalance, loading: authLoading, signOut } = useAuth();
  const [screen, setScreen] = useState("splash");
  const [cart, setCart] = useState<any[]>([]);
  const [tab, setTab] = useState("home");

  useEffect(() => {
    if (authLoading) return;
    if (user && authRole) {
      setTab({ student: "home", vendor: "dashboard", rider: "rdashboard", admin: "adashboard" }[authRole] || "home");
      setScreen("app");
    } else if (!user && screen === "app") {
      setScreen("auth");
    }
  }, [user, authRole, authLoading]);

  const handleLogout = async () => {
    await signOut();
    setScreen("auth");
    setTab("home");
    setCart([]);
  };

  const role = authRole || "student";

  const StudentContent = () => {
    const [restaurant, setRestaurant] = useState<any>(null);
    const [atCheckout, setAtCheckout] = useState(false);
    if (tab === "chow") {
      if (atCheckout && restaurant) return <Checkout cart={cart} setCart={setCart} wallet={walletBalance} onBack={() => setAtCheckout(false)} onDone={() => { setAtCheckout(false); setTab("home"); }} restaurantId={restaurant.id} />;
      if (restaurant) return <RestaurantDetail r={restaurant} cart={cart} setCart={setCart} onBack={() => setRestaurant(null)} onCheckout={() => setAtCheckout(true)} />;
      return <NexChow onSelect={setRestaurant} cart={cart} onCheckout={() => setAtCheckout(true)} />;
    }
    if (tab === "dispatch") return <NexDispatch />;
    if (tab === "trip") return <NexTrip wallet={walletBalance} />;
    if (tab === "wallet") return <WalletScreen wallet={walletBalance} />;
    if (tab === "profile") return <ProfileScreen onLogout={handleLogout} />;
    if (tab === "chat") return <ChatScreen />;
    return <StudentHome wallet={walletBalance} setTab={setTab} profile={profile} />;
  };

  const AppContent = (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: G.black, position: "relative" }}>
      <ToastContainer />
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>
        {role === "student" && <StudentContent />}
        {role === "vendor" && <VendorApp tab={tab} onLogout={handleLogout} />}
        {role === "rider" && <RiderApp tab={tab} onLogout={handleLogout} />}
        {role === "admin" && <AdminApp tab={tab} onLogout={handleLogout} />}
      </div>
      <BottomNav role={role} tab={tab} setTab={setTab} cartCount={cart.reduce((a: number, c: any) => a + c.qty, 0)} />
    </div>
  );

  if (screen === "splash") {
    return <Splash onDone={() => setScreen(user ? "app" : "auth")} />;
  }

  if (screen === "auth") {
    if (authLoading) {
      return <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: G.black }}>
        <Spinner size={32} color={G.gold} />
      </div>;
    }
    return <Auth />;
  }

  return AppContent;
}

export default function App() {
  return (
    <AuthProvider>
      <NexGoInner />
    </AuthProvider>
  );
}
