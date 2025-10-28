// import React, { useEffect, useRef } from "react";
// import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
// import { Camera } from "@mediapipe/camera_utils";
// import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

// const HandLandmarks: React.FC = () => {
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   useEffect(() => {
//     const videoEl = videoRef.current!;
//     const canvasEl = canvasRef.current!;
//     const ctx = canvasEl.getContext("2d")!;

//     const hands = new Hands({
//       locateFile: (file) =>
//         `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
//     });

//     hands.setOptions({
//       maxNumHands: 1,
//       modelComplexity: 1,
//       minDetectionConfidence: 0.7,
//       minTrackingConfidence: 0.7,
//     });

//     hands.onResults((results) => {
//       // match canvas to the processed frame size
//       canvasEl.width = results.image.width;
//       canvasEl.height = results.image.height;

//       // clear & keep transparent background
//       ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

//       const handsLm = results.multiHandLandmarks ?? [];
//       for (const lm of handsLm) {
//         drawConnectors(ctx, lm, HAND_CONNECTIONS, {
//           color: "#45caffff",
//           lineWidth: 15,
//           radius: 10,
//         });
//         drawLandmarks(ctx, lm, { color: "#ffffffff", lineWidth: 3 });
//       }
//     });

//     const camera = new Camera(videoEl, {
//       onFrame: async () => {
//         await hands.send({ image: videoEl });
//       },
//       width: 640,
//       height: 480,
//     });

//     camera.start();

//     return () => {
//       camera.stop();
//       hands.close();
//     };
//   }, []);

//   {/* post to the model , fucn to send info to the model*/}

//   {/* we consintnslty send info , until we get the right target, websocket */}
//   return (
//     <div
//       style={{
//         position: "relative",
//         width: 640,
//         height: 480,
//         background: "transparent",
//         borderRadius: 16,
//         borderStyle: "solid",
//         borderWidth: 2,
//         borderColor: "#45caffff",
//         boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",

//       }}
//     >
//       {/* video is required but hidden */}
//       <video ref={videoRef} style={{ display: "none" }} playsInline />
//       <canvas
//         ref={canvasRef}
//         style={{
//           position: "absolute",
//           inset: 0,
//           background: "transparent",
//         }}
//       />
//     </div>
//   );
// };

// export default HandLandmarks;


import React, { useEffect, useRef } from "react";
import { Hands, HAND_CONNECTIONS, type Results } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

type Lm = { x: number; y: number; z: number };
type FramePayload = { hands: Lm[][] };

type Props = {
  wsRef: React.MutableRefObject<WebSocket | null>;
  onDebug?: (info: { framesSent: number; hands: number; wsOpen: boolean }) => void;
};

const SEND_EVERY_MS = 100; // ~10 fps throttle

const HandLandmarks: React.FC<Props> = ({ wsRef, onDebug }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastSendRef = useRef<number>(0);
  const framesSentRef = useRef<number>(0);

  useEffect(() => {
    const videoEl = videoRef.current;
    const canvasEl = canvasRef.current;
    if (!videoEl || !canvasEl) return;

    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    const sendFrame = (results: Results) => {
      const ws = wsRef.current;
      const wsOpen = !!ws && ws.readyState === WebSocket.OPEN;
      if (!wsOpen) {
        onDebug?.({ framesSent: framesSentRef.current, hands: 0, wsOpen: false });
        return;
      }

      const now = performance.now();
      if (now - lastSendRef.current < SEND_EVERY_MS) return;
      lastSendRef.current = now;

      const handsLm = results.multiHandLandmarks ?? [];
      const handsPayload: Lm[][] = handsLm.map((hl) =>
        hl.map((p) => ({ x: p.x, y: p.y, z: p.z ?? 0 }))
      );

      const payload: FramePayload = { hands: handsPayload };
      try {
        ws.send(JSON.stringify(payload));
        framesSentRef.current += 1;
        onDebug?.({
          framesSent: framesSentRef.current,
          hands: handsPayload.length,
          wsOpen: true,
        });
      } catch {
        onDebug?.({ framesSent: framesSentRef.current, hands: -1, wsOpen: false });
      }
    };

    hands.onResults((results) => {
      // draw
      canvasEl.width = results.image.width;
      canvasEl.height = results.image.height;
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

      const handsLm = results.multiHandLandmarks ?? [];
      for (const lm of handsLm) {
        drawConnectors(ctx as any, lm, HAND_CONNECTIONS, { lineWidth: 4 });
        drawLandmarks(ctx as any, lm, { lineWidth: 2 });
      }

      // stream to backend
      sendFrame(results);
    });

    const camera = new Camera(videoEl, {
      onFrame: async () => {
        await hands.send({ image: videoEl });
      },
      width: 640,
      height: 480,
    });

    camera.start();

    return () => {
      camera.stop();
      hands.close();
    };
  }, [wsRef, onDebug]);

  return (
    <div
      style={{
        position: "relative",
        width: 640,
        height: 480,
        border: "2px solid #45caff",
        borderRadius: 16,
      }}
    >
      {/* keep video active (1×1 transparent), not display:none */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
      />
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
};

export default HandLandmarks;
