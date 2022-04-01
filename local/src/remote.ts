import { left, right, type Either } from "fp-ts/lib/Either";
import { match } from "ts-pattern";
import WebSocket from "ws";
import { WsMessage } from "shared/dist/messages";
import { connections, connectSink, sinks, sources } from "./flows";
import { wsSink, wsSource } from "./flows/ws";
import { udpSink, udpSource } from "./flows/udp";
import { logger } from "./logging";

///////////////////////////////////////////////////////////////////////////////////////////////////
// Types
export type WebSocketClosed = { _tag: "WebSocketClosed" };
const webSocketClosed: WebSocketClosed = { _tag: "WebSocketClosed" };

export type WebSocketConnecting = { _tag: "WebSocketConnecting" };
const webSocketConnecting: WebSocketConnecting = { _tag: "WebSocketConnecting" };

export type WebSocketAlreadyConnected = { _tag: "WebSocketAlreadyConnected"; ws: WebSocket };
function webSocketAlreadyConnected(ws: WebSocket): WebSocketAlreadyConnected {
  return { _tag: "WebSocketAlreadyConnected", ws };
}

export type NewWebSocketError = WebSocketAlreadyConnected | WebSocketConnecting | WebSocketClosed;
export type GetWebSocketError = WebSocketClosed | WebSocketConnecting;

///////////////////////////////////////////////////////////////////////////////////////////////////

let remoteWs: WebSocket | undefined = undefined;

export let isSending = false;
export let nameOnRemote: string | undefined = undefined;

function handleDisconnect() {
  nameOnRemote = undefined;
  isSending = false;
}

export function newRemoteWs(url: string): Promise<Either<NewWebSocketError, WebSocket>> {
  return new Promise((resolve, reject) => {
    switch (remoteWs?.readyState) {
      case WebSocket.OPEN:
        resolve(left(webSocketAlreadyConnected(remoteWs as WebSocket)));
        break;

      case WebSocket.CONNECTING:
        resolve(left(webSocketConnecting));
        break;

      default:
        // if not then create new connection
        remoteWs = new WebSocket(url);

        remoteWs.on("open", function open() {
          logger.info(`⚡ WS connection to remote streamer established.`);
          resolve(right(remoteWs as WebSocket));
        });

        remoteWs.on("close", function close() {
          logger.info(`⚡ WS disconnected from remote streamer.`);
          handleDisconnect();
          resolve(left(webSocketClosed));
        });
        remoteWs.on("disconnect", () => {
          logger.info(`⚡ WS disconnected from remote streamer.`);
          handleDisconnect();
          resolve(left(webSocketClosed));
        });
        remoteWs.on("error", (err) => {
          logger.error("⚡ WS failed to connect!");
          handleDisconnect();
          reject(err);
        });

        remoteWs.on("message", (raw) => {
          const msg = JSON.parse(raw.toString()) as WsMessage;

          switch (msg._tag) {
            case "join_remote_success":
              nameOnRemote = msg.name;
              logger.info(`💃 successfully joined remote with name ${nameOnRemote}`);
              break;

            case "rename_success":
              nameOnRemote = msg.name;
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
                    name: `UDP_SINK_${msg.from}`,
                    sender: msg.from,
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
              const i = sinks.findIndex(({ name }) => name === `UDP_SINK_${msg.from}`);

              if (i >= 0) {
                logger.info(`🔌 removing UDP sink from ${msg.from}`);
                sinks.splice(i, 1);

                logger.info(`🔌 unsubscribing all flows from ${msg.from}`);
                const j = connections.findIndex((conn) => conn.from === msg.from);

                if (j >= 0) {
                  connections[j].subscription.unsubscribe();
                  connections.splice(j, 1);
                }

                // TODO: send message to remote
              } else {
                logger.info(`Uh Oh! Can't find UDP_SINK_${msg.from}`);

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
    switch (remoteWs?.readyState) {
      case undefined:
      case WebSocket.CLOSED:
      case WebSocket.CLOSING:
        resolve(left(webSocketClosed));
        break;

      case WebSocket.CONNECTING:
        resolve(left(webSocketConnecting));
        break;

      case WebSocket.OPEN:
        resolve(right(remoteWs as WebSocket));
        break;
    }
  });
}
