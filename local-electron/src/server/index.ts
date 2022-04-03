import type { Ref } from "vue";
import type { ClientRole } from "../../../shared/dist/clients";

import { computed, ref } from "vue";
import { joinRemoteMsg, serialize } from "../../../shared/messages";

export type Response = {
  status: number;
  msg?: string;
};

export const nameOnRemote: Ref<string | undefined> = ref(undefined);
export const managingLocalServer = computed(() => (nameOnRemote.value ? true : false));

export function joinRemote(name: string, role: ClientRole, ws: WebSocket) {
  ws.send(serialize(joinRemoteMsg(name, role)));
}

export { getSinkUdp, postSink } from "./sinkRoutes";
export { postSource } from "./sourceRoutes";
