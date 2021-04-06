import { ConnectableObservable, Subject } from "rxjs";
import { multicast } from "rxjs/operators";
import { Socket } from "socket.io-client";
import { observableFromWs } from "../../rxadapters/rxWs";
import { logger } from "../../log";

export interface WsSourceOptions {
  debug?: boolean;
}

export function wsSource(
  ws: Socket,
  options: WsSourceOptions
): Promise<ConnectableObservable<any>> {
  // create a new subject
  const subject = new Subject<any>();

  // create a new observable from the socket and multicast it through the subject
  const observable = observableFromWs(ws);
  const multicasted = observable.pipe(
    multicast(subject)
  ) as ConnectableObservable<any>;

  if (options.debug ?? false) {
    multicasted.subscribe({
      next: (buf) => logger.info(`WsSource received ${buf.length}`),
    });
    multicasted.connect();
  }

  return Promise.resolve(multicasted);
}
