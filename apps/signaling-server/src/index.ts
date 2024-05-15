import express from "express";
import configureWs from "express-ws";
import { webRtcWebsocketV1 } from "./handlers/index.js";

const ENV = {
  PORT: process.env.PORT || "8080",
  HOSTNAME: process.env.HOSTNAME || "localhost",
};

const baseApp = express();
const wsApp = configureWs(baseApp);
const { app } = wsApp;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.ws("/v1/webrtc/:roomId", webRtcWebsocketV1);

app.listen(parseInt(ENV.PORT), ENV.HOSTNAME, () => {
  console.log(`Server listening on http://${ENV.HOSTNAME}:${ENV.PORT}`);
});
