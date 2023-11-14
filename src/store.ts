import Peer, { DataConnection } from "peerjs";
import { reactive } from "vue";

export interface Store {
  identity?: Peer;
  dataConn?: DataConnection;
}

export const store = reactive<Store>({});
