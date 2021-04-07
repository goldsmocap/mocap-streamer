import express, { Router } from "express";
import { ConnectableObservable } from "rxjs";
import { useWs } from "../useWs";
import { udpSource } from "../flows/udp";
import { wsSource } from "../flows/ws";
import { logger } from "../log";

// Types
///////////////////////////////////////////////////////////////////////////////
interface UdpSource {
  kind: "UdpSource";
  port: number;
  address?: string;
  debug?: boolean;
}

interface WsSource {
  kind: "WsSource";
  debug?: boolean;
}

type Source = UdpSource | WsSource;

// State
///////////////////////////////////////////////////////////////////////////////
export const sources: [string, ConnectableObservable<any>][] = [];

// Routes
///////////////////////////////////////////////////////////////////////////////
export function sourceRoutes(): Router {
  const router = express.Router();

  router.post("/source", (req, res) => {
    type Payload = { label: string; source: Source };

    const { label, source } = req.body as Payload;

    switch (source.kind) {
      case "UdpSource":
        udpSource({
          port: source.port,
          address: source.address,
          debug: source.debug,
        })
          .then((observable) => {
            sources.push([label, observable]);
            res.send();
          })
          .catch((err) => res.status(500).send(err));
        break;

      case "WsSource":
        const ws = useWs();
        if (ws) {
          wsSource(ws, { debug: source.debug })
            .then((observable) => {
              sources.push([label, observable]);
              res.send();
            })
            .catch((err) => res.status(500).send(err));
        } else {
          res.status(401).send("You must join first.");
        }
        break;
    }
  });

  router.get("/source/all", (_req, res) => {
    res.send(sources.map(([label, _]) => label));
  });

  return router;
}
