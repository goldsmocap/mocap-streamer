import Peer, { DataConnection } from "peerjs";
import { reactive } from "vue";

export interface Store {
  identity?: Peer;
  roomName?: string;
  dataConnections?: DataConnection[];
  clientType: "Sender" | "Receiver" | "Both";
  connectionServer: {
    https: boolean;
    host: string;
    port: number;
  };
}

export const store = reactive<Store>({
  clientType: "Both",
  connectionServer: {
    https: true,
    host: "mocap-streamer-server-ljd7v.ondigitalocean.app",
    port: 443,
  },
});

export function connectionServerBaseUrl(): string {
  return `http${store.connectionServer.https ? "s" : ""}://${
    store.connectionServer.host
  }:${store.connectionServer.port}`;
}
