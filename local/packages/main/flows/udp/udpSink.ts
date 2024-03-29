import dgram from "dgram";
import { Observer } from "rxjs";
import { observerToUdp } from "../../rxadapters/rxUdp";
import { useUdpSocket } from "./useUdpSocket";

const sendingSockets: dgram.Socket[] = [];
let nextPort = 5001;

export function incPort() {
  nextPort = nextPort + 1;
}

export interface UdpSinkOptions {
  name: string;
  sender?: string;
  fromPort?: number;
  fromAddress?: string;
  toPort?: number;
  toAddress?: string;
  debug?: boolean;
}

export interface UdpSink {
  _tag: "UdpSink";
  name: string;
  sender?: string;
  fromPort: number;
  fromAddress: string;
  toPort: number;
  toAddress: string;
  observer: Observer<any>;
}

export function udpSink(options: UdpSinkOptions): Promise<UdpSink> {
  const fromAddress = options.fromAddress ?? "0.0.0.0";
  const fromPort = options.fromPort ?? 5000;

  // find socket (if it already exists)
  let existingSocket = sendingSockets.find((socket) => {
    const addr = socket.address().address;
    const port = socket.address().port;

    return addr === fromAddress && port === fromPort;
  });

  // if a socket is found then return it in a promise, else create a new
  // one wrapped in a promise and add it to the list of sending sockets.
  const socket = existingSocket
    ? Promise.resolve(existingSocket)
    : useUdpSocket(fromPort, fromAddress).then((socket) => {
        sendingSockets.push(socket); // add the new sending socket
        return socket;
      });

  // create a new observer from the socket to observe the source
  const toAddress = options.toAddress ?? "127.0.0.1";
  const toPort = options.toPort ?? nextPort;
  return socket
    .then((socket) => observerToUdp(toAddress, toPort, socket, options.sender, options.debug))
    .then((observer) => {
      return {
        _tag: "UdpSink",
        name: options.name,
        sender: options.sender,
        fromPort,
        fromAddress,
        toPort,
        toAddress,
        observer,
      };
    });
}
