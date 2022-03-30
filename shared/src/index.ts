import { WebSocket } from "ws";
export { logger } from "./log";

export interface Client {
  name: string;
  ws: WebSocket;
}

export type Connection = [Client, Client];

export interface WsMessage {
  type: string;
  data?: any;
  from?: string;
}
