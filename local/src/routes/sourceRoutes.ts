import express from "express";
import { logger } from "../logging";
import { UdpSourceOptions, udpSource } from "../flows/udp";
import { WsSourceOptions, wsSource } from "../flows/ws";
import { sources } from "../flows";
import { match } from "ts-pattern";

type SourceOptions =
  | { kind: "UdpSource"; options: UdpSourceOptions }
  | { kind: "WsSource"; options: WsSourceOptions };

// Routes
///////////////////////////////////////////////////////////////////////////////
export const sourceRoutes = express.Router();

sourceRoutes.post("/source", (req, res) => {
  const body = req.body as SourceOptions;

  switch (body.kind) {
    case "UdpSource":
      udpSource(body.options)
        .then((source) => {
          sources.push(source);
          res.send();
        })
        .catch((err) => res.status(400).send(err));
      break;

    case "WsSource":
      wsSource(body.options)
        .then((source) => {
          match(source)
            .with({ _tag: "WsSource" }, (source) => {
              sources.push(source);
              res.send();
            })
            .with({ _tag: "WebSocketClosed" }, () => logger.warn("Websocket is closed"))
            .with({ _tag: "WebSocketConnecting" }, () => logger.warn("Websocket still connecting"))
            .run();
        })
        .catch((err) => res.status(400).send(err));
      break;
  }
});
