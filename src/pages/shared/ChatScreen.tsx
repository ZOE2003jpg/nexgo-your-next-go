import { useState, useEffect, useRef } from "react";
import { G } from "@/lib/nexgo-theme";

export function ChatScreen() {
  const [msgs, setMsgs] = useState([
    { id: 1, from: "bot", text: "Hello! 👋 How can I help you today?", time: "Just now" },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  const send = () => {
    if (!input.trim()) return;
    setMsgs((p: any) => [...p, { id: Date.now(), from: "user", text: input, time: "Now" }]);
    setInput("");
    setTimeout(() => { setMsgs((p: any) => [...p, { id: Date.now() + 1, from: "bot", text: "Thanks for reaching out! Our team will get back to you shortly. 🙏", time: "Now" }]); }, 1000);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 80px)", maxWidth: 800, margin: "0 auto", width: "100%" }}>
      <div style={{ padding: "16px", borderBottom: `1px solid ${G.b4}`, display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${G.goldDark},${G.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💬</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>NexGo Support</div>
          <div style={{ fontSize: 11, color: G.gold, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: G.gold, display: "inline-block", animation: "pulse 2s ease infinite" }} />Online
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {msgs.map((m: any) => (
          <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: m.from === "user" ? "flex-end" : "flex-start", maxWidth: "80%", alignSelf: m.from === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ padding: "10px 14px", borderRadius: m.from === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.from === "user" ? G.gold : G.b4, color: m.from === "user" ? G.black : G.white, fontSize: 14, lineHeight: 1.5, fontWeight: m.from === "user" ? 500 : 400 }}>{m.text}</div>
            <div style={{ fontSize: 10, color: G.whiteDim, marginTop: 4, padding: "0 4px" }}>{m.time}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${G.b4}`, display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Type a message..." style={{ flex: 1, background: G.b4, border: `1px solid ${G.b5}`, borderRadius: 22, padding: "11px 16px", color: G.white, fontSize: 14, outline: "none" }} />
        <button onClick={send} style={{ width: 42, height: 42, borderRadius: "50%", background: G.gold, border: "none", color: G.black, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>➤</button>
      </div>
    </div>
  );
}
