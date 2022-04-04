import type { BrowserWindow } from "electron";
import type { Either } from "fp-ts/Either";
import type { WsMessage } from "../../../shared/dist/messages";

import { CONNECTING, OPEN, WebSocket } from "ws";
import { left, right } from "fp-ts/Either";
import { match } from "ts-pattern";
import { sources, sinks, connections, connectSink } from "./flows/index";
import { udpSource, udpSink } from "./flows/udp";
import { wsSource, wsSink } from "./flows/ws";

///////////////////////////////////////////////////////////////////////////////////////////////////
// Types
export type WebSocketClosed = { _tag: "WebSocketClosed" };
export const webSocketClosed: WebSocketClosed = { _tag: "WebSocketClosed" };

export type WebSocketConnecting = { _tag: "WebSocketConnecting" };
export const webSocketConnecting: WebSocketConnecting = { _tag: "WebSocketConnecting" };

export type WebSocketAlreadyConnected = { _tag: "WebSocketAlreadyConnected"; ws: WebSocket };
export function webSocketAlreadyConnected(ws: WebSocket): WebSocketAlreadyConnected {
  return { _tag: "WebSocketAlreadyConnected", ws };
}

export type NewWebSocketError = WebSocketAlreadyConnected | WebSocketConnecting | WebSocketClosed;
export type GetWebSocketError = WebSocketClosed | WebSocketConnecting;
export type RegistrationError = WebSocketAlreadyConnected | WebSocketConnecting | WebSocketClosed;

///////////////////////////////////////////////////////////////////////////////////////////////////

export let remoteBaseUrl: string | undefined = undefined;
let remoteWs: WebSocket | undefined = undefined;
let isSending = false;

function handleDisconnect() {
  isSending = false;
}

export function newRemoteWs(
  url: string,
  win: BrowserWindow | null
): Promise<Either<NewWebSocketError, WebSocket>> {
  return new Promise((resolve, reject) => {
    switch (remoteWs?.readyState) {
      case OPEN:
        resolve(left(webSocketAlreadyConnected(remoteWs as WebSocket)));
        break;

      case CONNECTING:
        resolve(left(webSocketConnecting));
        break;

      default:
        // if not then create new connection
        remoteBaseUrl = url.replace("ws://", "");
        remoteWs = new WebSocket(url);

        remoteWs.onopen = () => {
          console.log(`⚡ WS connection to remote streamer established.`);
          win?.webContents.send("connect_remote_success", remoteBaseUrl);
          resolve(right(remoteWs as WebSocket));
        };

        remoteWs.onclose = () => {
          console.log(`⚡ WS disconnected from remote streamer.`);
          handleDisconnect();
          win?.webContents.send("remote_disconnect"); // send ipc message to renderer
          resolve(left(webSocketClosed));
        };
        remoteWs.onerror = (err) => {
          console.log("⚡ WS failed to connect!");
          handleDisconnect();
          win?.webContents.send("remote_disconnect"); // send ipc message to renderer
          reject(err);
        };

        remoteWs.onmessage = (raw) => {
          const msg = JSON.parse(raw.data.toString()) as WsMessage;

          switch (msg._tag) {
            case "join_remote_success":
              console.log(`💃 successfully joined remote with name ${msg.name}.`);
              win?.webContents.send("join_remote_success", msg.name);
              break;

            case "rename_success":
              console.log(`💃 successfully renamed.`);
              win?.webContents.send("rename_success", msg.name);
              break;

            case "become_receiver":
              console.log("🔌 becoming receiver");

              // create a WS source (if it doesn't already exist)
              Promise.resolve(sources.find(({ _tag }) => _tag === "WsSource"))
                .then((src) => {
                  return src
                    ? Promise.resolve(src)
                    : wsSource({ name: "WS_SRC", debug: false }).then((src) => {
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
                    debug: false,
                  }).then((sink) => {
                    sinks.push(sink);
                    return sink;
                  });
                })

                // connect them together
                .then((sink) => connectSink("WS_SRC", sink))

                // send message to remote
                .then((_) => {
                  /* TODO: Implement this! */
                })

                // send error to remote
                .catch((err) => console.error(`💀 error becoming receiver`, err));
              break;

            case "unbecome_receiver":
              // find the sink named "UDP_SINK_<from>"
              const i = sinks.findIndex(({ name }) => name === `UDP_SINK_${msg.from}`);

              if (i >= 0) {
                console.log(`🔌 removing UDP sink from ${msg.from}`);
                sinks.splice(i, 1);

                console.log(`🔌 unsubscribing all flows from ${msg.from}`);
                const j = connections.findIndex((conn) => conn.from === msg.from);

                if (j >= 0) {
                  connections[j].subscription.unsubscribe();
                  connections.splice(j, 1);
                }
              } else {
                console.log(`💀 Uh Oh! Can't find UDP_SINK_${msg.from}`);
              }
              break;

            case "become_sender":
              console.log("🔌 becoming sender");
              if (isSending) {
                console.log("you're already a sender!");
                return;
              }

              // create a UDP source
              udpSource({
                name: "UDP_SRC",
                address: "127.0.0.1",
                port: 7002,
                debug: false,
              })
                .then((src) => {
                  console.log(`🔌 udp source created ${src.name} ${src.address} ${src.port}`);
                  sources.push(src);
                  return src;
                })

                // create a WS sink (if it doesn't already exist)
                .then((_) =>
                  wsSink({ name: "WS_SINK", debug: false }).then((sink) => {
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
                  console.log(`🔌 sending ${isSending}`);
                })

                // send error to remote
                .catch((err) => console.error("💀 error becoming sender", err));
              break;

            case "remote_state":
              win?.webContents.send("remote_state", msg.state);
              break;
          }
        };
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
