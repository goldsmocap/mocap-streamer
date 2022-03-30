import path from "path";
import http from "http";
import express from "express";
import cors from "cors";
import { logger } from "shared";
import { sinkRoutes, sourceRoutes, apiRoutes } from "./routes";

export default function run() {
  // setup express
  /////////////////////////////////////////////////////////////////////////////
  const app = express();
  const httpServer = new http.Server(app);

  // apply middleware
  /////////////////////////////////////////////////////////////////////////////
  app.use(cors({ origin: ["http://localhost:8080", "http://localhost:8081"] }));
  app.use(express.json()); // json body parser

  // initialise routes
  /////////////////////////////////////////////////////////////////////////////
  app.use("/api", apiRoutes);
  app.use("/api/flow", sourceRoutes);
  app.use("/api/flow", sinkRoutes);
  app.use("/", express.static(path.join(__dirname, "/public")));

  // start the Express server
  /////////////////////////////////////////////////////////////////////////////
  const PORT = 4000;
  httpServer.listen(PORT, () => {
    logger.info(`🎉 Local streamer started at http://localhost:${PORT}`);
  });
}

run();
