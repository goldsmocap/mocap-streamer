import { Router } from "express";
import { match, P } from "ts-pattern";
import { joinRemote, serialize } from "shared/dist/messages";
import { getRemoteWs, newRemoteWs, nameOnRemote } from "../remote";
import { logger } from "../logging";

export const apiRoutes = Router();

apiRoutes.get("/status", (_, res) => {
  getRemoteWs()
    .then((wsOrErr) =>
      match(wsOrErr)
        .with({ _tag: "Left", left: { _tag: "WebSocketClosed" } }, () =>
          res.send({ status: "CLOSED", nameOnRemote })
        )
        .with({ _tag: "Left", left: { _tag: "WebSocketConnecting" } }, () =>
          res.send({ status: "CONNECTING", nameOnRemote })
        )
        .with({ _tag: "Right", right: P.any }, () =>
          res.send({ status: "CONNECTED", joined: nameOnRemote ? true : false, nameOnRemote })
        )
        .run()
    )
    .catch((err) => res.status(500).send(err));
});

apiRoutes.post("/join", (req, res) => {
  const name = req.body.name as string;
  const remoteUrl = req.body.remoteUrl as string;

  newRemoteWs(remoteUrl)
    .then((wsOrErr) => {
      match(wsOrErr)
        .with({ _tag: "Right", right: P.select() }, (ws) => {
          ws.send(serialize(joinRemote(name)));
          res.send();
        })
        .with({ _tag: "Left", left: { _tag: "WebSocketAlreadyConnected" } }, () => {
          logger.warn("⚡ WebSocket already connected to remote server.");
          res.status(500).send("Already connected");
        })
        .with({ _tag: "Left", left: P.any }, () => {
          logger.warn("⚡ Oops");
          res.status(500).send("Something went wrong");
        })
        .run();
    })
    .catch((err) => {
      logger.error(`💀 Encountered an error ${err}`);
      // you are already connected or there was some other error
      res.status(500).send(err);
    });
});

export { sinkRoutes } from "./sinkRoutes";
export { sourceRoutes } from "./sourceRoutes";
