import type { Ref } from "vue";

import { computed, ref } from "vue";
import { match, P } from "ts-pattern";
import { joinRemote, serialize } from "../../../shared/messages";
import { newRemoteWs } from "../remote";

export type Response = {
  status: number;
  msg?: string;
};

export const nameOnRemote: Ref<string | undefined> = ref(undefined);
export const managingLocalServer = computed(() => (nameOnRemote.value ? true : false));

export function postJoin(
  remoteUrl: string,
  name: string,
  onRemoteDisconnect: () => void
): Promise<Response> {
  return newRemoteWs(remoteUrl, onRemoteDisconnect)
    .then((wsOrErr) => {
      return match(wsOrErr)
        .with({ _tag: "Right", right: P.select() }, (ws) => {
          ws.send(serialize(joinRemote(name)));
          return { status: 200 };
        })
        .with({ _tag: "Left", left: { _tag: "WebSocketAlreadyConnected" } }, () => ({
          status: 500,
          msg: "⚡ WebSocket already connected to remote server.",
        }))
        .with({ _tag: "Left", left: P.any }, () => ({ status: 500, msg: "⚡ Oops" }))
        .run();
    })
    .catch(() => ({ status: 500, msg: `💀 Encountered an error` }));
}

export { getSinkUdp, postSink } from "./sinkRoutes";
export { postSource } from "./sourceRoutes";
