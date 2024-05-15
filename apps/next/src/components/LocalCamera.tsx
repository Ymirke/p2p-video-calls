"use client";
import { useEffect, useRef } from "react";

const LocalCamera = ({ mediaStream }: { mediaStream: MediaStream | null }) => {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (mediaStream && ref.current) {
      ref.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  return (
    <div
      style={{
        position: "absolute",
        right: 30,
        bottom: 110,
      }}
    >
      <video
        ref={ref}
        autoPlay
        muted
        style={{
          border: "1px solid black",
          borderRadius: "8px",
          maxHeight: "100%",
          maxWidth: "220px",
        }}
      />
    </div>
  );
};

export { LocalCamera };
