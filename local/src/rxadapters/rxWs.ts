import { Socket } from "socket.io-client";
import * as Rx from "rxjs";
import { logger } from "../log";

export function observableFromWs<T>(ws: Socket): Rx.Observable<T> {
  return new Rx.Observable<T>((observer) => {
    ws.on("message", (t: T) => observer.next(t));
    ws.on("disconnect", () => observer.complete());
  });
}

export function observerToWs(ws: Socket): Rx.Observer<any> {
  return {
    next: (t) => ws.emit("message", t),
    error: (_err) => ws.close(),
    complete: () => ws.close(),
  };
}
