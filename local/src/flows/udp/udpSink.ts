import dgram from "dgram";
import { Observer } from "rxjs";
import { observerToUdp } from "../../rxadapters/rxUdp";
import { useUdpSocket } from "./useUdpSocket";
import { logger } from "../../log";

const sendingSockets: dgram.Socket[] = [];

export interface UdpSinkOptions {
  fromAddress?: string;
  fromPort?: number;
  toAddress: string;
  toPort: number;
}

export function udpSink(options: UdpSinkOptions): Promise<Observer<any>> {
  const fromAddr = options.fromAddress ?? "0.0.0.0";
  const fromPort = options.fromPort ?? 5000;

  // find socket (if it already exists)
  let existingSocket = sendingSockets.find((socket) => {
    const addr = socket.address().address;
    const port = socket.address().port;

    return addr === fromAddr && port === fromPort;
  });

  // if a socket is found then return it in a promise, else create a new
  // one wrapped in a promise and add it to the list of sending sockets.
  const socket = existingSocket
    ? Promise.resolve(existingSocket)
    : useUdpSocket(fromPort, fromAddr).then((socket) => {
        sendingSockets.push(socket); // add the new sending socket
        return socket;
      });

  // create a new observer from the socket to observe the source
  return socket.then((socket) => {
    return observerToUdp(options.toAddress, options.toPort, socket);
  });
}
