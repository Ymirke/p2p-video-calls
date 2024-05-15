import { z } from "zod";

export const webRtcServerConfig = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const peerMessageSchema = z.discriminatedUnion("type", [
  /**
   * Sent from server when a peer disconnects
   */
  z.object({
    type: z.literal("roomDisconnect"),
    peerId: z.string(),
  }),
  /**
   * Sent from client to server on open event
   * Admin of meeting can approve them? ( not implemented yet )
   */
  z.object({
    type: z.literal("roomEntryRequest"),
    displayName: z.string().nullable(),
  }),
  /**
   * NOTE: Not sure we'll implemnt this just yet
   * roomEntryResponse
   * sent as response to roomEntryRequest from meeting participants / meeting owner
   */
  // z.object({
  //   type: z.literal("roomEntryResponse"),
  //   status: z.enum(["approved", "rejected"]),
  // }),
  /**
   * Sent to peer after they've connected with WebSocket.
   * Each client connects to WebSockets
   * Oriented towards the "business logic"
   */
  z.object({
    type: z.literal("roomConnected"),
    peers: z.array(z.string()),
    connectionId: z.string(),
  }),
  /**
   * After the connecting client has recieved a list of peers,
   * it will create offers and send out to each. This event is forwarded to other peers in a meeting.
   */
  z.object({
    type: z.literal("offer"),
    offer: z.object({
      sdp: z.any(),
      type: z.any(),
    }),
    to: z.string(),
    from: z.string(),
  }),
  /**
   * Peers in the room will recieve the offer, and reply with an anwer.
   * This answer is forwarded back to the initializing offer
   */
  z.object({
    type: z.literal("answer"),
    answer: z.any(),
    to: z.string(),
    from: z.string(),
  }),
  /**
   * Ice candidates are exchanged and optimal connection is chosen between peers
   */
  z.object({
    type: z.literal("iceCandidates"),
    candidates: z.any(),
    to: z.string(),
    from: z.string(),
  }),
  /**
   * Finally sessionDescription is forwarded in the same way
   */
  z.object({
    type: z.literal("sessionDescription"),
    description: z.any(),
    to: z.string(),
    from: z.string(),
  }),
]);

export type PeerMessage = z.infer<typeof peerMessageSchema>;

export function validatePeerMessage(input: string): PeerMessage | null {
  let json: any;
  try {
    json = JSON.parse(input);
  } catch (err) {
    console.error("validateMessage json", err);
    return null;
  }

  const validated = peerMessageSchema.safeParse(json);

  if (!validated.success) {
    console.error("validateMessage invalid schema", validated.error.issues);
    return null;
  }

  return validated.data;
}
