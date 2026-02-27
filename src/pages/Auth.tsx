import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { G, btn, card, inp } from "@/lib/nexgo-theme";
import { Lbl, Spinner } from "@/components/nexgo/SharedUI";
import { toast } from "@/components/nexgo/ToastContainer";
import NEXGO_LOGO from "@/assets/nexgo-logo.png";

export function Auth() {
  const { signIn, signUp } = useAuth();
  const [step, setStep] = useState("login");
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const RolePicker = ({ roles }: any) => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${roles.length},1fr)`, gap: 8 }}>
      {roles.map(({ r, ic }: any) => (
        <button key={r} onClick={() => setRole(r)} style={{ padding: "10px 8px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1.5px solid ${role === r ? G.gold : G.b5}`, background: role === r ? G.goldGlow : G.b4, color: role === r ? G.gold : G.whiteDim, cursor: "pointer", textTransform: "capitalize", transition: "all .2s" }}>{ic} {r}</button>
      ))}
    </div>
  );

  const handleLogin = async () => {
    if (!email || !password) { setErrorMsg("Please fill in all fields"); return; }
    setLoading(true); setErrorMsg("");
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) { setErrorMsg(error.message); return; }
  };

  const handleRegister = async () => {
    if (!email || !password || !name) { setErrorMsg("Please fill in all fields"); return; }
    setLoading(true); setErrorMsg("");
    const { error } = await signUp(email, password, name, role);
    setLoading(false);
    if (error) { setErrorMsg(error.message); return; }
    toast("Check your email to confirm your account!", "success");
    setStep("login");
  };

  const handleForgotPassword = async () => {
    if (!email) { setErrorMsg("Enter your email first"); return; }
    setLoading(true); setErrorMsg("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { setErrorMsg(error.message); return; }
    toast("Check your email for a password reset link!", "success");
    setStep("login");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: G.black, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle,${G.goldGlow} 0%,transparent 70%)`, top: -150, right: -150, pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: `radial-gradient(circle,rgba(201,168,76,0.07) 0%,transparent 70%)`, bottom: -100, left: -100, pointerEvents: "none" }} />
      <div style={{ width: "100%", maxWidth: 420, animation: "fadeUp .5s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 36, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <img src={NEXGO_LOGO} alt="NexGo" style={{ width: 200, objectFit: "contain", filter: "drop-shadow(0 0 20px rgba(201,168,76,0.4))" }} />
          <div style={{ color: G.whiteDim, fontSize: 13, marginTop: 2 }}>
            {step === "login" ? "Welcome back, campus legend" : step === "forgot" ? "Reset your password" : "Join the campus revolution"}
          </div>
        </div>
        <div style={card({ border: `1px solid ${G.b5}`, padding: 24 })}>
          {errorMsg && <div style={{ background: `${G.danger}22`, border: `1px solid ${G.danger}`, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: G.danger }}>{errorMsg}</div>}
          {step === "login" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Lbl>Email</Lbl>
              <input style={inp()} placeholder="you@university.edu.ng" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              <Lbl>Password</Lbl>
              <input style={inp()} placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} />
              <button style={{ ...btn("gold"), width: "100%", padding: "14px", marginTop: 6 }} onClick={handleLogin} disabled={loading}>
                {loading ? <Spinner /> : "Sign In →"}
              </button>
              <div style={{ textAlign: "center", fontSize: 13, color: G.whiteDim }}>
                <span onClick={() => { setStep("forgot"); setErrorMsg(""); }} style={{ color: G.gold, cursor: "pointer", fontWeight: 600 }}>Forgot password?</span>
              </div>
              <div style={{ textAlign: "center", fontSize: 13, color: G.whiteDim }}>No account? <span onClick={() => { setStep("register"); setErrorMsg(""); }} style={{ color: G.gold, cursor: "pointer", fontWeight: 600 }}>Sign up</span></div>
            </div>
          )}
          {step === "forgot" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Lbl>Email</Lbl>
              <input style={inp()} placeholder="you@university.edu.ng" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              <button style={{ ...btn("gold"), width: "100%", padding: "14px", marginTop: 6 }} onClick={handleForgotPassword} disabled={loading}>
                {loading ? <Spinner /> : "Send Reset Link →"}
              </button>
              <div style={{ textAlign: "center", fontSize: 13, color: G.whiteDim }}>
                Remember? <span onClick={() => { setStep("login"); setErrorMsg(""); }} style={{ color: G.gold, cursor: "pointer", fontWeight: 600 }}>Sign in</span>
              </div>
            </div>
          )}
          {step === "register" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Lbl>Full Name</Lbl>
              <input style={inp()} placeholder="Chioma Adaeze" value={name} onChange={e => setName(e.target.value)} />
              <Lbl>Email</Lbl>
              <input style={inp()} placeholder="you@university.edu.ng" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              <Lbl>Password</Lbl>
              <input style={inp()} placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} />
              <Lbl>Register as</Lbl>
              <RolePicker roles={[{ r: "student", ic: "🎓" }, { r: "vendor", ic: "🍽️" }, { r: "rider", ic: "🏍️" }]} />
              <button style={{ ...btn("gold"), width: "100%", padding: "14px" }} onClick={handleRegister} disabled={loading}>
                {loading ? <Spinner /> : "Create Account →"}
              </button>
              <div style={{ textAlign: "center", fontSize: 13, color: G.whiteDim }}>Have account? <span onClick={() => { setStep("login"); setErrorMsg(""); }} style={{ color: G.gold, cursor: "pointer", fontWeight: 600 }}>Sign in</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
