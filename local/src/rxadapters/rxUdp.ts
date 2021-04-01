import * as dgram from "dgram";
import * as Rx from "rxjs";
import { logger } from "../log";

export function observableFromUdp(socket: dgram.Socket): Rx.Observable<Buffer> {
  return new Rx.Observable<Buffer>((observer) => {
    socket.on("message", (msg: Buffer) => observer.next(msg));
    socket.on("error", (err) => observer.error(err));
    socket.on("close", () => observer.complete());
  });
}

export function observerToUdp(
  address: string,
  port: number,
  socket: dgram.Socket
): Rx.Observer<Buffer> {
  return {
    next: (buffer) => socket.send(buffer, 0, buffer.byteLength, port, address),
    error: (_err) => socket.close(),
    complete: () => socket.close(),
  };
}
