export interface Client {
  name: string;
  socketId: string;
}

export type Connection = [Client, Client];
