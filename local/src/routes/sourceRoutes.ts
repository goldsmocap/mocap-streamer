import express, { Router } from "express";
import { UdpSourceOptions, udpSource } from "../flows/udp";
import { WsSourceOptions, wsSource } from "../flows/ws";
import { sources } from "../flows";
import { logger } from "../log";

type SourceOptions =
  | { kind: "UdpSource"; options: UdpSourceOptions }
  | { kind: "WsSource"; options: WsSourceOptions };

// Routes
///////////////////////////////////////////////////////////////////////////////
export function sourceRoutes(): Router {
  const router = express.Router();

  router.post("/source", (req, res) => {
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
            sources.push(source);
            res.send();
          })
          .catch((err) => res.status(400).send(err));
        break;
    }
  });

  return router;
}
