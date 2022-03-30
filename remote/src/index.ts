import http from "http";
import cors from "cors";
import express, { Router } from "express";
import { WebSocket } from "ws";
import { Client, WsMessage, logger } from "shared";
import "./types";

const app = express();

// state
///////////////////////////////////////////////////////////////////////////////
const clients: Client[] = [];
const clientMap: [Client, Client][] = [];

// apply middleware
///////////////////////////////////////////////////////////////////////////////
app.use(cors({ origin: ["http://localhost:8080"] }));
app.use(express.json()); // json body parser

// initialise websocket
///////////////////////////////////////////////////////////////////////////////
function handleDisconnect(ws: WebSocket, err?: any) {
  const clientName = ws.name;
  logger.info(`⚡ WS disconnected.`, clientName, err);

  const i = clients.findIndex((client) => client.name === clientName);
  if (i >= 0) {
    logger.info(`🕸 All mappings to and from ${clients[i].name} removed.`);
    clientMap.filterInPlace(([from, to]) => {
      return !(from.name === clientName || to.name === clientName);
    });

    logger.info(`💃 Client ${clients[i].name} removed.`);
    clients.splice(i, 1);
  }

  // send the client list and mappings to all UIs
  wss.getUis().forEach((ws) => ws.send({ type: "remote_state", data: { clients, clientMap } }));
}

const httpServer = http.createServer(app);
const wss = new WebSocket.Server({ server: httpServer });
wss.on("connection", (ws) => {
  logger.info(`⚡ WS connected.`);

  // on disconnect remove this client and any mapping to or from the
  // disconnected socket.
  ws.on("disconnect", () => handleDisconnect(ws));
  ws.on("error", (err) => handleDisconnect(ws, err));

  // on receipt of a message pass it on to all mapped clients
  ws.on("message", (raw) => {
    const msg = JSON.parse(raw.toString()) as WsMessage;

    switch (msg.type) {
      case "bvh_frame":
        clientMap
          .filter(([from]) => from.name === msg.from)
          .forEach(([from, to]) => to.ws.send({ from: from.name, data: msg.payload }));
        break;

      case "register_ui":
        logger.info(`🎨 UI registered.`);

        // monkey-patch the `ws` to include the name so we can find the client later
        // when this socket disoconnects
        ws.name = "ui";

        // send the client list and mappings to all UIs
        ws.send(
          JSON.stringify({
            type: "remote_state",
            data: { clients, clientMap },
          })
        );
        break;

      case "join":
        const name = msg.payload as string;

        // has this name already been taken?
        const nameTaken = clients.find((client) => client.name === name);
        if (nameTaken) {
          ws.send(JSON.stringify({ type: "name_taken" }));
          return;
        }

        // add the client
        logger.info(`💃 Client ${name} joined.`);
        clients.push({ name, ws });

        // monkey-patch the `ws` to include the name so we can find the client later
        // when this socket disoconnects
        ws.name = name;

        // send the client list and mappings to all UIs
        wss.getUis().forEach((ws) => {
          ws.send(
            JSON.stringify({
              type: "remote_state",
              payload: { clients, clientMap },
            })
          );
        });
        break;
    }
  });
});

// initialise routes
///////////////////////////////////////////////////////////////////////////////
const router = Router();

router.put("/rename/:oldName", (req, res) => {
  const oldName = req.params.oldName;
  const newName = req.body.newName as string;

  // find the old name
  const oldClient = clients.find((client) => client.name === oldName);
  if (oldClient) {
    logger.info(`✏️ Renamed client from ${oldName} to ${newName}.`);
    oldClient.name = newName;

    // send the client list and mappings to all UIs
    wss.getUis().forEach((ws) =>
      ws.send({
        type: "remote_state",
        data: { clients, clientMap },
      })
    );

    res.send();
  } else {
    res.status(500).send(`unable to find client with name ${oldName}`);
  }
});

router.get("/leave/:name", (req, res) => {
  const nameToRemove = req.params.name;

  // find the connection with the given name and close it.
  clients.find(({ name }) => name === nameToRemove)?.ws.close();
});

router.put("/map", (req, res) => {
  const fromName = req.body.fromName as string;
  const toName = req.body.toName as string;

  // does the first client (from) exist?
  const fromClient = clients.find((client) => client.name === fromName);
  if (!fromClient) {
    res.sendStatus(404).send(`no client with name ${fromName} found.`);
    return;
  }

  // does the second client (to) exist?
  const toClient = clients.find((client) => client.name === toName);
  if (!toClient) {
    res.sendStatus(404).send(`no client with name ${toName} found.`);
    return;
  }

  // does the mapping already exist
  const mapping = clientMap.find(([from, to]) => {
    return from.name === fromName && to.name === toName;
  });
  if (mapping) {
    res.sendStatus(500).send(`mapping already exists`);
    return;
  }

  logger.info(`🕸 Mapped ${fromClient.name} -> ${toClient.name}.`);
  clientMap.push([fromClient, toClient]);

  // send message to 'from' to set up as a sender
  fromClient.ws.send(JSON.stringify({ type: "become_sender", data: toClient.name }));

  // send message to 'to' to setup as a receiver
  toClient.ws.send(JSON.stringify({ type: "become_receiver", data: fromClient.name }));

  // send the client list and mappings to all UIs
  wss
    .getUis()
    .forEach((ws) =>
      ws.send(JSON.stringify({ type: "remote_state", data: { clients, clientMap } }))
    );

  res.send();
});

router.put("/unmap", (req, res) => {
  const fromName = req.body.fromName as string;
  const toName = req.body.toName as string;

  // does the mapping already exist
  const mappingIdx = clientMap.findIndex(([from, to]) => {
    return from.name === fromName && to.name === toName;
  });
  if (mappingIdx < 0) {
    res.sendStatus(404).send(`mapping does not exists`);
    return;
  }

  const [from, to] = clientMap[mappingIdx];

  clientMap.splice(mappingIdx, 1);

  // send the client list and mappings to all UIs
  wss
    .getUis()
    .forEach((ws) =>
      ws.send(JSON.stringify({ type: "remote_state", data: { clients, clientMap } }))
    );

  // send message to 'to' to remove receiver
  to.ws.send(JSON.stringify({ type: "unbecome_receiver", data: from.name }));

  res.send();
});

app.use("/api", router);

// start the Express server
///////////////////////////////////////////////////////////////////////////////
const port = 3000; // default port to listen on
httpServer.listen(port, () => {
  logger.info(`🎉 Remote streamer started at http://localhost:${port}`);
});
