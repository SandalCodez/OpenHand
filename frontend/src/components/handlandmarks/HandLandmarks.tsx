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
//           lineWidth: 3,
//         });
//         drawLandmarks(ctx, lm, { color: "#ffffffff", lineWidth: 1 });
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
import React, { useEffect, useRef, useState } from "react";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { aiService } from "../../services/AIModelService";

interface HandLandmarksProps {
  targetLetter: string;
  onCorrect?: () => void;
}

const HandLandmarks: React.FC<HandLandmarksProps> = ({ targetLetter, onCorrect }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const handsRef = useRef<Hands | null>(null);
  const [hasHand, setHasHand] = useState(false);

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
      canvasEl.width = results.image.width;
      canvasEl.height = results.image.height;

      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

      const handsLm = results.multiHandLandmarks ?? [];
      setHasHand(handsLm.length > 0);
      
      for (const lm of handsLm) {
        drawConnectors(ctx, lm, HAND_CONNECTIONS, {
          color: "#45caffff",
          lineWidth: 3,
        });
        drawLandmarks(ctx, lm, { color: "#ffffffff", lineWidth: 1 });
      }
    });

    handsRef.current = hands;

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

  const checkSign = async () => {
    if (!videoRef.current || !captureCanvasRef.current) return;
    
    setIsChecking(true);
    
    // Create a canvas to capture the actual video frame
    const video = videoRef.current;
    const captureCanvas = captureCanvasRef.current;
    const ctx = captureCanvas.getContext('2d');
    
    if (!ctx) {
      setIsChecking(false);
      return;
    }
    
    // Set canvas size to match video
    captureCanvas.width = video.videoWidth || 640;
    captureCanvas.height = video.videoHeight || 480;
    
    // Draw the current video frame to the capture canvas
    ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
    
    // Convert to blob
    captureCanvas.toBlob(async (blob) => {
      if (!blob) {
        setIsChecking(false);
        setPrediction({ success: false, message: "Failed to capture image" });
        return;
      }
      
      try {
        const result = await aiService.predictSign(blob, targetLetter);
        setPrediction(result);
        
        if (result.success) {
          onCorrect?.();
        }
      } catch (error) {
        console.error('Prediction error:', error);
        setPrediction({ 
          success: false, 
          message: error instanceof Error ? error.message : "Prediction failed" 
        });
      } finally {
        setIsChecking(false);
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "relative",
          width: 640,
          height: 480,
          background: "#f0f0f0",
          borderRadius: 16,
          borderStyle: "solid",
          borderWidth: 2,
          borderColor: hasHand ? "#45caffff" : "#ff6b6b",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        {/* Video element - now visible to show the actual camera feed */}
        <video 
          ref={videoRef} 
          style={{ 
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scaleX(-1)", // Mirror the video for better UX
          }} 
          playsInline 
        />
        
        {/* Overlay canvas for hand landmarks */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            transform: "scaleX(-1)", // Mirror the canvas to match video
          }}
        />
        
        {/* Hidden canvas for capturing frames */}
        <canvas
          ref={captureCanvasRef}
          style={{ display: "none" }}
        />
        
        {/* Hand detection indicator */}
        <div 
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            padding: "5px 10px",
            borderRadius: 5,
            backgroundColor: hasHand ? "#45caff" : "#ff6b6b",
            color: "white",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {hasHand ? "Hand Detected" : "Show your hand"}
        </div>
      </div>

      {/* Prediction feedback */}
      {prediction && (
        <div 
          className={`mt-3 p-3 rounded ${prediction.success ? 'bg-success' : 'bg-danger'}`}
          style={{ color: 'white' }}
        >
          {prediction.success ? (
            <div>
              <strong>Correct!</strong>
              <p>Confidence: {Math.round(prediction.confidence * 100)}%</p>
            </div>
          ) : (
            <div>
              <strong>Keep trying!</strong>
              {prediction.message && <p>{prediction.message}</p>}
              {prediction.confidence !== undefined && (
                <p>Confidence: {Math.round(prediction.confidence * 100)}%</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Check button */}
      <button
        onClick={checkSign}
        disabled={isChecking || !hasHand}
        className="btn btn-primary mt-3 w-100"
        style={{
          backgroundColor: hasHand ? "#45caff" : "#ccc",
          border: "none",
          padding: "10px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: hasHand ? "pointer" : "not-allowed",
        }}
      >
        {isChecking ? 'Checking...' : !hasHand ? 'Position your hand first' : `Check if this is "${targetLetter}"`}
      </button>
    </div>
  );
};

export default HandLandmarks;