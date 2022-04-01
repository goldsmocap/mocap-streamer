import { WebSocket } from "ws";
export declare type Client = {
    name: string;
    ws: WebSocket;
};
export declare type ClientMap = [Client, Client][];
export declare type ClientState = {
    clients: Client[];
    clientMap: ClientMap;
};
export declare type ClientSummary = {
    name: string;
};
export declare type ClientSummaryMap = [ClientSummary, ClientSummary][];
export declare type ClientSummaryState = {
    clients: ClientSummary[];
    clientMap: ClientSummaryMap;
};
export declare const clientSummary: (client: Client) => ClientSummary;
export declare const clientSummaryState: (clientState: ClientState) => ClientSummaryState;
//# sourceMappingURL=clients.d.ts.map