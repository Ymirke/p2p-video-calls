"use client";
import { useEffect, useRef } from "react";
import { Badge, Text } from "@mantine/core";

export function RemoteVideo({
  mediaStream,
  name,
}: {
  mediaStream: MediaStream;
  name: string;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (mediaStream && ref.current) {
      ref.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
        position: "relative",
      }}
    >
      <video
        ref={ref}
        style={{
          maxWidth: "100%",
          padding: "3px",
          borderRadius: "8px",
        }}
        disableRemotePlayback
        autoPlay
        muted
      />
      <Badge
        variant="transparent"
        size="xl"
        style={{
          position: "absolute",
          zIndex: 1,
          bottom: 0,
        }}
      >
        <Text>{name}</Text>
      </Badge>
    </div>
  );
}
