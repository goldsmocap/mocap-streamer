import express, { Router } from "express";
import { match, P } from "ts-pattern";
import { logger } from "shared";
import { UdpSinkOptions, udpSink } from "../flows/udp";
import { WsSinkOptions, wsSink } from "../flows/ws";
import { connectSink, sinks } from "../flows";

type SinkOptions =
  | { kind: "UdpSink"; upstream: string; options: UdpSinkOptions }
  | { kind: "WsSink"; upstream: string; options: WsSinkOptions };

// Routes
///////////////////////////////////////////////////////////////////////////////
export const sinkRoutes = express.Router();

sinkRoutes.post("/sink", (req, res) => {
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
        .then((sink) => {
          match(sink)
            .with({ _tag: "WsSink" }, (sink) => {
              connectSink(body.upstream, sink);
              res.send();
            })
            .with({ _tag: "WebSocketClosed" }, () => logger.warn("websocket closed."))
            .with({ _tag: "WebSocketConnecting" }, () => logger.warn("websocket still connecting."))
            .run();
        })
        .catch((err) => res.status(400).send(err));
      break;
  }
});

sinkRoutes.get("/sink/udp", (req, res) => {
  const udpSinks = sinks.filter(({ _tag }) => _tag === "UdpSink");
  res.send(udpSinks);
});
