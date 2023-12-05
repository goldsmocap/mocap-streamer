import Peer, { DataConnection } from "peerjs";
import { reactive } from "vue";

export interface Store {
  identity?: Peer;
  connectedConfig?: {
    dataConnections: DataConnection[];
    roomName: string;
  };
  clientType: "Sender" | "Receiver" | "Both";
}

export const store = reactive<Store>({ clientType: "Both" });
