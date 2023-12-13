import * as dgram from "dgram";
import * as Rx from "rxjs";

export function observableFromUdp(
  socket: dgram.Socket,
  fps = 90
): Rx.Observable<Buffer> {
  return new Rx.Observable<Buffer>((observer) => {
    let toSend: { id: string; buf: Buffer }[] = [];
    socket.on("message", (msg: Buffer) => {
      let id = "";
      for (let i = 0; i < msg.length; i++) {
        if (msg.at(i) === 32) break;
        id += String.fromCharCode(msg.at(i));
      }
      if (toSend[0]?.id === id) {
        observer.next(
          Buffer.concat(
            toSend.sort((a, b) => (a.id > b.id ? 1 : -1)).map(({ buf }) => buf)
          )
        );
        toSend = [];
      }
      toSend.push({ id, buf: msg });
    });
    socket.on("error", (err) => observer.error(err));
    socket.on("close", () => observer.complete());
  }).pipe(Rx.throttleTime(1000 / fps));
}

export function observerToUdp(
  address: string,
  port: number,
  socket: dgram.Socket
): Rx.Observer<Buffer> {
  return {
    next: (msg) => socket.send(msg, 0, msg.byteLength, port, address),
    error: (_err) => socket.close(),
    complete: () => socket.close(),
  };
}
