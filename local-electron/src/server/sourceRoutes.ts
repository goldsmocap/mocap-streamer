import { match } from "ts-pattern";
import { UdpSourceOptions, udpSource } from "../server/flows/udp";
import { WsSourceOptions, wsSource } from "../server/flows/ws";
import { sources } from "../server/flows";

type SourceOptions =
  | { kind: "UdpSource"; options: UdpSourceOptions }
  | { kind: "WsSource"; options: WsSourceOptions };

// Routes
///////////////////////////////////////////////////////////////////////////////

export function postSource(opt: SourceOptions): Promise<string | undefined> {
  switch (opt.kind) {
    case "UdpSource":
      return udpSource(opt.options)
        .then((source) => {
          sources.push(source);
          return undefined;
        })
        .catch((err) => "🤖 oops");

    case "WsSource":
      return wsSource(opt.options)
        .then((source) => {
          return match(source)
            .with({ _tag: "WsSource" }, (source) => {
              sources.push(source);
              return undefined;
            })
            .with({ _tag: "WebSocketClosed" }, () => "🤖 Websocket is closed")
            .with({ _tag: "WebSocketConnecting" }, () => "🤖 Websocket still connecting")
            .run();
        })
        .catch((err) => "🤖 oops");
  }
}
