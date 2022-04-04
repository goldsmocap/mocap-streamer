import * as Rx from "rxjs";
import { WebSocket } from "ws";
import { WsMessage, serialize, bvhFrameMsg } from "../../../../shared/messages";

export function observableFromWs(ws: WebSocket): Rx.Observable<string> {
  return new Rx.Observable((observer) => {
    ws.on("message", (raw) => {
      const msg = JSON.parse(raw.toString()) as WsMessage;

      switch (msg._tag) {
        case "bvh_frame":
          observer.next(JSON.stringify({ from: msg.from as string, base64: msg.base64 }));
          break;
      }
    });
    ws.on("close", () => {
      observer.complete;
    });
  });
}

export function observerToWs(ws: WebSocket, debug?: boolean): Rx.Observer<Buffer> {
  return {
    next: (buf) => {
      if (debug) console.log(`WsSink received ${buf.length}.`);
      ws.send(serialize(bvhFrameMsg(buf)));
    },
    error: (_err) => ws.close(),
    complete: () => ws.close(),
  };
}
