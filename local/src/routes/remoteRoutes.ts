import express, { Router } from "express";
import { WsResult } from "../wsResult";
import { logger } from "../log";
import { joinRemote, getRemoteWs, getRemoteName } from "../remote";

export function remoteRoutes(): Router {
  const router = express.Router();

  router.get("/name", (req, res) => {
    logger.info("getting name....");
    getRemoteName()
      .then((name) => res.send(name))
      .catch((err) =>
        res
          .status(400)
          .send({ message: "You haven't joined the remote streamer." })
      );
  });

  router.post("/join/:name", (req, res) => {
    const name = req.params["name"];
    const url = req.body["url"];

    if (url.length > 0) {
      joinRemote(url, name)
        .then((_ws) => {
          logger.info(`☁️ Joined remote streamer.`);
          res.send("");
        })
        .catch((err) => {
          logger.error(`☁️ Failed to join remote server.`);
          res.status(400).send(err);
        });
    }
  });

  router.get("/connect/:from/:to", (req, res) => {
    getRemoteWs()
      .then((ws) => {
        const fromName = req.params["from"];
        const toName = req.params["to"];
        ws.emit("map", fromName, toName, (wsRes: WsResult<any>) => {
          switch (wsRes.status) {
            case "OK":
              logger.info(`☁️ Successfully mapped ${fromName} to ${toName}.`);
              res.send("");
              break;

            case "ERR":
              logger.info(`☁️ Failed to map ${fromName} to ${toName}.`, {
                msg: wsRes.msg,
              });
              res.status(400).send(wsRes.msg);
              break;
          }
        });
      })
      .catch((_) => {
        logger.info(`☁️ Unable to map these clients. You must join first.`);
        res.status(401).send("You must join first.");
      });
  });

  router.get("/disconnect/:from/:to", (req, res) => {
    getRemoteWs()
      .then((ws) => {
        const fromName = req.params["from"];
        const toName = req.params["to"];
        ws.emit("unmap", fromName, toName, (wsRes: WsResult<any>) => {
          switch (wsRes.status) {
            case "OK":
              logger.info(
                `☁️ Successfully unmapped ${fromName} from ${toName}.`
              );
              res.send("");
              break;

            case "ERR":
              logger.info(`☁️ Failed to unmap ${fromName} from ${toName}.`, {
                msg: wsRes.msg,
              });
              res.status(402).send(wsRes.msg);
              break;
          }
        });
      })
      .catch((_) => {
        logger.info(`☁️ Unable to map these clients. You must join first.`);
        res.status(401).send("You must join first.");
      });
  });

  return router;
}
