export interface WsResult<T> {
  status: "OK" | "ERR";
  msg?: string;
  params?: T;
}

export function ok<T>(opts: { msg?: string; params?: T } = {}): WsResult<T> {
  return {
    status: "OK",
    msg: opts.msg,
    params: opts.params,
  };
}

export function err<T>(opts: { msg: string; params?: T }): WsResult<T> {
  return {
    status: "ERR",
    msg: opts.msg,
    params: opts.params,
  };
}
