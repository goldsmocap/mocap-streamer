import { io, Socket } from "socket.io-client";
import { logger } from "./log";

let remoteWs: Socket | undefined = undefined;

export function getRemoteWs(url?: string): Socket | undefined {
  if (remoteWs) {
    return remoteWs;
  }

  if (url) {
    remoteWs = io(url);
  }
  return remoteWs;
}
