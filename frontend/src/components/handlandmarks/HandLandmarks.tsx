import React, { useEffect, useRef } from "react";
import { Hands, HAND_CONNECTIONS, type NormalizedLandmarkList } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

interface HandLandmarksProps {
  mode: "camera" | "landmarks";
  color?: string;
}

const HandLandmarks: React.FC<HandLandmarksProps> = ({ mode, color = "#45caff" }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const modeRef = useRef(mode);
  const colorRef = useRef(color);
  const frameCountRef = useRef(0);

  // Store history of landmarks for the trail effect
  // Array of arrays: [oldest_frame, ..., newest_frame]
  const historyRef = useRef<NormalizedLandmarkList[][]>([]);
  const MAX_TRAIL_LENGTH = 5; // Number of "ghost" frames to show

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    const videoEl = videoRef.current!;
    const canvasEl = canvasRef.current!;
    const ctx = canvasEl.getContext("2d", { alpha: true })!; // alpha: true needed for transparency

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 0, // Lite model
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    // Helper to draw the trails
    const drawTrails = (ctx: CanvasRenderingContext2D, history: NormalizedLandmarkList[][]) => {
      // Clear the canvas completely
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

      // Iterate through history (oldest -> newest)
      history.forEach((frameLandmarks, index) => {
        // Calculate opacity based on age (newest = 1.0, oldest = low)
        const opacity = (index + 1) / history.length;

        // Only draw the "head" (newest) with full thickness
        const isHead = index === history.length - 1;
        const lineWidth = isHead ? 2 : 1;
        const radius = isHead ? 1 : 0.5;

        ctx.globalAlpha = opacity * 0.9; // Base opacity scaling

        for (const lm of frameLandmarks) {
          drawConnectors(ctx, lm, HAND_CONNECTIONS, {
            color: colorRef.current, // Use ref to access latest color
            lineWidth: lineWidth,
          });
          drawLandmarks(ctx, lm, {
            color: "#ffffff",
            lineWidth: 3, // No border
            radius: radius
          });
        }
      });

      // Reset global alpha
      ctx.globalAlpha = 1.0;
    };

    hands.onResults((results) => {
      // Ensure canvas matches the low-res processing size
      if (canvasEl.width !== results.image.width || canvasEl.height !== results.image.height) {
        canvasEl.width = results.image.width;
        canvasEl.height = results.image.height;
      }

      const handsLm = results.multiHandLandmarks ?? [];

      // Update history
      if (handsLm.length > 0) {
        historyRef.current.push(handsLm);
        if (historyRef.current.length > MAX_TRAIL_LENGTH) {
          historyRef.current.shift(); // Remove oldest
        }
      } else {
        // If no hands detected, slowly clear history to fade out
        if (historyRef.current.length > 0) {
          historyRef.current.shift();
        }
      }

      drawTrails(ctx, historyRef.current);
    });

    const camera = new Camera(videoEl, {
      onFrame: async () => {
        frameCountRef.current++;

        if (modeRef.current === "landmarks") {
          const shouldRunAI = frameCountRef.current % 2 === 0; // Process every 2nd frame for smoother tracking

          if (shouldRunAI) {
            await hands.send({ image: videoEl });
          } else {
            // On skipped frames, redraw the current history

            // Ensure canvas size is correct
            if (canvasEl.width !== videoEl.videoWidth || canvasEl.height !== videoEl.videoHeight) {
              canvasEl.width = 640;
              canvasEl.height = 640;
            }

            drawTrails(ctx, historyRef.current);
          }
        } else {
          // Camera mode: Just draw the video
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
        background: "transparent",
        borderRadius: 16,
        overflow: "hidden",
        borderStyle: "solid",
        borderWidth: 2,
        borderColor: color,
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
