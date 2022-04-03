// import { io, Socket } from "socket.io-client";

// export function useWsServer(
//   httpServer: http.Server,
//   options?: ios.ServerOptions
// ): Promise<ios.Socket> {
//   return new Promise((resolve) => {
//     const ioServer = new ios.Server(httpServer, options);

//     ioServer.on("connection", (socket: ios.Socket) => {
//       logger.info(`⚡ Websocket connected`);
//       resolve(socket);
//     });
//   });
// }

// export function useWsAsClient(address: string): Promise<Socket> {
//   return new Promise((resolve) => {
//     const socket = io(address);
//     resolve(socket);
//   });
// }
