import { io, Socket } from "socket.io-client";
import { WsResult } from "./wsResult";
import { logger } from "./log";

let remoteWs: Socket | undefined = undefined;
let nameOnRemote: string | undefined = undefined;

export function getRemoteWs(url?: string): Promise<Socket> {
  return new Promise((resolve, reject) => {
    if (remoteWs) {
      resolve(remoteWs);
    }

    if (url) {
      remoteWs = io(url);
      remoteWs.on("connect", () => {
        logger.info(`⚡ WS connection to remote streamer established.`);
        resolve(remoteWs as Socket);
      });
      remoteWs.on("disconnect", () => {
        logger.info(`⚡ WS disconnected from remote streamer.`);
        remoteWs = undefined;
      });
      remoteWs.on("error", (err) => {
        reject(err);
      });
      remoteWs.on("connect_error", (err) => {
        reject(err);
      });
    }
  });
}

export function getRemoteName(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (nameOnRemote) resolve(nameOnRemote);
    else reject(nameOnRemote);
  });
}

export function joinRemote(url: string, name: string): Promise<Socket> {
  if (nameOnRemote === name) {
    // you are already connected so there's nothing to do!
    return getRemoteWs();
  }

  if (nameOnRemote && nameOnRemote !== name) {
    // rename this client
    return getRemoteWs().then((ws) => {
      return new Promise((resolve, reject) => {
        ws.emit("rename", nameOnRemote, name, (wsRes: WsResult<any>) => {
          switch (wsRes.status) {
            case "OK":
              nameOnRemote = name;
              resolve(ws);
              break;

            case "ERR":
              reject(wsRes.msg);
              break;
          }
        });
      });
    });
  }

  return getRemoteWs(url).then((ws) => {
    return new Promise((resolve, reject) => {
      ws.emit("join", name, (wsRes: WsResult<any>) => {
        switch (wsRes.status) {
          case "OK":
            nameOnRemote = name;
            resolve(ws);
            break;

          case "ERR":
            reject(wsRes.msg);
            break;
        }
      });
    });
  });
}
