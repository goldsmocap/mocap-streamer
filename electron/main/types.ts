import * as dgram from "dgram";
import { Observer, Subscription } from "rxjs";

export const transformOrder = [
  "Hips",
  "RightUpLeg",
  "RightLeg",
  "RightFoot",
  "LeftUpLeg",
  "LeftLeg",
  "LeftFoot",
  "Spine",
  "Spine1",
  "Spine2",
  "Neck",
  "Neck1",
  "Head",
  "RightShoulder",
  "RightArm",
  "RightForeArm",
  "RightHand",
  "RightHandThumb1",
  "RightHandThumb2",
  "RightHandThumb3",
  "RightInHandIndex",
  "RightHandIndex1",
  "RightHandIndex2",
  "RightHandIndex3",
  "RightInHandMiddle",
  "RightHandMiddle1",
  "RightHandMiddle2",
  "RightHandMiddle3",
  "RightInHandRing",
  "RightHandRing1",
  "RightHandRing2",
  "RightHandRing3",
  "RightInHandPinky",
  "RightHandPinky1",
  "RightHandPinky2",
  "RightHandPinky3",
  "LeftShoulder",
  "LeftArm",
  "LeftForeArm",
  "LeftHand",
  "LeftHandThumb1",
  "LeftHandThumb2",
  "LeftHandThumb3",
  "LeftInHandIndex",
  "LeftHandIndex1",
  "LeftHandIndex2",
  "LeftHandIndex3",
  "LeftInHandMiddle",
  "LeftHandMiddle1",
  "LeftHandMiddle2",
  "LeftHandMiddle3",
  "LeftInHandRing",
  "LeftHandRing1",
  "LeftHandRing2",
  "LeftHandRing3",
  "LeftInHandPinky",
  "LeftHandPinky1",
  "LeftHandPinky2",
  "LeftHandPinky3",
] as const;

export const viconTransformMap: Record<
  typeof transformOrder extends Array<infer S> ? S : never,
  string
> = {
  Hips: "Hips",
  Spine: "Spine",
  Spine1: "Spine1_1",
  Spine2: "Spine2",
  Neck: "Neck",
  Neck1: "Neck1",
  Head: "Head",
  LeftShoulder: "LeftShoulder",
  LeftArm: "LeftArm",
  LeftForeArm: "LeftForeArm",
  LeftHand: "LeftHand",
  LeftInHandIndex: "LeftInHandIndex",
  LeftHandIndex1: "LeftHandIndex1",
  LeftHandIndex2: "LeftHandIndex2",
  LeftHandIndex3: "LeftHandIndex3",
  LeftInHandMiddle: "LeftInHandMiddle",
  LeftHandMiddle1: "LeftHandMiddle1",
  LeftHandMiddle2: "LeftHandMiddle2",
  LeftHandMiddle3: "LeftHandMiddle3",
  LeftHandThumb1: "LeftHandThumb1",
  LeftHandThumb2: "LeftHandThumb2",
  LeftHandThumb3: "LeftHandThumb3",
  LeftInHandPinky: "LeftInHandPinky",
  LeftHandPinky1: "LeftHandPinky1",
  LeftHandPinky2: "LeftHandPinky2",
  LeftHandPinky3: "LeftHandPinky3",
  LeftInHandRing: "LeftInHandRing",
  LeftHandRing1: "LeftHandRing1",
  LeftHandRing2: "LeftHandRing2",
  LeftHandRing3: "LeftHandRing3",
  RightShoulder: "RightShoulder",
  RightArm: "RightArm",
  RightForeArm: "RightForeArm",
  RightHand: "RightHand",
  RightInHandPinky: "RightInHandPinky",
  RightHandPinky1: "RightHandPinky1",
  RightHandPinky2: "RightHandPinky2",
  RightHandPinky3: "RightHandPinky3",
  RightInHandRing: "RightInHandRing",
  RightHandRing1: "RightHandRing1",
  RightHandRing2: "RightHandRing2",
  RightHandRing3: "RightHandRing3",
  RightInHandMiddle: "RightInHandMiddle",
  RightHandMiddle1: "RightHandMiddle1",
  RightHandMiddle2: "RightHandMiddle2",
  RightHandMiddle3: "RightHandMiddle3",
  RightInHandIndex: "RightInHandIndex",
  RightHandIndex1: "RightHandIndex1",
  RightHandIndex2: "RightHandIndex2",
  RightHandIndex3: "RightHandIndex3",
  RightHandThumb1: "RightHandThumb1",
  RightHandThumb2: "RightHandThumb2",
  RightHandThumb3: "RightHandThumb3",
  RightUpLeg: "RightUpLeg",
  RightLeg: "RightLeg",
  RightFoot: "RightFoot",
  LeftUpLeg: "LeftUpLeg",
  LeftLeg: "LeftLeg",
  LeftFoot: "LeftFoot",
} as const;

export const dataOrder = [
  "posx",
  "posy",
  "posz",
  "roty",
  "rotx",
  "rotz",
] as const;

export type SegmentData = Record<
  typeof dataOrder extends ReadonlyArray<infer S> ? S : never,
  number
>;

export interface SubjectData {
  name: string;
  segments: Record<string, SegmentData>;
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
  | ViconProducerState
  | DevelopmentProducerState;

export interface IncomingDataState {
  socket: dgram.Socket;
  subscription: Subscription;
}

export type MessageMode = "arbitrary" | "mocap";
