export interface Client {
    name: string;
    socketId: string;
}
export declare type Connection = [Client, Client];
