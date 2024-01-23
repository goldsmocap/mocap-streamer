import * as dgram from "dgram";
import { Observer } from "rxjs";

export interface UnityLocalState {
  type: "Unity";
  observer: Observer<Buffer>;
  useOsc: boolean;
}

export type LocalState = UnityLocalState;

export interface AxisStudioRemoteState {
  type: "AxisStudio";
  socket: dgram.Socket;
}

export type RemoteState = AxisStudioRemoteState;
