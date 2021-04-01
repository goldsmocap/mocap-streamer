import { Observer } from "rxjs";
import { Socket } from "socket.io-client";
import { observerToWs } from "../../rxadapters/rxWs";

export function wsSink(ws: Socket): Promise<Observer<any>> {
  return Promise.resolve(observerToWs(ws));
}
