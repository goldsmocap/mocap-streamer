import express, { Router } from "express";
import { UdpSinkOptions, udpSink } from "../flows/udp";
import { WsSinkOptions, wsSink } from "../flows/ws";
import { connectSink, sinks } from "../flows";
import { logger } from "../log";

type SinkOptions =
  | { kind: "UdpSink"; upstream: string; options: UdpSinkOptions }
  | { kind: "WsSink"; upstream: string; options: WsSinkOptions };

// Routes
///////////////////////////////////////////////////////////////////////////////
export function sinkRoutes(): Router {
  const router = express.Router();

  router.post("/sink", (req, res) => {
    const body = req.body as SinkOptions;

    switch (body.kind) {
      case "UdpSink":
        udpSink(body.options)
          .then((sink) => connectSink(body.upstream, sink))
          .then((_) => res.send())
          .catch((err) => res.status(400).send(err));
        break;

      case "WsSink":
        wsSink(body.options)
          .then((sink) => connectSink(body.upstream, sink))
          .then((_) => res.send())
          .catch((err) => res.status(400).send(err));
        break;
    }
  });

  router.get("/sink/udp", (req, res) => {
    const udpSinks = sinks.filter(({ kind }) => kind === "UdpSink");
    res.send(udpSinks);
  });

  return router;
}
