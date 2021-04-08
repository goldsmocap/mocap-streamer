import express, { Router } from "express";
import { WsResult } from "../wsResult";
import { logger } from "../log";
import { getRemoteWs } from "../websockets";

export function remoteRoutes(): Router {
  const router = express.Router();

  router.post("/join/:name", (req, res) => {
    const name = req.params["name"];
    const url = req.body["url"];

    if (url.length > 0) {
      const ws = getRemoteWs(url);
      if (ws) {
        logger.info(`${name} attempting to join.`);
        ws.emit("join", name, (wsRes: WsResult<any>) => {
          switch (wsRes.status) {
            case "OK":
              logger.info(`${name} joined.`);
              res.send("");
              break;

            case "ERR":
              logger.info(`${name} failed to join.`);
              res.status(400).send(wsRes.msg);
              break;
          }
        });
      } else {
        res.status(401).send("You must join first.");
      }
    }
  });

  router.get("/connect/to/:name", (req, res) => {
    const ws = getRemoteWs();
    if (ws) {
      const name = req.params["name"];
      ws.emit("map/to", name, (wsRes: WsResult<any>) => {
        switch (wsRes.status) {
          case "OK":
            res.send("");
            break;

          case "ERR":
            res.status(402).send(wsRes.msg);
            break;
        }
      });
    } else {
      res.status(401).send("You must join first.");
    }
  });

  return router;
}
