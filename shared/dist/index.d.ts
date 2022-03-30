import { WebSocket } from "ws";
export { logger } from "./log";
export interface Client {
  name: string;
  ws: WebSocket;
}
export declare type Connection = [Client, Client];
export interface WsMessage {
  type: string;
  payload?: any;
  from?: string;
}
