import React, { useEffect, useRef, useState } from "react";

const Camera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream;
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }, // "environment" for rear camera
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        setError(err?.message ?? "Could not access camera");
      }
    };

    start();

    // cleanup when component unmounts
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className=" camera-container d-flex align-items-center justify-content-center">
      {error ? (
        <p>{error}</p>
      ) : (
   <video
  ref={videoRef}
  autoPlay
  playsInline
  muted
  style={{ width: "500px", height: "600px", objectFit: "cover" }}
  className="border border-1 border-light rounded rounded-4"
/>
      )}
    </div>
  );
};

export default Camera;
