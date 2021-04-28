import path from "path";
import http from "http";
import express from "express";
import cors from "cors";
import { remoteRoutes, sinkRoutes, sourceRoutes } from "./routes";
import { logger } from "./log";

export default function run() {
  // setup express with websocket
  ///////////////////////////////////////////////////////////////////////////////
  const app = express();
  const httpServer = new http.Server(app);

  // apply middleware
  ///////////////////////////////////////////////////////////////////////////////
  app.use(cors({ origin: ["http://localhost:8080", "http://localhost:8081"] }));
  app.use(express.json()); // json body parser

  // initialise routes
  ///////////////////////////////////////////////////////////////////////////////
  app.use("/api/flow", sourceRoutes());
  app.use("/api/flow", sinkRoutes());
  app.use("/api/remote", remoteRoutes());
  app.use("/", express.static(path.join(__dirname, "/public")));

  // start the Express server
  ///////////////////////////////////////////////////////////////////////////////
  const PORT = 4000;
  httpServer.listen(PORT, () => {
    logger.info(`🎉 Local streamer started at http://localhost:${PORT}`);
  });
}
