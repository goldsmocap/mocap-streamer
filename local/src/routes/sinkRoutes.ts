import express, { Router } from "express";
import { Observer } from "rxjs";
import { getRemoteWs } from "../remote";
import { sources } from "./sourceRoutes";
import { udpSink } from "../flows/udp";
import { wsSink } from "../flows/ws";
import { logger } from "../log";

// Types
///////////////////////////////////////////////////////////////////////////////
interface Sinklike {
  upstream: string;
}

interface UdpSink extends Sinklike {
  kind: "UdpSink";
  fromAddress: string;
  fromPort: number;
  toAddress: string;
  toPort: number;
  sender?: string;
}

interface WsSink extends Sinklike {
  kind: "WsSink";
}

type Sink = UdpSink | WsSink;

// State
///////////////////////////////////////////////////////////////////////////////
export const sinks: [string, Observer<any>][] = [];

// Routes
///////////////////////////////////////////////////////////////////////////////
function connectFlows(
  upstream: string,
  observer: Observer<any>
): string | undefined {
  // find the source to observe
  const i = sources.findIndex(([label, _]) => label === upstream);

  // if found connect to it
  if (i >= 0) {
    const observable = sources[i][1];
    const subscription = observable.subscribe(observer);
    observable.connect();
    return;
  }

  return `unable to find flow with name ${upstream}`;
}

export function sinkRoutes(): Router {
  const router = express.Router();

  router.post("/sink", (req, res) => {
    type Payload = { label: string; sink: Sink };

    const { label, sink } = req.body as Payload;

    switch (sink.kind) {
      case "UdpSink":
        udpSink({
          toAddress: sink.toAddress,
          toPort: sink.toPort,
          sender: sink.sender,
        })
          .then((observer) => {
            const fail = connectFlows(sink.upstream, observer);
            if (fail) res.status(400).send(fail);
            res.send();
          })
          .catch((err) => res.status(400).send(err));
        break;

      case "WsSink":
        getRemoteWs()
          .then((ws) => wsSink(ws))
          .then((observer) => {
            const fail = connectFlows(sink.upstream, observer);
            if (fail) res.status(400).send(fail);
            res.send();
          })
          .catch((err) => res.status(400).send(err));
        break;
    }
  });

  return router;
}
