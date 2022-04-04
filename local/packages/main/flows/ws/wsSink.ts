import { Observer } from "rxjs";
import { match, P } from "ts-pattern";
import { getRemoteWs, GetWebSocketError } from "../../remoteWs";
import { observerToWs } from "../../rxadapters/rxWs";

export interface WsSinkOptions {
  name: string;
  debug?: boolean;
}

export interface WsSink {
  _tag: "WsSink";
  name: string;
  observer: Observer<any>;
}

export function wsSink(options: WsSinkOptions): Promise<GetWebSocketError | WsSink> {
  return getRemoteWs().then((ws) => {
    return match(ws)
      .with({ _tag: "Right", right: P.select() }, (ws) => {
        const observer = observerToWs(ws, options.debug);
        return {
          _tag: "WsSink",
          name: options.name,
          observer,
        } as WsSink;
      })
      .with({ _tag: "Left", left: P.select() }, (err) => err)
      .run();
  });
}
