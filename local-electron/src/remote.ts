import type { Ref } from "vue";
import type { Either } from "fp-ts/Either";
import type { ClientSummaryState } from "../../shared/clients";
import type { WsMessage } from "../../shared/messages";

import { ref } from "vue";
import { right, left } from "fp-ts/Either";
import { match } from "ts-pattern";
import { nameOnRemote, managingLocalServer } from "./server";
import { connections, connectSink, sinks, sources } from "./server/flows";
import { wsSink, wsSource } from "./server/flows/ws";
import { udpSink, udpSource } from "./server/flows/udp";

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

let remoteWs: WebSocket | undefined = undefined;
export let isSending = false;

export const remoteBaseUrl: Ref<string | undefined> = ref(undefined);
export const remoteState: Ref<ClientSummaryState> = ref({ clients: [], clientMap: [] });

function handleRemoteState(state: ClientSummaryState) {
  // are you managing a local server?
  if (managingLocalServer.value) {
    // is the local server you are managing still connected to the remote server?
    const client = state.clients.find((client) => client.name === nameOnRemote.value);
    const clientFound = !!client;
    if (!clientFound) {
      console.log(`💃 local server has lost connection with remote.`);
      nameOnRemote.value = undefined;
    }
  }

  remoteState.value = state;
}

function handleDisconnect() {
  nameOnRemote.value = undefined;
  isSending = false;
}

export function newRemoteWs(
  url: string,
  onRemoteDisconnect: () => void
): Promise<Either<NewWebSocketError, WebSocket>> {
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

        remoteWs.onopen = () => {
          console.log(`⚡ WS connection to remote streamer established.`);
          resolve(right(remoteWs as WebSocket));
        };

        remoteWs.onclose = () => {
          console.log(`⚡ WS disconnected from remote streamer.`);
          handleDisconnect();
          onRemoteDisconnect();
          resolve(left(webSocketClosed));
        };
        remoteWs.onerror = (err) => {
          console.log("⚡ WS failed to connect!");
          handleDisconnect();
          onRemoteDisconnect();
          reject(err);
        };

        remoteWs.onmessage = (raw) => {
          const msg = JSON.parse(raw.data) as WsMessage;

          switch (msg._tag) {
            case "join_remote_success":
              nameOnRemote.value = msg.name;
              console.log(`💃 successfully joined remote with name ${nameOnRemote}`);
              break;

            case "rename_success":
              nameOnRemote.value = msg.name;
              break;

            case "become_receiver":
              console.log("becoming receiver");

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
                console.log(`🔌 removing UDP sink from ${msg.from}`);
                sinks.splice(i, 1);

                console.log(`🔌 unsubscribing all flows from ${msg.from}`);
                const j = connections.findIndex((conn) => conn.from === msg.from);

                if (j >= 0) {
                  connections[j].subscription.unsubscribe();
                  connections.splice(j, 1);
                }

                // TODO: send message to remote
              } else {
                console.log(`Uh Oh! Can't find UDP_SINK_${msg.from}`);

                // TODO: send error to remote
              }
              break;

            case "become_sender":
              console.log("becoming sender");
              if (isSending) {
                console.log("you're already a sender!");
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

            case "remote_state":
              handleRemoteState(msg.state);
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
