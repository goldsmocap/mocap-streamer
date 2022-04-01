import { ConnectableObservable, Subject } from "rxjs";
import { multicast } from "rxjs/operators";
import { match, P } from "ts-pattern";
import { logger } from "../../logging";
import { getRemoteWs, GetWebSocketError, WebSocketClosed, WebSocketConnecting } from "../../remote";
import { observableFromWs } from "../../rxadapters/rxWs";
import { Either } from "fp-ts/Either";

export interface WsSourceOptions {
  name: string;
  debug?: boolean;
}

export interface WsSource {
  _tag: "WsSource";
  name: string;
  observable: ConnectableObservable<any>;
}

export function wsSource(options: WsSourceOptions): Promise<GetWebSocketError | WsSource> {
  return getRemoteWs().then((ws) => {
    return match(ws)
      .with({ _tag: "Right", right: P.select() }, (ws) => {
        // create a new subject
        const subject = new Subject<any>();

        // create a new observable from the socket and multicast it through the subject
        const observable = observableFromWs(ws);
        const multicasted = observable.pipe(multicast(subject)) as ConnectableObservable<any>;

        if (options.debug ?? false) {
          multicasted.subscribe({
            next: (buf) => logger.info(`WsSource received ${buf.length}`),
          });
          multicasted.connect();
        }

        return {
          _tag: "WsSource",
          name: options.name,
          observable: multicasted,
        } as WsSource;
      })
      .with({ _tag: "Left", left: P.select() }, (err) => {
        return err as GetWebSocketError;
      })
      .run();
  });
}
