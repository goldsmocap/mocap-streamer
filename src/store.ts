import Peer, { DataConnection } from "peerjs";
import { reactive } from "vue";

export interface Store {
  identity?: Peer;
  roomName?: string;
  dataConnections?: DataConnection[];
  clientType: "Sender" | "Receiver" | "Both" | "Offline";
  clientName: string;
  connectionServer: {
    https: boolean;
    host: string;
    port: number;
  };
}

export const store = reactive<Store>({
  clientType: "Offline",
  clientName: "",
  connectionServer: {
    https: true,
    host: "seashell-app-u7jay.ondigitalocean.app",
    port: 443,
  },
});

export function connectionServerBaseUrl(): string {
  return `http${store.connectionServer.https ? "s" : ""}://${
    store.connectionServer.host
  }:${store.connectionServer.port}`;
}
