import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { G, btn, card, inp } from "@/lib/nexgo-theme";
import { STitle, Lbl, Spinner } from "@/components/nexgo/SharedUI";
import { toast } from "@/components/nexgo/ToastContainer";

export function ProfileScreen({ onLogout }: any) {
  const { user, profile, role, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async () => {
    if (!user || !editName.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: editName.trim() }).eq("id", user.id);
    setSaving(false);
    if (error) { toast("Failed to update profile", "error"); return; }
    await refreshProfile();
    toast("Profile updated!", "success");
    setEditing(false);
  };

  const changePassword = async () => {
    if (!newPw || newPw.length < 6) { toast("Password must be at least 6 characters", "error"); return; }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSavingPw(false);
    if (error) { toast(error.message, "error"); return; }
    toast("Password updated!", "success");
    setChangingPw(false);
    setOldPw(""); setNewPw("");
  };

  return (
    <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp .4s ease", maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <div style={{ textAlign: "center", paddingTop: 10 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg,${G.goldDark},${G.gold})`, margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 700, color: G.black }}>{profile?.full_name?.[0] || "?"}</div>
        <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 28, fontWeight: 700, color: G.white }}>{profile?.full_name}</div>
        <div style={{ color: G.gold, fontSize: 12, marginTop: 4, fontFamily: "'DM Mono'", textTransform: "capitalize" }}>{role}</div>
        <div style={{ color: G.whiteDim, fontSize: 12, marginTop: 2 }}>{profile?.email || user?.email}</div>
      </div>

      {/* Edit Profile */}
      <div style={card()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <STitle>Edit Profile</STitle>
          {!editing && <span onClick={() => { setEditing(true); setEditName(profile?.full_name || ""); }} style={{ color: G.gold, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Edit ✏️</span>}
        </div>
        {editing ? (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
            <Lbl>Full Name</Lbl>
            <input style={inp()} value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your name" />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={saveProfile} disabled={saving} style={{ ...btn("gold", { flex: 1, padding: "12px" }) }}>
                {saving ? <Spinner size={14} /> : "Save"}
              </button>
              <button onClick={() => setEditing(false)} style={{ ...btn("ghost", { padding: "12px 16px" }) }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 12, fontSize: 14, color: G.whiteDim }}>{profile?.full_name}</div>
        )}
      </div>

      {/* Change Password */}
      <div style={card()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <STitle>🔒 Security</STitle>
          {!changingPw && <span onClick={() => setChangingPw(true)} style={{ color: G.gold, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Change Password</span>}
        </div>
        {changingPw && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
            <Lbl>New Password</Lbl>
            <input style={inp()} type="password" placeholder="Min 6 characters" value={newPw} onChange={e => setNewPw(e.target.value)} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={changePassword} disabled={savingPw} style={{ ...btn("gold", { flex: 1, padding: "12px" }) }}>
                {savingPw ? <Spinner size={14} /> : "Update Password"}
              </button>
              <button onClick={() => { setChangingPw(false); setNewPw(""); }} style={{ ...btn("ghost", { padding: "12px 16px" }) }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      <button onClick={onLogout} style={{ ...btn("ghost", { width: "100%", padding: "14px", color: G.danger, border: `1px solid ${G.danger}40` }) }}>Sign Out</button>
    </div>
  );
}
