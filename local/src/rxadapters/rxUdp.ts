import * as dgram from "dgram";
import * as Rx from "rxjs";
import { logger } from "../log";

export function observableFromUdp(socket: dgram.Socket): Rx.Observable<Buffer> {
  return new Rx.Observable<Buffer>((observer) => {
    let buf = Buffer.alloc(0);

    socket.on("message", (msg: Buffer) => {
      // This is very specific to Axis-Neuron!
      //
      // if the message starts with a magic number 56831 then it's the start
      // of a new message so release the previous message and start a new one.
      const header = msg.readUInt16LE(0);
      if (header === 56831) {
        // release the previous buffer if it's not empty and reset it
        if (buf.length > 0) {
          observer.next(buf);
          buf = Buffer.alloc(0);
        }
      }

      // concatinate the message to the end of the buffer
      buf = Buffer.concat([buf, msg]);
    });
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
