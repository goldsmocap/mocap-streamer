import { io, Socket } from "socket.io-client";
import { WsResult } from "./wsResult";
import { logger } from "./log";
import { connectSink, sinks, sources } from "./flows";
import { wsSink, wsSource } from "./flows/ws";
import { udpSink, udpSource } from "./flows/udp";

let udpSinkCount = 0;
let isSending = false;

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

      remoteWs.on("remote/become/receiver", (from: string) => {
        logger.info("becoming receiver");

        // create a WS source (if it doesn't already exist)
        Promise.resolve(sources.find(({ kind }) => kind === "WsSource"))
          .then((src) => {
            return src
              ? Promise.resolve(src)
              : wsSource({ name: "WS_SRC" }).then((src) => {
                  sources.push(src);
                  return src;
                });
          })

          // create a new UDP sink
          .then((src) => {
            return udpSink({
              name: `UDP_SINK_${udpSinkCount++}`,
              sender: from,
              fromAddress: "127.0.0.1",
              toAddress: "127.0.0.1",
            }).then((sink) => {
              sinks.push(sink);
              return sink;
            });
          })

          // connect them together
          .then((sink) => connectSink("WS_SRC", sink))

          // send message to UI with details
          .then((_) => {
            // TODO: Implement this!
          })

          // handle error
          .catch((err) => {
            // TODO: Implement this!
          });
      });

      remoteWs.on("remote/become/sender", (to: string) => {
        logger.info("becoming sender");
        if (isSending) {
          // TODO: send message to UI with details
          logger.info("you're already a sender!");
          return;
        }

        // create a UDP source
        udpSource({
          name: "UDP_SRC",
          address: "127.0.0.1",
          port: 7002,
        })
          .then((src) => {
            sources.push(src);
            return src;
          })

          // create a WS sink (if it doesn't already exist)
          .then((_) =>
            wsSink({ name: "WS_SINK" }).then((sink) => {
              sinks.push(sink);
              return sink;
            })
          )

          // connect them together
          .then((sink) => connectSink("UDP_SRC", sink))

          // send message to UI with details
          .then((_) => {
            isSending = true;
            // TODO: Implement this!
          })

          // handle error
          .catch((err) => {
            // TODO: Implement this!
          });
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
    // you are already connected so there's nothing to do except asking
    // the remote to send it's state again.
    return getRemoteWs().then((ws) => {
      ws.emit("state");
      return ws;
    });
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
