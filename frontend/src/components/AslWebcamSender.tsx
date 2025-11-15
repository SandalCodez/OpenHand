import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAslWs, type AslMode } from "../lib/useAslWs";

type Props = {
    wsUrl?: string;
    fps?: number;
    mode?: AslMode;
    showOverlay?: boolean;
};

const AslWebcamSender: React.FC<Props> = ({
                                              wsUrl = "ws://localhost:8001/ws",
                                              fps = 10,
                                              mode = "letters",
                                              showOverlay = true
                                          }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamingRef = useRef<boolean>(false);
    const [curMode, setCurMode] = useState<AslMode>(mode);

    const { connected, result, sendFrame, setMode } = useAslWs(wsUrl, curMode);

    useEffect(() => {
        let active = true;
        (async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 }, audio: false });
            if (!active) {
                stream.getTracks().forEach(t => t.stop());
                return;
            }
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                streamingRef.current = true;
            }
        })();
        return () => {
            active = false;
            if (videoRef.current?.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(t => t.stop());
            }
            streamingRef.current = false;
        };
    }, []);

    useEffect(() => {
        let raf = 0;
        const period = 1000 / fps;
        let last = 0;

        const tick = (ts: number) => {
            raf = requestAnimationFrame(tick);
            if (!streamingRef.current || !connected) return;
            if (ts - last < period) return;
            last = ts;

            const v = videoRef.current;
            const c = canvasRef.current;
            if (!v || !c) return;

            const ctx = c.getContext("2d");
            if (!ctx) return;

            c.width = 320;
            c.height = Math.round((v.videoHeight / v.videoWidth) * 320) || 240;
            ctx.drawImage(v, 0, 0, c.width, c.height);

            // encode JPEG at medium quality
            const dataUrl = c.toDataURL("image/jpeg", 0.6); // "data:image/jpeg;base64,...."
            const idx = dataUrl.indexOf("base64,");
            const b64 = idx > 0 ? dataUrl.slice(idx + 7) : "";

            if (b64) sendFrame(b64);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [fps, connected, sendFrame]);

    const changeMode = useCallback((m: AslMode) => {
        setCurMode(m);
        setMode(m);
    }, [setMode]);

    return (
        <div className="w-100 d-flex flex-column align-items-center">
        <video ref={videoRef} className="rounded-3" style={{ maxWidth: "100%", transform: "scaleX(-1)" }} playsInline muted />
    <canvas ref={canvasRef} style={{ display: "none" }} />

    {showOverlay && (
        <div className="text-light mt-3" style={{ width: "100%", maxWidth: 420 }}>
        <div className="d-flex justify-content-between align-items-center">
            <div>WS: {connected ? "connected" : "connecting..."}</div>
    <div className="btn-group btn-group-sm">
    <button className={`btn ${curMode==="letters"?"btn-light":"btn-outline-light"}`} onClick={() => changeMode("letters")}>Letters</button>
    <button className={`btn ${curMode==="numbers"?"btn-light":"btn-outline-light"}`} onClick={() => changeMode("numbers")}>Numbers</button>
    <button className={`btn ${curMode==="auto"?"btn-light":"btn-outline-light"}`} onClick={() => changeMode("auto")}>Auto</button>
    </div>
    </div>

    <div className="mt-2 p-2 border rounded-3">
        <div><strong>Top:</strong> {result?.top ?? "—"} {result?.conf != null ? `(${Math.round((result.conf||0)*100)}%)` : ""}</div>
    <div className="mt-1">
        {result?.probs?.map((it, idx) => (
            <div key={idx}>{idx+1}. {it.name}: {(it.p*100).toFixed(1)}%</div>
    ))}
        </div>
        <div className="mt-1 small text-secondary">
        Feats: {result?.n_features ?? 0} • Motion: {result?.motion?.toFixed(4) ?? "—"} • Hand conf: {result?.hand_conf?.toFixed(2) ?? "—"}
        </div>
        </div>
        </div>
    )}
    </div>
);
};

export default AslWebcamSender;