"use client";
import React, { useEffect, useRef, useState } from "react";
import { Flex, Loader } from "@mantine/core";
import { PeerMessage, validatePeerMessage, webRtcServerConfig } from "@/x";
import {
  LocalCamera,
  MeetingContainer,
  VideoGrid,
  MeetingNavbar,
  RemoteVideo,
} from "@/components";
import { useLocalStorage } from "@mantine/hooks";
import { createId } from "@paralleldrive/cuid2";
import { useRouter } from "next/navigation";

type Props = { params: { meetingId: string } };

function getDefaultValue(key: string): string {
  // Checking for server side
  if (typeof window === "undefined") {
    return createId();
  }
  try {
    const id = localStorage.getItem(key);

    if (!id) {
      return createId();
    }

    localStorage.setItem(key, id);
    return id;
  } catch (err) {
    console.error(err);
    const id = createId();
    localStorage.setItem(key, id);
    return id;
  }
}

export default function MeetingPage({ params }: Props) {
  // Meta
  const meetingId = params.meetingId;
  const router = useRouter();

  const connectionIdKey = "_connection_id";
  const [connectionId] = useLocalStorage({
    defaultValue: getDefaultValue(connectionIdKey),
    key: connectionIdKey,
  });

  // Local state
  const [initialized, setInitialized] = useState(false);
  // Local video
  const localMediaRef = useRef<MediaStream | null>(null);

  ////////////////////////
  // Remote connections //
  ////////////////////////
  // WebSocket
  const wsRef = useRef<WebSocket | null>(null);
  // webrtc
  const remotePeersRef = useRef<
    { id: string; connection: RTCPeerConnection }[]
  >([]);
  // streams
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);

  /** Gets local camera and audio */
  async function getLocalStreams() {
    localMediaRef.current = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: {
        echoCancellation: true,
      },
    });

    // setRemoteStreams((prev) => [
    //   ...prev,
    //   localMediaRef?.current as MediaStream,
    // ]);
  }

  async function connectToMeetingRoomWebSocket() {
    if (wsRef.current) {
      console.log("WS already connected");
      return;
    }

    if (!connectionId) {
      console.error("no connection id");
      return;
    }

    wsRef.current = new WebSocket(
      `wss://${process.env.NEXT_PUBLIC_WSS_CALLING_URI}/v1/webrtc/${meetingId}?peerId=${connectionId}`
    );

    wsRef.current.onopen = (open) => {
      const e: PeerMessage = {
        type: "roomEntryRequest",
        // TODO:
        displayName: "Ymir",
      };
      wsRef.current?.send(JSON.stringify(e));
    };

    wsRef.current.onmessage = async (message) => {
      if (typeof message.data !== "string") {
        console.error("Unhandled non-string ws message", message);
        return;
      }

      // Validate message:
      const msg = validatePeerMessage(message.data);

      if (!msg) {
        console.error("Invalid message recieved", message.data);
        return;
      }

      console.log("recieved", JSON.stringify(msg));

      // handle message
      switch (msg.type) {
        case "roomEntryRequest": {
          console.error(`roomEntryRequest - not implemented`);
          return;
        }

        case "roomDisconnect": {
          const id = msg.peerId;

          const index = remotePeersRef.current.findIndex(
            (item) => item.id === id
          );

          if (index !== -1) {
            remotePeersRef.current.splice(index, index);
          }

          return;
        }

        case "roomConnected": {
          const connectionId = msg.connectionId;

          msg.peers.forEach(async (peerId) => {
            // New connection ( add to ref ??? )
            const pc = new RTCPeerConnection(webRtcServerConfig);
            pc.onicegatheringstatechange = (ev) => {
              console.log("onice", ev);
            };
            // Add to state ref
            remotePeersRef.current.push({ id: peerId, connection: pc });

            // Add local stream to it
            localMediaRef.current?.getTracks().forEach((track) => {
              pc.addTrack(track, localMediaRef.current as MediaStream);
            });

            // Create a new media stream
            const remoteStream = new MediaStream();

            // When recieing remote track add to media stream
            pc.ontrack = (event) => {
              event.streams[0].getTracks().forEach((track) => {
                remoteStream.addTrack(track);
              });
            };
            // maybe wait to do this?
            console.log("1 remotestream", remoteStream);
            setRemoteStreams((prev) => [...prev, remoteStream]);

            // Get candidate for peer connection
            pc.onicecandidate = (event) => {
              if (event.candidate) {
                const candidate = event.candidate.toJSON();
                const e: PeerMessage = {
                  type: "iceCandidates",
                  candidates: candidate,
                  to: peerId,
                  from: connectionId,
                };
                const stringE = JSON.stringify(e);

                console.log(`sending ${stringE}`);
                wsRef.current?.send(stringE);
              }
            };

            // Create offer for peer connection
            const offerDescription = await pc.createOffer();
            await pc.setLocalDescription(offerDescription);

            const offerEvent: PeerMessage = {
              type: "offer",
              offer: {
                sdp: offerDescription.sdp,
                type: offerDescription.type,
              },
              from: connectionId,
              to: peerId,
            };

            const stringE = JSON.stringify(offerEvent);

            console.log(`sending ${stringE}`);
            wsRef.current?.send(stringE);
          });

          return;
        }

        case "offer": {
          // Check that we have peer...
          let peer = remotePeersRef.current?.find(
            (item) => item.id === msg.from
          );

          if (!peer) {
            // This is probably ( likely!! ) enabling fuckery. NOTE: Fix.
            peer = {
              id: msg.from,
              connection: new RTCPeerConnection(webRtcServerConfig),
            };

            // Add to state ref
            remotePeersRef.current.push(peer);

            // Add local stream to it
            localMediaRef.current?.getTracks().forEach((track) => {
              peer?.connection.addTrack(
                track,
                localMediaRef.current as MediaStream
              );
            });

            // Create a new media stream
            const remoteStream = new MediaStream();

            // When recieing remote track add to media stream
            peer.connection.ontrack = (event) => {
              event.streams[0].getTracks().forEach((track) => {
                remoteStream.addTrack(track);
              });
            };
            // maybe wait to do this?
            console.log("2 remotestream", remoteStream);
            setRemoteStreams((prev) => [...prev, remoteStream]);
          }

          await peer?.connection.setRemoteDescription(
            new RTCSessionDescription(msg.offer as RTCSessionDescriptionInit)
          );

          const answerDescription = await peer?.connection.createAnswer();
          await peer?.connection.setLocalDescription(answerDescription);

          const answerMessage: PeerMessage = {
            type: "answer",
            answer: answerDescription,
            to: peer?.id as string,
            from: connectionId,
          };
          const stringE = JSON.stringify(answerMessage);

          console.log(`sending ${stringE}`);
          wsRef.current?.send(stringE);
          return;
        }

        case "answer": {
          const peerId = msg.from;
          const peer = remotePeersRef.current.find(
            (item) => item.id === peerId
          );

          const remoteDescription = new RTCSessionDescription(msg.answer);
          await peer?.connection.setRemoteDescription(remoteDescription);

          console.log("answer->candiate");
          console.log(msg);
          console.log("answer->candiate");
          // const candidate = new RTCIceCandidate(msg.answer);
          // await peer?.connection.addIceCandidate(candidate);

          // NOTE:
          // Send ice candidates here?

          return;
        }

        case "iceCandidates": {
          const peer = remotePeersRef.current?.find(
            (item) => item.id === msg.from
          );

          const newCandidates = new RTCIceCandidate(msg.candidates);
          await peer?.connection.addIceCandidate(newCandidates);

          // send back??
          return;
        }

        case "sessionDescription": {
          console.error("UNHANDLED: sessionDescription");
          return;
        }

        default:
          console.error("UNHANDLED" + msg);
          return;
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("ws on error: ", error);
    };

    wsRef.current.onclose = (close) => {
      // TODO: Remove stream !
      console.log("ws closed");
    };
  }

  async function initialize() {
    await getLocalStreams(); // sets localMediaRef.current to MediaStream
    await connectToMeetingRoomWebSocket(); // sets wsRef.current to WebSocket and configures it
  }

  // Initialize
  useEffect(() => {
    initialize().then(() => {
      setInitialized(true);
    });
  }, []);

  return (
    <MeetingContainer>
      {!initialized && (
        <>
          {/* Waiting room... */}
          <Flex
            style={{
              width: "100vw",
              height: "100vh",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Loader />
          </Flex>
        </>
      )}
      {initialized && (
        <>
          <VideoGrid>
            {remoteStreams.map((stream, i) => {
              return (
                <RemoteVideo
                  name={stream.id}
                  key={`remote-${stream.id}-${i}`}
                  mediaStream={stream}
                />
              );
            })}
          </VideoGrid>
          <LocalCamera mediaStream={localMediaRef.current} />
          <MeetingNavbar
            onComplete={() => {
              router.push(`${window.location.pathname}/complete`);
            }}
          />
        </>
      )}
    </MeetingContainer>
  );
}
