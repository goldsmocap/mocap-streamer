import { WebSocket } from "ws";
export interface Client {
    name: string;
    ws: WebSocket;
}
export declare type Connection = [Client, Client];
