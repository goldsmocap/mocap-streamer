import http from "http";
import cors from "cors";
import express, { Router } from "express";
import { WebSocket } from "ws";
import { ClientRole, ClientState } from "../../shared/dist/clients";
import {
  WsMessage,
  becomeReceiverMsg,
  becomeSenderMsg,
  joinRemoteFailMsg,
  joinRemoteSuccessMsg,
  remoteStateMsg,
  renameSuccessMsg,
  serialize,
  unbecomeReceiverMsg,
} from "../../shared/dist/messages";
import { logger } from "./logging";
import "./types";

const app = express();

// state
///////////////////////////////////////////////////////////////////////////////
let debug = false;
const state: ClientState = {
  clients: [],
  clientMap: [],
};

// apply middleware
///////////////////////////////////////////////////////////////////////////////
app.use(cors({ origin: ["*"] }));
app.use(express.json()); // json body parser

// initialise websocket
///////////////////////////////////////////////////////////////////////////////
function removeAllMappings(clientName: string) {
  const i = state.clients.findIndex((client) => client.name === clientName);
  if (i >= 0) {
    logger.info(`🕸 All mappings to and from ${state.clients[i].name} removed.`);
    state.clientMap.filterInPlace(([from, to]) => {
      return !(from.name === clientName || to.name === clientName);
    });

    logger.info(`💃 Client ${state.clients[i].name} removed.`);
    state.clients.splice(i, 1);
  }

  // send the client list and mappings to all UIs
  // const wsMsg = newMsg({ type: "remote_state", payload: remoteState() });
  wss.clients.forEach((ws) => ws.send(serialize(remoteStateMsg(state))));
  // wss.getUis().forEach((ws) => ws.send(serialize(remoteState(state))));
}

const httpServer = http.createServer(app);
const wss = new WebSocket.Server({ server: httpServer });
wss.on("connection", (ws) => {
  logger.info(`⚡ WS connected.`);

  // on disconnect remove this client and any mapping to or from the
  // disconnected socket.
  ws.on("close", () => {
    logger.info("⚡ WS closed.", ws.name);
    if (ws.name) removeAllMappings(ws.name);
  });
  ws.on("disconnect", () => {
    logger.info("⚡ WS disconnected", ws.name);
    if (ws.name) removeAllMappings(ws.name);
  });
  ws.on("error", (err) => {
    logger.info("⚡ Ws connection error.", err);
    if (ws.name) removeAllMappings(ws.name);
  });

  // on receipt of a message pass it on to all mapped clients
  ws.on("message", (raw) => {
    const msg = JSON.parse(raw.toString()) as WsMessage;

    switch (msg._tag) {
      case "bvh_frame":
        if (debug) console.log(`frame received from ${ws.name}`);
        state.clientMap
          .filter(([from]) => from.name === ws.name)
          .forEach(([from, to]) => {
            msg.from = from.name;
            to.ws.send(serialize(msg));
          });
        break;

      case "join_remote":
        const name = msg.name as string;
        const role = msg.role as ClientRole;

        // is the name blank?
        if (name.length === 0) {
          ws.send(serialize(joinRemoteFailMsg("name cannot be blank")));
          return;
        }

        // has this name already been taken?
        const nameTaken = state.clients.find((client) => client.name === name);
        if (nameTaken) {
          ws.send(serialize(joinRemoteFailMsg("name taken")));
          return;
        }

        // add the client
        logger.info(`💃 Client ${name} joined.`);
        state.clients.push({ name, role, ws });

        // monkey-patch the `ws` to include the name so we can find the client later
        // when this socket disoconnects
        ws.name = name;

        // send the client a response to say joining was successful
        ws.send(serialize(joinRemoteSuccessMsg(name)));

        // send the client list and mappings to all UIs
        wss.clients.forEach((ws) => ws.send(serialize(remoteStateMsg(state))));
        // wss.getUis().forEach((ws) => ws.send(serialize(remoteState(state))));
        break;
    }
  });
});

// initialise routes
///////////////////////////////////////////////////////////////////////////////////////////////////
const router = Router();

router.get("/status", (req, res) => {
  res.send({ wsConnections: wss.clients.size, state: remoteStateMsg(state) });
});

router.put("/change-role/:name", (req, res) => {
  const name = req.params.name;
  const newRole = req.body.newRole as ClientRole;

  // update client role
  const client = state.clients.find((client) => client.name === name);
  if (client) {
    client.role = newRole;
  }

  // send the client list and mappings to all UIs
  wss.clients.forEach((ws) => ws.send(serialize(remoteStateMsg(state))));
  // wss.getUis().forEach((ws) => ws.send(serialize(remoteState(state))));

  res.send();
});

router.put("/rename/:oldName", (req, res) => {
  const oldName = req.params.oldName;
  const newName = req.body.newName as string;

  // find the old name
  const oldClient = state.clients.find((client) => client.name === oldName);
  if (oldClient) {
    logger.info(`✏️ Renamed client from ${oldName} to ${newName}.`);
    oldClient.name = newName;
    oldClient.ws.name = newName;

    // send the client a success message
    oldClient.ws.send(serialize(renameSuccessMsg(newName)));

    // send the client list and mappings to all UIs
    wss.clients.forEach((ws) => ws.send(serialize(remoteStateMsg(state))));
    // wss.getUis().forEach((ws) => ws.send(serialize(remoteState(state))));

    res.send();
  } else {
    res.status(500).send(`unable to find client with name ${oldName}`);
  }
});

router.put("/map", (req, res) => {
  const fromName = req.body.fromName as string;
  const toName = req.body.toName as string;

  // does the first client (from) exist?
  const fromClient = state.clients.find((client) => client.name === fromName);
  if (!fromClient) {
    res.sendStatus(404).send(`no client with name ${fromName} found.`);
    return;
  }

  // does the second client (to) exist?
  const toClient = state.clients.find((client) => client.name === toName);
  if (!toClient) {
    res.sendStatus(404).send(`no client with name ${toName} found.`);
    return;
  }

  // does the mapping already exist
  const mapping = state.clientMap.find(([from, to]) => {
    return from.name === fromName && to.name === toName;
  });
  if (mapping) {
    res.sendStatus(500).send(`mapping already exists`);
    return;
  }

  logger.info(`🕸 Mapped ${fromClient.name} -> ${toClient.name}.`);
  state.clientMap.push([fromClient, toClient]);

  // send message to 'from' to set up as a sender
  fromClient.ws.send(serialize(becomeSenderMsg(toClient.name)));

  // send message to 'to' to setup as a receiver
  toClient.ws.send(serialize(becomeReceiverMsg(fromClient.name)));

  // send the client list and mappings to all UIs
  wss.clients.forEach((ws) => ws.send(serialize(remoteStateMsg(state))));
  // wss.getUis().forEach((ws) => ws.send(serialize(remoteState(state))));

  res.send();
});

router.put("/unmap", (req, res) => {
  const fromName = req.body.fromName as string;
  const toName = req.body.toName as string;

  // does the mapping already exist
  const mappingIdx = state.clientMap.findIndex(([from, to]) => {
    return from.name === fromName && to.name === toName;
  });
  if (mappingIdx < 0) {
    res.sendStatus(404).send(`mapping does not exists`);
    return;
  }

  const [from, to] = state.clientMap[mappingIdx];

  state.clientMap.splice(mappingIdx, 1);

  // send the client list and mappings to all UIs
  wss.clients.forEach((ws) => ws.send(serialize(remoteStateMsg(state))));
  // wss.getUis().forEach((ws) => ws.send(serialize(remoteState(state))));

  // send message to 'to' to remove receiver
  to.ws.send(serialize(unbecomeReceiverMsg(from.name)));

  res.send();
});

router.get("/leave/:name", (req, res) => {
  const clientName = req.params.name;

  // remove name from ws
  const client = state.clients.find((client) => client.name === clientName);
  if (client) {
    client.ws.name = undefined;
  }

  // remove all mapping to and from client
  removeAllMappings(clientName);

  res.send();
});

router.get("/debug/:onoff", (req, res) => {
  const isOn = req.params.onoff === "on";
  debug = isOn;
  res.send();
});

app.use("/api", router);

// start the Express server
///////////////////////////////////////////////////////////////////////////////
const port = 3000; // default port to listen on
httpServer.listen(port, () => {
  logger.info(`🎉 Remote streamer started at http://localhost:${port}`);
});
