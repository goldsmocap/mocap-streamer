import { UdpSource, UdpSink } from "./udp";
import { WsSource, WsSink } from "./ws";

export type Source = UdpSource | WsSource;
export const sources: Source[] = [];

export type Sink = UdpSink | WsSink;
export const sinks: Sink[] = [];
export function connectSink(upstream: string, sink: Sink): Promise<void> {
  // find the source to observe
  const i = sources.findIndex(({ name }) => name === upstream);

  // if found connect to it
  if (i >= 0) {
    const observable = sources[i].observable;
    const subscription = observable.subscribe(sink.observer);
    observable.connect();
    return Promise.resolve();
  }

  return Promise.reject(`unable to find flow with name ${upstream}`);
}
