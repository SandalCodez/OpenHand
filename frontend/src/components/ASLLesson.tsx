import React, { useEffect, useRef, useState } from "react";
import HandLandmarks from "./handlandmarks/HandLandmarks";

type WsMsg = {
  ready?: boolean;
  done?: boolean;
  target?: string;
  predicted_label?: string;
  target_confidence?: number;
  success?: boolean;
  frames_seen?: number;
  frames_left?: number;
  error?: string;
};


// at the very top of ASLLesson.tsx
const WS_URL = "ws://127.0.0.1:8000/api/ws/predict";
(window as any).WS_URL = WS_URL;
console.log("WS_URL ->", WS_URL);

// throw if URL isn’t what we expect (forces a red error on screen)
if (!WS_URL.includes("127.0.0.1:8000/api/ws/predict")) {
  throw new Error("ASLLesson is using the wrong WS_URL: " + WS_URL);
}

const LETTERS = "ABCDEFGHIKLMNOPQRSTUVWXY".split("");
const NUMS = Array.from("0123456789");

export default function ASLLesson() {
  const [target, setTarget] = useState<string>("A");
  const [status, setStatus] = useState<"idle" | "connecting" | "open" | "error" | "closed">("idle");
  const [msg, setMsg] = useState<WsMsg | null>(null);
  const [debug, setDebug] = useState<{ framesSent: number; hands: number; wsOpen: boolean }>({
    framesSent: 0,
    hands: 0,
    wsOpen: false,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const startedRef = useRef<boolean>(false);

  // Start the WebSocket exactly once (guard StrictMode double-mount)
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    setStatus("connecting");
    setMsg(null);

    ws.onopen = () => {
      setStatus("open");
      // Send initial target
      ws.send(JSON.stringify({ target_label: target, hands: [] }));
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as WsMsg;
        setMsg(data);
        if (data.done) {
          // optional: keep socket open for dev; or close if you want
          // ws.close();
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => setStatus("error");
    ws.onclose = () => setStatus("closed");

    // Do NOT close on cleanup here; we want a stable session in dev.
    // If you want to close when the route/page unmounts, add a second effect.
  }, []);

  // When target changes, notify the already-open socket
  useEffect(() => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ target_label: target }));
    }
  }, [target]);

  return (
    <div style={{ display: "grid", gap: 12, color: "#eee" }}>
      {/* Top control row */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label>Target:</label>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          style={{ padding: "4px 8px", borderRadius: 6 }}
        >
          {LETTERS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          {NUMS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <span>
          WS: <b>{status}</b>
        </span>
        <span>
          sent: <b>{debug.framesSent}</b> | hands: {debug.hands} | wsOpen:{" "}
          {String(debug.wsOpen)}
        </span>
      </div>

      {/* Live server info */}
      <div
        style={{
          padding: 12,
          border: "1px solid #555",
          borderRadius: 8,
          fontFamily: "monospace",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div>predicted: {msg?.predicted_label ?? "-"}</div>
        <div>target_conf: {(msg?.target_confidence ?? 0).toFixed(3)}</div>
        <div>success: {String(msg?.success ?? false)}</div>
        <div>
          frames_seen: {msg?.frames_seen ?? 0} / left: {msg?.frames_left ?? "-"}
        </div>
        {msg?.error && <div style={{ color: "#ff7676" }}>error: {msg.error}</div>}
      </div>
      {"comment"}
            {"comment"}
            {"comment"}

      {/* Camera + landmarks (streams frames to WS) */}
      <HandLandmarks wsRef={wsRef} onDebug={setDebug} />
      <div style={{position:'fixed',top:8,right:8,background:'#222',color:'#0f0',padding:6,borderRadius:6,zIndex:9999}}>
  WS: {WS_URL}
</div>
    </div>
  );
}
