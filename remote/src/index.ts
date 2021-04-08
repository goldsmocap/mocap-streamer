import http from "http";
import express from "express";
import { Server } from "socket.io";
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
    origin: "*",
  },
});

let uis: string[] = [];
let clients: Client[] = [];
let clientMap: [Client, Client][] = [];

io.on("connection", (socket) => {
  logger.info(`⚡ WS connected.`, { socketId: socket.id });

  // on disconnect remove this client and any mapping to or from the
  // disconnected socket.
  socket.on("disconnect", () => {
    logger.info(`⚡ WS disconnected.`, { socketId: socket.id });

    const i = clients.findIndex((client) => client.socketId === socket.id);
    if (i >= 0) {
      logger.info(`🌫️ Client removed.`, { socketId: socket.id });
      clients.splice(i, 1);
    }

    const j = uis.findIndex((ui) => ui === socket.id);
    if (j >= 0) {
      logger.info(`🎨 UI removed.`, { socketId: socket.id });
      uis.splice(j, 1);
    }
  });

  socket.on("ui", (callback) => {
    logger.info(`🎨 UI registered.`);
    uis.push(socket.id);
    socket.join("ui_room");
    callback();
  });

  socket.on("join", (name: string, callback) => {
    // has this name already been taken?
    const nameTaken = clients.find((client) => client.name === name);
    if (nameTaken) {
      callback(err({ msg: "🌫️ Name already taken" }));
      return;
    }

    // has the socket id already been assigned a name?
    const clientExists = clients.find(
      (client) => client.socketId === socket.id
    );
    if (clientExists) {
      callback({ msg: "🌫️ Client already joined" });
      return;
    }

    // add the client
    logger.info(`🌫️ Client ${name} joined.`);
    clients.push({ name, socketId: socket.id });

    // send the client list and mappings to all UIs
    io.in("ui_room").emit("remote/state", { clients, clientMap });
    callback(ok());
  });

  socket.on("rename", (oldName: string, newName: string, callback) => {
    // find the old name
    const old = clients.find((client) => client.name === oldName);
    if (old) {
      logger.info(`🌫️ Renamed client from ${oldName} to ${newName}.`);
      old.name = newName;
      callback(ok());
      return;
    }

    callback(err({ msg: `unable to find client with name ${oldName}` }));
  });

  socket.on("map/to", (name: string, callback) => {
    // have you connected?
    const connected = clients.find((client) => client.socketId === socket.id);
    if (!connected) {
      callback(err({ msg: "you have not joined the server." }));
      return;
    }

    // does the client you are trying to connect to exist?
    const clientExists = clients.find((client) => client.name === name);
    if (!clientExists) {
      callback(err({ msg: `no client with name ${name} found.` }));
      return;
    }

    // does the mapping already exist
    const mapping = clientMap.find(
      ([from, to]) => from.name === connected.name && to.name === name
    );
    if (mapping) {
      callback(err({ msg: `mapping already exists.` }));
      return;
    }

    const clientFrom = connected;
    const clientTo = clientExists;
    logger.info(`🌫️ Mapped ${clientFrom.name} -> ${clientTo.name}.`);
    clientMap.push([clientFrom, clientTo]);
    callback(ok());
  });

  // on receipt of a message pass it on to all mapped clients
  socket.on("message", (msg) => {
    clientMap
      .filter(([from]) => from.socketId === socket.id)
      .forEach(([from, to]) => {
        io.to(to.socketId).emit<any>("message", { from: from.name, data: msg });
      });
  });
});

// start the Express server
///////////////////////////////////////////////////////////////////////////////
const port = 3000; // default port to listen on
httpServer.listen(port, () => {
  logger.info(`🎉 Remote streamer started at http://localhost:${port}`);
});
