import React, { useEffect, useRef } from "react";
import { Hands, HAND_CONNECTIONS, type NormalizedLandmarkList } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

interface HandLandmarksProps {
  mode: "camera" | "landmarks";
}

const HandLandmarks: React.FC<HandLandmarksProps> = ({ mode }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const modeRef = useRef(mode);
  const frameCountRef = useRef(0);
  const lastLandmarksRef = useRef<NormalizedLandmarkList[]>([]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const videoEl = videoRef.current!;
    const canvasEl = canvasRef.current!;
    const ctx = canvasEl.getContext("2d", { alpha: true })!;

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 0,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    const drawHands = (landmarks: NormalizedLandmarkList[]) => {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

      for (const lm of landmarks) {
        drawConnectors(ctx, lm, HAND_CONNECTIONS, {
          color: "#45caff",
          lineWidth: 2,
        });
        drawLandmarks(ctx, lm, {
          color: "#ffffff",
          lineWidth: 2,
          radius: 1,
        });
      }
    };

    hands.onResults((results) => {
      if (canvasEl.width !== results.image.width || canvasEl.height !== results.image.height) {
        canvasEl.width = results.image.width;
        canvasEl.height = results.image.height;
      }

      const handsLm = results.multiHandLandmarks ?? [];
      lastLandmarksRef.current = handsLm;
      drawHands(handsLm);
    });

    const camera = new Camera(videoEl, {
      onFrame: async () => {
        frameCountRef.current++;

        if (modeRef.current === "landmarks") {
          const shouldRunAI = frameCountRef.current % 2 === 0;
          if (shouldRunAI) {
            await hands.send({ image: videoEl });
          } else {
            // Redraw last known landmarks to prevent flickering or empty frames
            // if we clear. Or we can just leave it if we rely on persistence? 
            // Better to clear and redraw to handle resize/etc properly.
            if (canvasEl.width !== videoEl.videoWidth || canvasEl.height !== videoEl.videoHeight) {
              canvasEl.width = 640;
              canvasEl.height = 640;
            }
            drawHands(lastLandmarksRef.current);
          }
        } else {
          // Camera mode
          if (canvasEl.width !== videoEl.videoWidth || canvasEl.height !== videoEl.videoHeight) {
            canvasEl.width = videoEl.videoWidth;
            canvasEl.height = videoEl.videoHeight;
          }
          ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
        }
      },
      width: 640,
      height: 640,
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
        width: 700,
        height: 640,
        background: "transparent", // Transparent background for the container
        borderRadius: 16,
        overflow: "hidden",
        borderStyle: "solid",
        borderWidth: 2,
        borderColor: "#45caffff",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <video ref={videoRef} style={{ display: "none" }} playsInline />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
};

export default HandLandmarks;
