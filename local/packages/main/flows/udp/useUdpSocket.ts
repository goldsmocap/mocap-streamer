import dgram from "dgram";

export function useUdpSocket(port: number, address: string): Promise<dgram.Socket> {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket("udp4");

    socket.on("error", (err) => {
      console.log(`Oops we got an error ${err}\n${JSON.stringify(err)}`);
      reject(err);
    });
    socket.on("listening", () => {
      console.log(`UDP socket receive size: ${socket.getRecvBufferSize()}`);
      resolve(socket);
    });

    console.log(`⚡ binding UDP socket to ${address}:${port}`);
    socket.bind(port, address);
  });
}
