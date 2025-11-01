import { useCallback, useEffect, useRef, useState } from "react";

export type AslMode = "letters" | "numbers" | "auto";
export interface AslResult {
    top: string | null;
    conf: number | null;
    probs: { name: string; p: number }[];
    motion?: number | null;
    hand_conf?: number | null;
    n_features: number;
    mode: AslMode;
}

export function useAslWs(wsUrl: string, initialMode: AslMode = "letters") {
    const wsRef = useRef<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);
    const [mode, setModeState] = useState<AslMode>(initialMode);
    const [result, setResult] = useState<AslResult | null>(null);

    const sendJson = useCallback((obj: any) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(obj));
        }
    }, []);

    const setMode = useCallback((m: AslMode) => {
        setModeState(m);
        sendJson({ mode: m });
    }, [sendJson]);

    useEffect(() => {
        const url = `${wsUrl}?mode=${mode}`;
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => setConnected(true);
        ws.onclose = () => setConnected(false);
        ws.onerror = () => setConnected(false);
        ws.onmessage = (ev) => {
            try {
                const data = JSON.parse(ev.data);
                if (data.hello) return; // initial hello
                setResult({
                    top: data.top ?? null,
                    conf: data.conf ?? null,
                    probs: Array.isArray(data.probs) ? data.probs : [],
                    motion: data.motion ?? null,
                    hand_conf: data.hand_conf ?? null,
                    n_features: data.n_features ?? 0,
                    mode: data.mode ?? mode,
                });
            } catch {}
        };

        return () => {
            ws.close();
            wsRef.current = null;
        };
    }, [wsUrl, mode]);

    const sendFrame = useCallback((jpegBase64NoPrefix: string) => {
        sendJson({ frame_b64: jpegBase64NoPrefix });
    }, [sendJson]);

    return { connected, result, sendFrame, mode, setMode };
}