import type { Ref } from "vue";
import type { Either } from "fp-ts/Either";
import type { ClientSummaryState } from "shared/dist/clients";
import type { WsMessage } from "shared/dist/messages";

import { ref } from "vue";
import { right, left } from "fp-ts/Either";
import { registerUi, serialize } from "shared/dist/messages";
import { nameOnRemote, managingLocalServer } from "./local";

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

export type RegistrationError = WebSocketAlreadyConnected | WebSocketConnecting | WebSocketClosed;

///////////////////////////////////////////////////////////////////////////////////////////////////

let remoteWs: WebSocket | undefined = undefined;

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

export function registerUiWithRemote(
  wsUrl: string,
  onRemoteDisconnect: () => void
): Promise<Either<RegistrationError, WebSocket>> {
  return new Promise((resolve, reject) => {
    switch (remoteWs?.readyState) {
      case WebSocket.OPEN:
        resolve(left(webSocketAlreadyConnected(remoteWs as WebSocket)));
        break;

      case WebSocket.CONNECTING:
        resolve(left(webSocketConnecting));
        break;

      default:
        remoteBaseUrl.value = wsUrl.replace("ws://", "");
        remoteWs = new WebSocket(wsUrl);

        remoteWs.onopen = () => {
          console.log("⚡ WS connection to remote streamer established.");
          remoteWs?.send(serialize(registerUi));
          resolve(right(remoteWs as WebSocket));
        };

        remoteWs.onclose = () => {
          console.log(`⚡ WS disconnected from remote streamer.`);
          onRemoteDisconnect();
          resolve(left(webSocketClosed));
        };
        remoteWs.onerror = (err) => {
          console.log("⚡ WS failed to connect!");
          onRemoteDisconnect();
          reject(err);
        };

        remoteWs.onmessage = (evt: MessageEvent) => {
          const msg = JSON.parse(evt.data) as WsMessage;

          switch (msg._tag) {
            case "remote_state":
              handleRemoteState(msg.state);
              break;
          }
        };
    }
  });
}
