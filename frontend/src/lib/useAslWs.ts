import { useCallback, useEffect, useRef, useState } from "react";
import { getGestureName } from "./gestureMap";

export type AslMode = "letters" | "numbers" | "auto";
export type AslModel = "letters" | "gestures";

export interface AslResult {
    top: string | null;
    conf: number | null;
    probs: { name: string; p: number }[];
    motion?: number | null;
    hand_conf?: number | null;
    n_features: number;
    mode: AslMode;
    model: AslModel;
}

export function useAslWs(
    wsUrl: string,
    initialMode: AslMode = "numbers",
    initialModel: AslModel = "gestures"
) {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<number | null>(null);

    const [connected, setConnected] = useState(false);
    const [mode, setModeState] = useState<AslMode>(initialMode);
    const [model, setModelState] = useState<AslModel>(initialModel);
    const [result, setResult] = useState<AslResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const sendJson = useCallback((obj: any) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(obj));
        }
    }, []);

    const setMode = useCallback(
        (m: AslMode) => {
            setModeState(m);
            sendJson({ mode: m });
        },
        [sendJson]
    );

    const setModel = useCallback(
        (m: AslModel) => {
            setModelState(m);
            sendJson({ model: m });
        },
        [sendJson]
    );

    const setTarget = useCallback(
        (t: string | null) => {
            sendJson({ target: t });
        },
        [sendJson]
    );

    useEffect(() => {
        let shouldReconnect = true;

        // Normalise base URL (strip any existing query params)
        const base = wsUrl.split("?")[0];

        const connect = () => {
            try {
                const url = `${base}?mode=${mode}&model=${model}`;
                console.log("Connecting to WebSocket:", url);

                const ws = new WebSocket(url);
                wsRef.current = ws;

                ws.onopen = () => {
                    // Ignore if this socket is no longer the current one
                    if (ws !== wsRef.current) return;
                    console.log("WebSocket connected");
                    setConnected(true);
                    setError(null);
                };

                ws.onclose = (event) => {
                    // Ignore stale sockets
                    if (ws !== wsRef.current) return;
                    console.log("WebSocket closed:", event.code, event.reason || "");
                    setConnected(false);
                    wsRef.current = null;

                    if (shouldReconnect) {
                        console.log("Attempting to reconnect in 2 seconds...");
                        reconnectTimeoutRef.current = window.setTimeout(() => {
                            connect();
                        }, 2000);
                    }
                };

                ws.onerror = (event) => {
                    // Ignore stale sockets
                    if (ws !== wsRef.current) return;
                    console.error("WebSocket error:", event);
                    setError("Failed to connect to server. Is the backend running?");
                    setConnected(false);
                };

                ws.onmessage = (ev) => {
                    // Ignore stale sockets
                    if (ws !== wsRef.current) return;

                    try {
                        const data = JSON.parse(ev.data);

                        if (data.hello) {
                            console.log("Received hello from server:", data);
                            return;
                        }

                        if (data.error) {
                            console.error("Server error:", data.error);
                            setError(data.error);
                            return;
                        }

                        const currentModel: AslModel = data.model ?? model;

                        const mappedTop =
                            data.top && currentModel === "gestures"
                                ? getGestureName(data.top)
                                : data.top;

                        const mappedProbs =
                            Array.isArray(data.probs) && data.probs.length > 0
                                ? data.probs.map((p: { name: string; p: number }) => ({
                                    ...p,
                                    name:
                                        currentModel === "gestures"
                                            ? getGestureName(p.name)
                                            : p.name,
                                }))
                                : [];

                        setResult({
                            top: mappedTop ?? null,
                            conf: data.conf ?? null,
                            probs: mappedProbs,
                            motion: data.motion ?? null,
                            hand_conf: data.hand_conf ?? null,
                            n_features: data.n_features ?? 0,
                            mode: (data.mode as AslMode) ?? mode,
                            model: currentModel,
                        });
                    } catch (e) {
                        console.error("Failed to parse message:", e);
                    }
                };
            } catch (e) {
                console.error("Failed to create WebSocket:", e);
                setError("Failed to create WebSocket connection");
            }
        };

        connect();

        return () => {
            shouldReconnect = false;

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }

            // Close the *current* socket
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [wsUrl, mode, model]);

    const sendFrame = useCallback(
        (jpegBase64NoPrefix: string) => {
            sendJson({ frame_b64: jpegBase64NoPrefix });
        },
        [sendJson]
    );

    return { connected, result, sendFrame, mode, setMode, model, setModel, setTarget, error };
}
