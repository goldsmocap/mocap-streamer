import path from "path";
import express from "express";
import cors from "cors";
import { io } from "socket.io-client";
import { remoteRoutes, sinkRoutes, sourceRoutes } from "./routes";
import { logger } from "./log";

// setup express with websocket
///////////////////////////////////////////////////////////////////////////////
const app = express();

const AXIS_STREAMER_SERVER_URL =
  process.env.NODE_ENV === "production"
    ? "http://46.101.24.208"
    : "http://localhost:3000";
const ws = io(AXIS_STREAMER_SERVER_URL);

// apply middleware
///////////////////////////////////////////////////////////////////////////////
app.use(cors({ origin: ["http://localhost:8080", "http://localhost:8081"] }));
app.use(express.json()); // json body parser

// initialise routes
///////////////////////////////////////////////////////////////////////////////
app.use("/api/flow", sourceRoutes(ws));
app.use("/api/flow", sinkRoutes(ws));
app.use("/api/remote", remoteRoutes(ws));
app.use(express.static(path.join(__dirname, "public")));

// start the Express server
///////////////////////////////////////////////////////////////////////////////
const PORT = 4000;
app.listen(PORT, () => {
  logger.info(`client started at http://localhost:${PORT}`);
});
