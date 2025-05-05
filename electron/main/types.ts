import * as dgram from "dgram";
import { Observer, Subscription } from "rxjs";

export type SegmentData = {
  id: string;
  posx: number;
  posy: number;
  posz: number;
  rotx: number;
  roty: number;
  rotz: number;
};

export interface SubjectData {
  name: string;
  segments: SegmentData[];
}

export interface UnityConsumerState {
  type: "Unity";
  observer: Observer<Buffer>;
}

export type ConsumerState = UnityConsumerState;

export interface OptitrackProducerState {
  type: "Optitrack";
  address: string;
  socket: dgram.Socket;
  subscription?: Subscription;
}

export interface AxisStudioProducerState {
  type: "AxisStudio";
  socket: dgram.Socket;
  subscription: Subscription;
}

export interface XsensProducerState {
  type: "Xsens";
  socket: dgram.Socket;
  subscription: Subscription;
}

export interface ViconProducerState {
  type: "Vicon";
  subscription?: Subscription;
  timeout?: NodeJS.Timeout;
}

export interface DevelopmentProducerState {
  type: "Development";
  subscription?: Subscription;
  timeout?: NodeJS.Timeout;
}

export type ProducerState =
  | AxisStudioProducerState
  | OptitrackProducerState
  | XsensProducerState
  | ViconProducerState
  | DevelopmentProducerState;

export interface IncomingDataState {
  socket: dgram.Socket;
  subscription: Subscription;
}

export type MessageMode = "data" | "mocap";
