import { Ref, ref } from "@vue/composition-api";
import { Client, Connection, WsMessage } from "shared";

let websocket: WebSocket | undefined = undefined;

export const clientName: Ref<string> = ref("");
export const clients: Ref<Client[]> = ref([]);
export const clientMap: Ref<Connection[]> = ref([]);

export function ws(): Readonly<WebSocket | undefined> {
  return websocket;
}

export function registerUiWithRemote(remoteUrl: string): Promise<WebSocket> {
  return new Promise((resolve) => {
    websocket = new WebSocket(remoteUrl);
    resolve(websocket);

    websocket.onopen = (evt) => {
      console.log(`⚡ WS connection to remote streamer established.`);
      websocket?.send(JSON.stringify({ type: "register_ui", from: "ui" }));
    };

    websocket.onmessage = (msg: MessageEvent<WsMessage>) => {
      switch (msg.type) {
        case "remote/registered":
          // TODO: Should we only resolve this promise once we have confirmation
          //       that the UI is registered?
          // resolve(websocket as WebSocket);
          break;

        case "remote/state":
          (payload: { clients: Client[]; clientMap: Connection[] }) => {
            clients.value = payload.clients;
            clientMap.value = payload.clientMap;
          };
          break;
      }
    };

    websocket.send(JSON.stringify({ type: "register_ui" }));
  });
}
