import Peer, { DataConnection } from "peerjs";
import { reactive } from "vue";

import {
  ConsumerConnectionDetails,
  ProducerConnectionDetails,
} from "./types.js";

export const clientTypes = ["Sender", "Receiver", "Both", "Offline"] as const;
export type ClientType = (typeof clientTypes)[number];

export interface Store {
  identity?: Peer;
  roomName?: string;
  incomingDataPort: number;
  dataConnections?: DataConnection[];
  clientType: ClientType;
  clientName: string;
  connectionServer: {
    https: boolean;
    host: string;
    port: number;
  };
  consumerConnectionDetails: ConsumerConnectionDetails;
  producerConnectionDetails: ProducerConnectionDetails;
}

export const store = reactive<Store>({
  clientType: "Both",
  clientName: "",
  incomingDataPort: 8000,
  connectionServer: {
    https: true,
    host: "seashell-app-u7jay.ondigitalocean.app",
    port: 443,
  },
  consumerConnectionDetails: {
    address: "127.0.0.1",
    port: 7000,
  },
  producerConnectionDetails: {
    type: "AxisStudio",
    address: "127.0.0.1",
    port: 7004,
  },
});

export function connectionServerBaseUrl(): string {
  return `http${store.connectionServer.https ? "s" : ""}://${
    store.connectionServer.host
  }:${store.connectionServer.port}`;
}
