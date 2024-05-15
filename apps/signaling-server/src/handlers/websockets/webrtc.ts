import configureWs from "express-ws";
import { videoCallManagerV1 } from "../../lib/webrtc-manager/webrtc-manager.js";
import { validatePeerMessage } from "../../x";
import { logger } from "../../lib/pino.js";

export const webRtcWebsocketV1: configureWs.WebsocketRequestHandler = (
  ws,
  req
) => {
  const roomId = req.params.roomId;
  const peerId = req.query.peerId;

  if (typeof peerId !== "string") {
    ws.close();
    return;
  }

  // On connect send back other connections in room to peer
  // The peer will then start creating the webrtc connections

  ws.on("message", (message) => {
    if (typeof message !== "string") {
      logger.error(
        `Non-string message recieved. Room ${roomId} peer ${peerId} message: ${message}`
      );
      return;
    }

    // validate message.
    const msg = validatePeerMessage(message);
    if (!msg) {
      logger.error(
        `Invalid message recieved room ${roomId} peer ${peerId} message: ${message}`
      );
      return;
    }

    // Authorize message?
    // Check that message can be sent from the peer it's coming from...

    logger.info(`From ${peerId} ${JSON.stringify(msg, null, 2)}`);

    switch (msg.type) {
      case "roomEntryRequest": {
        videoCallManagerV1.connectPeer(roomId, peerId, ws);
        return;
      }
      case "roomConnected": {
        const reply = `roomConnected should not be recieved by server`;
        logger.error(reply);
        return;
      }
      case "offer": {
        logger.info(`${peerId} -> offer -> ${msg.to}`);
        videoCallManagerV1.forwardToPeer(roomId, msg.to, msg);
        return;
      }
      case "answer": {
        logger.info(`${peerId} -> answer -> ${msg.to}`);
        videoCallManagerV1.forwardToPeer(roomId, msg.to, msg);
        return;
      }
      case "iceCandidates": {
        logger.info(`${peerId} -> ice candidates -> ${msg.to}`);
        videoCallManagerV1.forwardToPeer(roomId, msg.to, msg);
        return;
      }
      case "sessionDescription": {
        logger.info(`${peerId} -> session description -> ${msg.to}`);
        videoCallManagerV1.forwardToPeer(roomId, msg.to, msg);
        return;
      }

      default: {
        logger.error("Unhandled event", message);
        return;
      }
    }
  });

  ws.on("error", (error) => {
    logger.error(`Room ${roomId} peer ${peerId} error: ${error}`);
  });

  ws.on("close", (close) => {
    videoCallManagerV1.removePeer(roomId, peerId);
  });
};
