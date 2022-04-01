import { ConnectableObservable, Subject } from "rxjs";
import { multicast } from "rxjs/operators";
import { logger } from "../../logging";
import { observableFromUdp } from "../../rxadapters/rxUdp";
import { useUdpSocket } from "./useUdpSocket";

export interface UdpSourceOptions {
  name: string;
  port: number;
  address?: string;
  debug?: boolean;
}

export interface UdpSource {
  _tag: "UdpSource";
  name: string;
  port: number;
  address: string;
  observable: ConnectableObservable<any>;
}

export function udpSource(options: UdpSourceOptions): Promise<UdpSource> {
  const address = options.address ?? "0.0.0.0";

  return useUdpSocket(options.port, address).then((socket) => {
    logger.info(`🚀 Listening to axis-neuron UDP socket for data.`);

    // create a new subject
    const subject = new Subject<any>();

    // create a new observable from the socket and multicast it through the subject
    const observable = observableFromUdp(socket);
    const multicasted = observable.pipe(multicast(subject)) as ConnectableObservable<any>;

    if (options.debug ?? false) {
      multicasted.subscribe({
        next: (buf) => logger.info(`UdpSource received ${buf.length}`),
      });
      multicasted.connect();
    }

    return {
      _tag: "UdpSource",
      name: options.name,
      port: options.port,
      address,
      observable: multicasted,
    };
  });
}
