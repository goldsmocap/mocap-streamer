import { ref, Ref } from "@vue/composition-api";
import { io, Socket } from "socket.io-client";

export const clients: Ref<string[]> = ref([]);

export function registerUiWithRemote(remoteUrl: string): Promise<Socket> {
  return new Promise((resolve, _reject) => {
    const ws = io(remoteUrl);

    ws.on("connect", () => {
      console.log(`⚡ WS connection to local Axis-Streamer established.`);
      ws.emit("ui", () => {
        resolve(ws);
      });
    });
    ws.on("disconnect", () => {
      console.log(`⚡ WS disconnected from remote Axis-Streamer.`);
    });
    ws.on("remote/state", (payload) => {
      console.log(payload);
    });
  });
}
