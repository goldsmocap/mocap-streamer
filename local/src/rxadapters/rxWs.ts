import { Socket } from "socket.io-client";
import * as Rx from "rxjs";
import { logger } from "../log";

export function observableFromWs<T>(ws: Socket): Rx.Observable<T> {
  return new Rx.Observable<T>((observer) => {
    ws.on("message", (t: T) => observer.next(t));
    ws.on("disconnect", () => observer.complete());
  });
}

export function observerToWs(ws: Socket, debug?: boolean): Rx.Observer<any> {
  return {
    next: (t) => {
      if (debug) logger.info(`WsSink received ${t.length}.`);
      ws.emit("message", t);
    },
    error: (_err) => ws.close(),
    complete: () => ws.close(),
  };
}
