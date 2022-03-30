import dgram from "dgram";
import { logger } from "shared";

export function useUdpSocket(
  port: number,
  address: string
): Promise<dgram.Socket> {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket("udp4");

    socket.on("error", (err) => {
      logger.info(`Oops we got an error ${err}\n${JSON.stringify(err)}`);
      reject(err);
    });
    socket.on("listening", () => {
      logger.info(`UDP socket receive size: ${socket.getRecvBufferSize()}`);
      resolve(socket);
    });

    logger.info(`⚡ binding UDP socket to ${address}:${port}`);
    socket.bind(port, address);
  });
}
