import { Ref, ref } from "@vue/composition-api";
import { io, Socket } from "socket.io-client";
import { Client, Connection } from "shared";

let websocket: Socket | undefined = undefined;

export const clientName: Ref<string> = ref("");
export const clients: Ref<Client[]> = ref([]);
export const clientMap: Ref<Connection[]> = ref([]);

export function ws(): Readonly<Socket | undefined> {
  return websocket;
}

export function registerUiWithRemote(remoteUrl: string): Promise<Socket> {
  return new Promise((resolve, _reject) => {
    websocket = io(remoteUrl);

    websocket.on("connect", () => {
      console.log(`⚡ WS connection to remote streamer established.`);
      websocket?.emit("register_ui", () => {
        resolve(websocket as Socket);
      });
    });

    websocket.on(
      "remote/state",
      (payload: { clients: Client[]; clientMap: Connection[] }) => {
        clients.value = payload.clients;
        clientMap.value = payload.clientMap;
      }
    );
  });
}
