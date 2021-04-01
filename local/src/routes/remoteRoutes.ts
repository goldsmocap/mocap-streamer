import express, { Router } from "express";
import { Socket } from "socket.io-client";
import { WsResult } from "../wsResult";
import { logger } from "../log";

export function remoteRoutes(ws: Socket): Router {
  const router = express.Router();

  router.get("/join/:name", (req, res) => {
    const name = req.params["name"];
    logger.info(`${name} attempting to join.`);
    ws.emit("join", name, (wsRes: WsResult<any>) => {
      switch (wsRes.status) {
        case "OK":
          res.send("");
          break;

        case "ERR":
          res.status(402).send(wsRes.msg);
          break;
      }
    });
  });

  router.get("/connect/to/:name", (req, res) => {
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
  });

  return router;
}
