import { Subscription } from "rxjs";
import { UdpSource, UdpSink } from "./udp";
import { WsSource, WsSink } from "./ws";

export type Source = UdpSource | WsSource;
export const sources: Source[] = [];

export type Sink = UdpSink | WsSink;
export const sinks: Sink[] = [];

export interface Connection {
  from: string;
  to: string;
  subscription: Subscription;
}
export const connections: Connection[] = [];

export function connectSink(
  upstream: string,
  sink: Sink
): Promise<Connection[]> {
  const conn = connections.find(
    ({ from, to }) => from === upstream && to === sink.name
  );
  if (conn) {
    return Promise.reject(
      `Connection already exists between ${upstream} and ${sink.name}`
    );
  }

  // find the source to observe
  const i = sources.findIndex(({ name }) => name === upstream);

  // if found connect to it
  if (i >= 0) {
    const observable = sources[i].observable;
    const subscription = observable.subscribe(sink.observer);
    observable.connect();

    connections.push({
      from: upstream,
      to: sink.name,
      subscription,
    });

    return Promise.resolve(connections);
  }

  return Promise.reject(`unable to find flow with name ${upstream}`);
}
