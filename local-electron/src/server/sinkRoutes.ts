import type { Sink } from "../server/flows";

import { match } from "ts-pattern";
import { UdpSinkOptions, udpSink } from "../server/flows/udp";
import { WsSinkOptions, wsSink } from "../server/flows/ws";
import { connectSink, sinks } from "../server/flows";

type SinkOptions =
  | { kind: "UdpSink"; upstream: string; options: UdpSinkOptions }
  | { kind: "WsSink"; upstream: string; options: WsSinkOptions };

// Routes
///////////////////////////////////////////////////////////////////////////////

export function postSink(opt: SinkOptions): Promise<string | undefined> {
  switch (opt.kind) {
    case "UdpSink":
      return udpSink(opt.options)
        .then((sink) => connectSink(opt.upstream, sink))
        .then((_) => undefined)
        .catch((err) => "🤖 oops");

    case "WsSink":
      return wsSink(opt.options)
        .then((sink) => {
          return match(sink)
            .with({ _tag: "WsSink" }, (sink) => {
              connectSink(opt.upstream, sink);
              return undefined;
            })
            .with({ _tag: "WebSocketClosed" }, () => "🤖 websocket closed.")
            .with({ _tag: "WebSocketConnecting" }, () => "🤖 websocket still connecting.")
            .run();
        })
        .catch((err) => "🤖 oops");
  }
}

export const getSinkUdp = (): Sink[] => sinks.filter(({ _tag }) => _tag === "UdpSink");
