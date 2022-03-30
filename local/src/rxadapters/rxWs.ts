import * as Rx from "rxjs";
import WebSocket from "ws";
import { logger } from "shared";

export function observableFromWs<T>(ws: WebSocket): Rx.Observable<T> {
  return new Rx.Observable<T>((observer) => {
    ws.on("message", function message(evt: MessageEvent<T>) {
      observer.next(evt.data);
    });
    ws.on("close", function () {
      observer.complete;
    });
  });
}

export function observerToWs(ws: WebSocket, debug?: boolean): Rx.Observer<any> {
  return {
    next: (t) => {
      if (debug) logger.info(`WsSink received ${t.length}.`);
      ws.send(JSON.stringify(t));
    },
    error: (_err) => ws.close(),
    complete: () => ws.close(),
  };
}
