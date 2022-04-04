import { WebSocket, Server } from "ws";

declare module "ws" {
  interface Server<T extends WebSocket> {
    getUis(): WebSocket[];
    getUi(name: string): WebSocket | undefined;
  }

  interface WebSocket {
    name: string | undefined;
  }
}

Server.prototype.getUis = function (): WebSocket[] {
  return Array.from(this.clients).filter((ws) => ws.name === "ui");
};

Server.prototype.getUi = function (name: string): WebSocket | undefined {
  return Array.from(this.clients).find((ws) => ws.name === `${name}_ui`);
};

declare global {
  interface Array<T> {
    filterInPlace: (f: (t: T) => boolean) => void;
  }
}

Array.prototype.filterInPlace = function (f) {
  let i = 0,
    j = 0;

  while (i < this.length) {
    const t = this[i];
    if (f(t)) this[j++] = t;
    i++;
  }

  this.length = j;
};
