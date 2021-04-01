import http from "http";
import express from "express";
import { Server, ServerOptions } from "socket.io";
import { Client } from "./Client";
import { err, ok } from "./wsResult";
import { logger } from "./log";

const app = express();

// apply middleware
///////////////////////////////////////////////////////////////////////////////
app.use(express.json()); // json body parser

// start websocket
///////////////////////////////////////////////////////////////////////////////
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:4000", "http://localhost:4001"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let clients: Client[] = [];
let clientMap: [Client, Client][] = [];

io.on("connection", (socket) => {
  logger.info(`⚡ Unknown client connected... awaiting join message.`, {
    socketId: socket.id,
  });

  // on disconnect remove this client and any mapping to or from the
  // disconnected socket.
  socket.on("disconnect", () => {
    clients = clients.filter((client) => client.socketId !== socket.id);
  });

  // on receipt of a message pass it on to all mapped clients
  socket.on("message", (msg) => {
    clientMap
      .filter(([from]) => from.socketId === socket.id)
      .forEach(([from, to]) => {
        logger.info(`${msg.length} from: ${from.name}`);
        io.to(to.socketId).emit<any>("message", { from: from.name, data: msg });
      });
  });

  socket.on("join", (name: string, callback) => {
    // has this name already been taken?
    const nameTaken = clients.find((client) => client.name === name);
    if (nameTaken) {
      callback(err({ msg: "name already taken" }));
      return;
    }

    // has the socket id already been assigned a name?
    const clientExists = clients.find(
      (client) => client.socketId === socket.id
    );
    if (clientExists) {
      callback({ msg: "client already joined" });
      return;
    }

    // add the client
    logger.info(`⚡ Client ${name} joined.`, { socketId: socket.id });
    clients.push({ name, socketId: socket.id });
    callback(ok());
  });

  socket.on("map/to", (name: string, callback) => {
    // have you connected?
    const connected = clients.find((client) => client.socketId === socket.id);
    if (!connected) {
      callback(err({ msg: "you have not joined the server" }));
      return;
    }

    // does the client you are trying to connect to exist?
    const clientExists = clients.find((client) => client.name === name);
    if (!clientExists) {
      callback(err({ msg: `no client with name ${name} found` }));
      return;
    }

    const clientFrom = connected;
    const clientTo = clientExists;
    logger.info(`⚡ mapped ${clientFrom.name} to ${clientTo.name}`);
    clientMap.push([clientFrom, clientTo]);
    callback(ok());
  });
});

// start the Express server
///////////////////////////////////////////////////////////////////////////////
const port = 3000; // default port to listen
httpServer.listen(port, () => {
  logger.info(`server started at http://localhost:${port}`);
});
