import { Observer } from "rxjs";
import { getRemoteWs } from "../../remote";
import { observerToWs } from "../../rxadapters/rxWs";

export interface WsSinkOptions {
  name: string;
  debug?: boolean;
}

export interface WsSink {
  kind: "WsSink";
  name: string;
  observer: Observer<any>;
}

export function wsSink(options: WsSinkOptions): Promise<WsSink> {
  return getRemoteWs().then((ws) => {
    const observer = observerToWs(ws, options.debug);
    return {
      kind: "WsSink",
      name: options.name,
      observer,
    };
  });
}
