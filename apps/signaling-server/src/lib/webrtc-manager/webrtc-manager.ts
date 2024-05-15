import { WebSocket } from "ws";
import { PeerMessage } from "../../x";
import { logger } from "../pino.js";

type Room = {
  [peerId: string]: WebSocket;
};

type RoomMgmt = {
  [roomId: string]: Room;
};

function roomString(r: Room): string {
  // Create an object where keys are the same as in the input Room object,
  // but the values are "ws" or "non-ws" based on the condition.
  const formattedObj = Object.entries(r).reduce((acc, [key, value]) => {
    // @ts-ignore
    acc[key] = value ? "ws" : "non-ws";
    return acc;
  }, {});

  // Convert the object to a JSON string with indentation for readability
  return JSON.stringify(formattedObj, null, 2);
}

class VideoCallManagerV1 {
  roomMgmt: RoomMgmt = {};

  public forwardToPeer(roomId: string, peerId: string, message: PeerMessage) {
    const room = this.roomMgmt[roomId];

    if (!room) {
      logger.error("forwardToPeers", "missing room", roomId);
      return;
    }

    const peerWs = room[peerId];

    if (!peerWs) {
      logger.error(
        `missing peer ${peerId} in room ${roomId} ${roomString(
          room
        )} message ${JSON.stringify(message)}`
      );
      return;
    }

    const eventString = JSON.stringify(message);

    peerWs.send(eventString);
  }

  public connectPeer(roomId: string, peerId: string, ws: WebSocket) {
    const room = this.roomMgmt[roomId];
    if (!room) {
      const newRoom: Room = {
        [peerId]: ws,
      };
      this.roomMgmt[roomId] = newRoom;

      logger.info(`Room ${roomId} created: ${roomString(newRoom)}`);
      const roomConnectedEvent: PeerMessage = {
        connectionId: peerId,
        type: "roomConnected",
        peers: [],
      };
      ws.send(JSON.stringify(roomConnectedEvent));

      return;
    }

    const peerIds = Object.keys(room);

    // TODO: Check if peer exists from before

    this.roomMgmt[roomId][peerId] = ws;

    logger.info(`Peer ${peerId} joined room ${roomId} ${roomString(room)}`);

    const roomConnectedEvent: PeerMessage = {
      connectionId: peerId,
      type: "roomConnected",
      peers: peerIds,
    };
    ws.send(JSON.stringify(roomConnectedEvent));
  }

  public removePeer(roomId: string, peerId: string) {
    const room = this.roomMgmt[roomId];

    if (!room) {
      logger.error("removePeer", "Missing room", roomId);
      return;
    }

    if (!room[peerId]) {
      logger.error(
        "removePeer",
        "Missing connection",
        "room",
        roomId,
        "connection",
        peerId
      );
      return;
    }

    // delete the connection
    delete room[peerId];

    const peers = Object.keys(room);
    const m: PeerMessage = {
      type: "roomDisconnect",
      peerId: peerId,
    };
    peers.forEach((peer) => {
      this.forwardToPeer(roomId, peer, m);
    });

    if (Object.keys(room).length < 1) {
      delete this.roomMgmt[roomId];
    }

    logger.info(
      `Removed peer ${peerId} from room ${roomId}. Current room: ${this.roomMgmt[roomId]}`
    );
  }
}

export const videoCallManagerV1 = new VideoCallManagerV1();
