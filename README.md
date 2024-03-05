# Mocap Streamer Client

This is the mocap streamer client application. The way it works is you will connect to a streaming room, where others can join the same one (based on the room name).
On the home screen, each person can set themselves up as a:

- Sender: this is a data producer, where they will be feeding their own data from a supported motion capture software, into the room
- Receiver: this is a data consumer, where they will pipe the room data into a supported software
- Both a sender and receiver: meaning they can both feed data into the room as well as pipe it out

You can also configure the connection server details as well. This option exists if you would like to have a separate set of rooms from the default server, as you can host your own [mocap streamer server](https://github.com/ohuu/mocap-streamer-server). Only use this option if you know what you are doing! For most cases, the default connection server should be enough.

Once you have connected to a room, you can configure the connection details of whichever software you're trying to use and then start sending/receiving data.

## Commands

```sh
# install dependencies
yarn

# development mode (includes hot-reloading)
yarn dev

# building/releasing the project
yarn build
```

## Development

We use PeerJS for sending all of the motion capture data, but a simple http(s) request for setting a room up. Under the hood, PeerJS uses a web socket using WebRTC for peer to peer communication.

Terminology:

- Data producers are senders in the UI
- Data consumers are receivers in the UI

Points of interest:

- `electron/main/index.ts` is the entry point for the backend for the electron app
- `src/main.ts` is the entry point for the front end. This starts with the `src/views/pages/ConnectPage.vue` component.
