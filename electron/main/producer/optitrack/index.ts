import { connectionTypeMapping } from "./cDefinitions.js";

const optitrackBridge = require("bindings")("optitrackBridge");

export function optitrackObserver() {
  console.log(optitrackBridge.hello());
  console.log(
    optitrackBridge.clientConnect({
      connectionType: connectionTypeMapping.ConnectionType_Multicast,
      serverCommandPort: 1510,
      serverDataPort: 1511,
      serverAddress: "172.16.3.33",
      localAddress: "172.16.1.110",
      multicastAddress: "239.255.42.99",
      subscribedDataOnly: true,
    })
  );
}
