import { Observer } from "rxjs";
import { getRemoteWs } from "../../remote";
import { observerToWs } from "../../rxadapters/rxWs";

export interface WsSinkOptions {
  name: string;
}

export interface WsSink {
  kind: "WsSink";
  name: string;
  observer: Observer<any>;
}

export function wsSink(options: WsSinkOptions): Promise<WsSink> {
  return getRemoteWs().then((ws) => {
    const observer = observerToWs(ws);
    return {
      kind: "WsSink",
      name: options.name,
      observer,
    };
  });
}
