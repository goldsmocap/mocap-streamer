export class Error {
  _tag = "Error";
  msg: string;

  constructor(msg: string) {
    this.msg = msg;
  }
}

export class LocalStreamer {
  _tag = "LocalStreamer";
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

export type WsSend = (data: string | ArrayBuffer | Blob, useBuffer?: boolean) => boolean;
export type WsClose = (code?: number, reason?: string) => void;
