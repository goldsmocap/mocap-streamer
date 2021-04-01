import dgram from "dgram";
import { logger } from "../../log";

export function useUdpSocket(
  port: number,
  address?: string
): Promise<dgram.Socket> {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket("udp4");

    socket.on("error", (err) => reject(err));
    socket.on("listening", () => resolve(socket));

    if (address) {
      logger.info(`⚡ binding UDP socket to ${address}:${port}`);
      socket.bind(port, address);
    } else {
      logger.info(`⚡ binding UDP socket to all addresses on port ${port}`);
      socket.bind(port);
    }
  });
}
