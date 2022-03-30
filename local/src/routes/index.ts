import { Router } from "express";
import { match, P } from "ts-pattern";
import logger from "winston";
import { getRemoteWs, newRemoteWs, nameOnRemote } from "../remote";

export const apiRoutes = Router();

apiRoutes.get("/ping", (_, res) => {
  getRemoteWs()
    .then((wsOrErr) =>
      match(wsOrErr)
        .with({ _tag: "Left", left: { _tag: "WebSocketClosed" } }, () => res.send())
        .with({ _tag: "Left", left: { _tag: "WebSocketConnecting" } }, () =>
          res.status(500).send("Local streamer is still connecting to remote. Please refresh page.")
        )
        .with({ _tag: "Right", right: P.any }, () => res.send(nameOnRemote))
        .run()
    )
    .catch((err) => res.status(500).send(err));
});

apiRoutes.post("/join", (req, res) => {
  const name = req.body.name as string;
  const url = req.body.url as string;

  newRemoteWs(url)
    .then((wsOrErr) => {
      logger.info("HHHHHHEEEEEEELLLLLLLLOOOOOOOOO");
      match(wsOrErr)
        .with({ _tag: "Left", left: { _tag: "WebSocketAlreadyConnected" } }, () => {
          logger.warn("⚡ WebSocket already connected to remote server.");
          res.send("Already connected");
        })
        .with({ _tag: "Left", left: P.any }, () => {
          logger.warn("⚡ Oops");
          res.status(500).send("Something went wrong");
        })
        .with({ _tag: "Right", right: P.select() }, (ws) => {
          logger.info("I GOT HERE!!!!!");
          ws.send(JSON.stringify({ type: "join", payload: name }));
          res.send();
        })
        .run();
    })
    .catch((err) => {
      logger.error(`Encountered an error, ${err}`);
      // you are already connected or there was some other error
      res.status(500).send(err);
    });
});

export { sinkRoutes } from "./sinkRoutes";
export { sourceRoutes } from "./sourceRoutes";
