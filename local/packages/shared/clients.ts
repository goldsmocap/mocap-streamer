import { WebSocket } from "ws";

///////////////////////////////////////////////////////////////////////////////////////////////////
// Clients
export type ClientRole = "SENDER" | "RECEIVER" | "BOTH";
export const roleSender: ClientRole = "SENDER";
export const roleReceiver: ClientRole = "RECEIVER";
export const roleBoth: ClientRole = "BOTH";

export type Client = { name: string; role: ClientRole; ws: WebSocket };
export type ClientMap = [Client, Client][];
export type ClientState = { clients: Client[]; clientMap: ClientMap };

export type ClientSummary = { name: string; role: ClientRole };
export type ClientSummaryMap = [ClientSummary, ClientSummary][];
export type ClientSummaryState = { clients: ClientSummary[]; clientMap: ClientSummaryMap };

export const clientSummary = (client: Client): ClientSummary => ({
  name: client.name,
  role: client.role,
});
export const clientSummaryState = (clientState: ClientState): ClientSummaryState => {
  return {
    clients: clientState.clients.map(clientSummary),
    clientMap: clientState.clientMap.map(([from, to]) => [clientSummary(from), clientSummary(to)]),
  };
};
