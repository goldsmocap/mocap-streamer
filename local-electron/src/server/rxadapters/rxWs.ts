import * as Rx from "rxjs";

export function observableFromWs<T>(ws: WebSocket): Rx.Observable<T> {
  return new Rx.Observable<T>((observer) => {
    ws.onmessage = (evt: MessageEvent<T>) => {
      observer.next(evt.data);
    };
    ws.onclose = () => {
      observer.complete;
    };
  });
}

export function observerToWs(ws: WebSocket, debug?: boolean): Rx.Observer<any> {
  return {
    next: (t) => {
      if (debug) console.log(`WsSink received ${t.length}.`);
      ws.send(JSON.stringify(t));
    },
    error: (_err) => ws.close(),
    complete: () => ws.close(),
  };
}
