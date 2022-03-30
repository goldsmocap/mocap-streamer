import { left, right, type Either } from "fp-ts/lib/Either";
import { match } from "ts-pattern";
import WebSocket from "ws";
import { logger } from "shared";
import { connections, connectSink, sinks, sources } from "./flows";
import { wsSink, wsSource } from "./flows/ws";
import { udpSink, udpSource } from "./flows/udp";
import { WsMessage } from "shared";

///////////////////////////////////////////////////////////////////////////////////////////////////
// Types
enum WsConnStatus {
  CONNECTED,
  NOT_CONNECTED,
  DISCONNECTING,
  CONNECTING,
}

export type WebSocketClosed = { _tag: "WebSocketClosed" };
const webSocketClosed: WebSocketClosed = { _tag: "WebSocketClosed" };

export type WebSocketConnecting = { _tag: "WebSocketConnecting" };
const webSocketConnecting: WebSocketConnecting = { _tag: "WebSocketConnecting" };

export type WebSocketAlreadyConnected = { _tag: "WebSocketAlreadyConnected"; ws: WebSocket };
function webSocketAlreadyConnected(ws: WebSocket): WebSocketAlreadyConnected {
  return { _tag: "WebSocketAlreadyConnected", ws };
}

export type NewWebSocketError = WebSocketAlreadyConnected | WebSocketConnecting;
export type GetWebSocketError = WebSocketClosed | WebSocketConnecting;

///////////////////////////////////////////////////////////////////////////////////////////////////

let isSending = false;

export let nameOnRemote: string | undefined = undefined;
let remoteWs: WebSocket | undefined = undefined;

function connStatus(): WsConnStatus {
  switch (remoteWs?.readyState) {
    case undefined:
    case WebSocket.CLOSED:
      return WsConnStatus.NOT_CONNECTED;

    case WebSocket.CLOSING:
      return WsConnStatus.DISCONNECTING;

    case WebSocket.CONNECTING:
      return WsConnStatus.CONNECTING;

    case WebSocket.OPEN:
      return WsConnStatus.CONNECTED;

    default:
      return WsConnStatus.NOT_CONNECTED;
  }
}

export function newRemoteWs(url: string): Promise<Either<NewWebSocketError, WebSocket>> {
  return new Promise((resolve, reject) => {
    switch (connStatus()) {
      case WsConnStatus.CONNECTED:
        resolve(left(webSocketAlreadyConnected(remoteWs as WebSocket)));
        break;

      case WsConnStatus.CONNECTING:
        resolve(left(webSocketConnecting));
        break;

      default:
        // if not then create new connection
        logger.info(`trying to connect to ${url}`);
        remoteWs = new WebSocket(url);
        remoteWs.on("open", function open() {
          logger.info(`⚡ WS connection to remote streamer established.`);
          resolve(right(remoteWs as WebSocket));
        });
        remoteWs.on("close", function close() {
          logger.info(`⚡ WS disconnected from remote streamer.`);
          remoteWs = undefined;
        });
        remoteWs.on("error", function error(err) {
          logger.error("⚡ WS failed to connect!");
          reject(err);
        });
        remoteWs.on("message", function message(msg: MessageEvent<WsMessage>) {
          switch (msg.data.type) {
            case "join_success":
              nameOnRemote = msg.data.payload as string;
              logger.info(`successfully joined remote with name ${nameOnRemote}`);

              break;

            case "become_receiver":
              logger.info("becoming receiver");

              // create a WS source (if it doesn't already exist)
              Promise.resolve(sources.find(({ _tag }) => _tag === "WsSource"))
                .then((src) => {
                  return src
                    ? Promise.resolve(src)
                    : wsSource({ name: "WS_SRC" }).then((src) => {
                        return match(src)
                          .with({ _tag: "WsSource" }, (src) => {
                            sources.push(src);
                            return src;
                          })
                          .run();
                      });
                })

                // create a new UDP sink
                .then(() => {
                  return udpSink({
                    name: `UDP_SINK_${msg.data.payload}`,
                    sender: msg.data.payload as string,
                    fromAddress: "127.0.0.1",
                    toAddress: "127.0.0.1",
                  }).then((sink) => {
                    sinks.push(sink);
                    return sink;
                  });
                })

                // connect them together
                .then((sink) => connectSink("WS_SRC", sink))

                // send message to remote
                .then((_) => {
                  // TODO: Implement this!
                })

                // send error to remote
                .catch((err) => {
                  // TODO: Implement this!
                });
              break;

            case "unbecome_receiver":
              // find the sink named "UDP_SINK_<from>"
              const i = sinks.findIndex(({ name }) => name === `UDP_SINK_${msg.data.payload}`);

              if (i >= 0) {
                logger.info(`🔌 removing UDP sink from ${msg.data.payload}`);
                sinks.splice(i, 1);

                logger.info(`🔌 unsubscribing all flows from ${msg.data.payload}`);
                const j = connections.findIndex((conn) => conn.from === msg.data.payload);

                if (j >= 0) {
                  connections[j].subscription.unsubscribe();
                  connections.splice(j, 1);
                }

                // TODO: send message to remote
              } else {
                logger.info(`Uh Oh! Can't find UDP_SINK_${msg.data.payload}`);

                // TODO: send error to remote
              }
              break;

            case "become_sender":
              logger.info("becoming sender");
              if (isSending) {
                logger.info("you're already a sender!");
                // TODO: send message to remote
                return;
              }

              // create a UDP source
              udpSource({
                name: "UDP_SRC",
                address: "127.0.0.1",
                port: 7002,
              })
                .then((src) => {
                  sources.push(src);
                  return src;
                })

                // create a WS sink (if it doesn't already exist)
                .then((_) =>
                  wsSink({ name: "WS_SINK" }).then((sink) => {
                    return match(sink)
                      .with({ _tag: "WsSink" }, (sink) => {
                        sinks.push(sink);
                        return sink;
                      })
                      .run();
                  })
                )

                // connect them together
                .then((sink) => connectSink("UDP_SRC", sink))

                // send message to remote
                .then((_) => {
                  isSending = true;
                  // TODO: Implement this!
                })

                // send error to remote
                .catch((err) => {
                  // TODO: Implement this!
                });
              break;
          }
        });
    }
  });
}

export function getRemoteWs(): Promise<Either<GetWebSocketError, WebSocket>> {
  return new Promise((resolve, _) => {
    switch (connStatus()) {
      case WsConnStatus.NOT_CONNECTED:
      case WsConnStatus.DISCONNECTING:
        resolve(left(webSocketClosed));
        break;

      case WsConnStatus.CONNECTING:
        resolve(left(webSocketConnecting));
        break;

      case WsConnStatus.CONNECTED:
        resolve(right(remoteWs as WebSocket));
        break;
    }
  });
}
