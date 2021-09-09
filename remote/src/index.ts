import http from "http";
import express from "express";
import { Server } from "socket.io";
import { Client } from "shared";
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
    origin: [
      "http://localhost:8080",
      "http://localhost:4000",
      "http://192.168.1.85:8080",
      "http://192.168.1.85:4000",
      "*",
    ],
  },
});

let uis: string[] = [];
let clients: Client[] = [];
let clientMap: [Client, Client][] = [];

function map(fromName: string, toName: string, callback?: any) {
  // does the first client (from) exist?
  const fromClient = clients.find((client) => client.name === fromName);
  if (!fromClient) {
    if (callback)
      callback(err({ msg: `no client with name ${fromName} found.` }));
    return;
  }

  // does the second client (to) exist?
  const toClient = clients.find((client) => client.name === toName);
  if (!toClient) {
    if (callback)
      callback(err({ msg: `no client with name ${toName} found.` }));
    return;
  }

  // does the mapping already exist
  const mapping = clientMap.find(([from, to]) => {
    return from.name === fromName && to.name === toName;
  });
  if (mapping) {
    if (callback) callback(err({ msg: `mapping already exists.` }));
    return;
  }

  logger.info(`🌫️ Mapped ${fromClient.name} -> ${toClient.name}.`);
  clientMap.push([fromClient, toClient]);

  // send message to 'from' to set up as a sender
  io.to(fromClient.socketId).emit("remote/become/sender", toClient.name);

  // send message to 'to' to setup as a receiver
  io.to(toClient.socketId).emit("remote/become/receiver", fromClient.name);

  // send the client list and mappings to all UIs
  io.in("ui_room").emit("remote/state", { clients, clientMap });

  if (callback) callback(ok());
}

io.on("connection", (socket) => {
  logger.info(`⚡ WS connected.`, { socketId: socket.id });

  // on disconnect remove this client and any mapping to or from the
  // disconnected socket.
  socket.on("disconnect", () => {
    logger.info(`⚡ WS disconnected.`, { socketId: socket.id });

    const i = clients.findIndex((client) => client.socketId === socket.id);
    if (i >= 0) {
      logger.info(`🌫️ All mappings to and from ${clients[i].name} removed.`);
      clientMap = clientMap.filter(
        ([from, to]) =>
          !(from.socketId === socket.id || to.socketId === socket.id)
      );

      logger.info(`🌫️ Client ${clients[i].name} removed.`);
      clients.splice(i, 1);
    }

    const j = uis.findIndex((ui) => ui === socket.id);
    if (j >= 0) {
      logger.info(`🎨 UI removed.`, { socketId: socket.id });
      uis.splice(j, 1);
    }
  });

  socket.on("register_ui", (callback) => {
    logger.info(`🎨 UI registered.`);
    uis.push(socket.id);
    socket.join("ui_room");
    if (callback) callback();
  });

  // sends the state to all registered uis
  socket.on("state", () => {
    io.in("ui_room").emit("remote/state", { clients, clientMap });
  });

  socket.on("join", (name: string, callback) => {
    // has this name already been taken?
    const nameTaken = clients.find((client) => client.name === name);
    if (nameTaken) {
      if (callback) callback(err({ msg: "🌫️ Name already taken" }));
      return;
    }

    // has the socket id already been assigned a name?
    const clientExists = clients.find(
      (client) => client.socketId === socket.id
    );
    if (clientExists) {
      if (callback) callback({ msg: "🌫️ Client already joined" });
      return;
    }

    // add the client
    logger.info(`🌫️ Client ${name} joined.`);
    clients.push({ name, socketId: socket.id });

    // auto wire client
    if (name.startsWith("rx_")) {
      console.log("🌫️ auto-wiring receiver");
      const transmitters = clients.filter(({ name }) => name.startsWith("tx_"));
      transmitters.forEach((tx) => map(tx.name, name));
    } else if (name.startsWith("tx_")) {
      console.log("🌫️ auto-wiring transmitter");
      const receivers = clients.filter(({ name }) => name.startsWith("rx_"));
      receivers.forEach((rx) => map(name, rx.name));
    }

    // send the client list and mappings to all UIs
    io.in("ui_room").emit("remote/state", { clients, clientMap });
    if (callback) callback(ok());
  });

  socket.on("rename", (oldName: string, newName: string, callback) => {
    // find the old name
    const old = clients.find((client) => client.name === oldName);
    if (old) {
      logger.info(`🌫️ Renamed client from ${oldName} to ${newName}.`);
      old.name = newName;

      // send the client list and mappings to all UIs
      io.in("ui_room").emit("remote/state", { clients, clientMap });

      if (callback) callback(ok());
      return;
    }

    if (callback)
      callback(err({ msg: `unable to find client with name ${oldName}` }));
  });

  socket.on("map", map);

  socket.on("unmap", (fromName: string, toName: string, callback) => {
    // does the mapping already exist
    const mappingIdx = clientMap.findIndex(([from, to]) => {
      return from.name === fromName && to.name === toName;
    });
    if (mappingIdx < 0) {
      if (callback) callback(err({ msg: `mapping doesn't exists.` }));
      return;
    }

    const [from, to] = clientMap[mappingIdx];

    clientMap.splice(mappingIdx, 1);

    // send the client list and mappings to all UIs
    io.in("ui_room").emit("remote/state", { clients, clientMap });

    // send message to 'to' to remove receiver
    io.to(to.socketId).emit("remote/unbecome/receiver", from.name);

    if (callback) callback(ok());
  });

  // on receipt of a message pass it on to all mapped clients
  socket.on("message", (msg) => {
    clientMap
      .filter(([from]) => from.socketId === socket.id)
      .forEach(([from, to]) => {
        io.to(to.socketId).emit<any>("message", {
          from: from.name,
          data: btoa(msg),
        });
      });
  });
});

// start the Express server
///////////////////////////////////////////////////////////////////////////////
const port = 3000; // default port to listen on
httpServer.listen(port, () => {
  logger.info(`🎉 Remote streamer started at http://localhost:${port}`);
});
