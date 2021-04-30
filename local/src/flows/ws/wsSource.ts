import { ConnectableObservable, Subject } from "rxjs";
import { multicast } from "rxjs/operators";
import { getRemoteWs } from "../../remote";
import { observableFromWs } from "../../rxadapters/rxWs";
import { logger } from "../../log";

export interface WsSourceOptions {
  name: string;
  debug?: boolean;
}

export interface WsSource {
  kind: "WsSource";
  name: string;
  observable: ConnectableObservable<any>;
}

export function wsSource(options: WsSourceOptions): Promise<WsSource> {
  return getRemoteWs().then((ws) => {
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

    return {
      kind: "WsSource",
      name: options.name,
      observable: multicasted,
    };
  });
}
