import { WebSocket } from "ws";

///////////////////////////////////////////////////////////////////////////////////////////////////
// Clients
export type Client = { name: string; ws: WebSocket };
export type ClientMap = [Client, Client][];
export type ClientState = { clients: Client[]; clientMap: ClientMap };

export type ClientSummary = { name: string };
export type ClientSummaryMap = [ClientSummary, ClientSummary][];
export type ClientSummaryState = { clients: ClientSummary[]; clientMap: ClientSummaryMap };

export const clientSummary = (client: Client): ClientSummary => ({ name: client.name });
export const clientSummaryState = (clientState: ClientState): ClientSummaryState => {
  return {
    clients: clientState.clients.map(clientSummary),
    clientMap: clientState.clientMap.map(([from, to]) => [clientSummary(from), clientSummary(to)]),
  };
};
