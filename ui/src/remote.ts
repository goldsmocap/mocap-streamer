import WebSocket from "ws";
import { useWebSocket } from "@vueuse/core";
import { useRouter } from "vue-router";

export type WsSend = (data: string | ArrayBuffer | Blob, useBuffer?: boolean) => boolean;

export function joinRemote(remoteUrl: string): WsSend {
  const { status, data, send } = useWebSocket(remoteUrl, {
    autoReconnect: {
      retries: 3,
      onFailed: () => {
        // on
      },
    },
  });

  return send;
}
