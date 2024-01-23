import * as dgram from "dgram";

export interface AxisStudioRemote {
  type: "AxisStudio";
  socket: dgram.Socket;
}

export type RemoteState = AxisStudioRemote;
