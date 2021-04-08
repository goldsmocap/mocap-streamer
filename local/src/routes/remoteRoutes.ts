import express, { Router } from "express";
import { WsResult } from "../wsResult";
import { logger } from "../log";
import { joinRemote, getRemoteWs, getRemoteName } from "../remote";

export function remoteRoutes(): Router {
  const router = express.Router();

  router.get("/name", (req, res) => {
    getRemoteName()
      .then((name) => res.send(name))
      .catch((err) =>
        res.status(400).send("You haven't joined the remote streamer.")
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

  router.get("/connect/to/:name", (req, res) => {
    getRemoteWs()
      .then((ws) => {
        const name = req.params["name"];
        ws.emit("map/to", name, (wsRes: WsResult<any>) => {
          switch (wsRes.status) {
            case "OK":
              logger.info(`☁️ Successfully mapped to ${name}.`);
              res.send("");
              break;

            case "ERR":
              logger.info(`☁️ Failed to map to ${name}.`, { msg: wsRes.msg });
              res.status(402).send(wsRes.msg);
              break;
          }
        });
      })
      .catch((_) => {
        logger.info(`☁️ Unable to map to another client. You must join first.`);
        res.status(401).send("You must join first.");
      });
  });

  return router;
}
