import { WebSocket } from "ws";
export declare type ClientRole = "SENDER" | "RECEIVER" | "BOTH";
export declare const roleSender: ClientRole;
export declare const roleReceiver: ClientRole;
export declare const roleBoth: ClientRole;
export declare type Client = {
    name: string;
    role: ClientRole;
    ws: WebSocket;
};
export declare type ClientMap = [Client, Client][];
export declare type ClientState = {
    clients: Client[];
    clientMap: ClientMap;
};
export declare type ClientSummary = {
    name: string;
    role: ClientRole;
};
export declare type ClientSummaryMap = [ClientSummary, ClientSummary][];
export declare type ClientSummaryState = {
    clients: ClientSummary[];
    clientMap: ClientSummaryMap;
};
export declare const clientSummary: (client: Client) => ClientSummary;
export declare const clientSummaryState: (clientState: ClientState) => ClientSummaryState;
//# sourceMappingURL=clients.d.ts.map