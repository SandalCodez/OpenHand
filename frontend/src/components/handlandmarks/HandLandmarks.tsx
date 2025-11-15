import React, { useEffect, useRef } from "react";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

const HandLandmarks: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const videoEl = videoRef.current!;
    const canvasEl = canvasRef.current!;
    const ctx = canvasEl.getContext("2d")!;

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      // match canvas to the processed frame size
      canvasEl.width = results.image.width;
      canvasEl.height = results.image.height;

      // clear & keep transparent background
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

      

      const handsLm = results.multiHandLandmarks ?? [];
      for (const lm of handsLm) {
        drawConnectors(ctx, lm, HAND_CONNECTIONS, {
          color: "#45caffff",
          lineWidth: 15,
        });
        drawLandmarks(ctx, lm, { color: "#ffffffff", lineWidth: 5 });
      }
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
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: 640,
        height: 480,
        background: "transparent",
        borderRadius: 16,
        borderStyle: "solid",
        borderWidth: 2,
        borderColor: "#45caffff",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",

      }}
    >
      {/* video is required but hidden */}
      <video ref={videoRef} style={{ display: "none" }} playsInline />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          background: "transparent",
        }}
      />
    </div>
  );
};

export default HandLandmarks;
