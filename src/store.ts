import Peer, { DataConnection } from "peerjs";
import { reactive } from "vue";

export interface Store {
  identity?: Peer;
  dataConn?: DataConnection;
  clientType: "Sender" | "Receiver" | "Both";
}

export const store = reactive<Store>({ clientType: "Both" });
