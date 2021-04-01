import { ConnectableObservable, Subject } from "rxjs";
import { multicast } from "rxjs/operators";
import { Socket } from "socket.io-client";
import { observableFromWs } from "../../rxadapters/rxWs";
import { logger } from "../../log";

export function wsSource(ws: Socket): Promise<ConnectableObservable<any>> {
  // create a new subject
  const subject = new Subject<any>();

  // create a new observable from the socket and multicast it through the subject
  const observable = observableFromWs(ws);
  const multicasted = observable.pipe(
    multicast(subject)
  ) as ConnectableObservable<any>;

  return Promise.resolve(multicasted);
}
