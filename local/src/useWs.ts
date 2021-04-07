import { io, Socket } from "socket.io-client";

let ws: Socket | undefined = undefined;

export function useWs(url?: string): Socket | undefined {
  if (ws) {
    return ws;
  }

  if (url) ws = io(url);
  return ws;
}
