import * as dgram from "dgram";
import { Observer, Subscription } from "rxjs";

export const viconTransformMap = {
  Hips: "Robot_Hips",
  Spine: "Robot_Spine",
  Spine1: "Robot_Spine1",
  Spine2: "Robot_Spine2",
  Neck: "Robot_Neck",
  Neck1: "Robot_Head_End",
  Head: "Robot_Head",
  LeftShoulder: "Robot_LeftShoulder",
  LeftArm: "Robot_LeftArm",
  LeftForeArm: "Robot_LeftForeArm",
  LeftHand: "Robot_LeftHand",
  LeftInHandIndex: "Robot_LeftInHandIndex",
  LeftHandIndex1: "Robot_LeftHandIndex1",
  LeftHandIndex2: "Robot_LeftHandIndex2",
  LeftHandIndex3: "Robot_LeftHandIndex3",
  LeftInHandMiddle: "Robot_LeftInHandMiddle",
  LeftHandMiddle1: "Robot_LeftHandMiddle1",
  LeftHandMiddle2: "Robot_LeftHandMiddle2",
  LeftHandMiddle3: "Robot_LeftHandMiddle3",
  LeftHandThumb1: "Robot_LeftHandThumb1",
  LeftHandThumb2: "Robot_LeftHandThumb2",
  LeftHandThumb3: "Robot_LeftHandThumb3",
  LeftInHandPinky: "Robot_LeftInHandPinky",
  LeftHandPinky1: "Robot_LeftHandPinky1",
  LeftHandPinky2: "Robot_LeftHandPinky2",
  LeftHandPinky3: "Robot_LeftHandPinky3",
  LeftInHandRing: "Robot_LeftInHandRing",
  LeftHandRing1: "Robot_LeftHandRing1",
  LeftHandRing2: "Robot_LeftHandRing2",
  LeftHandRing3: "Robot_LeftHandRing3",
  RightShoulder: "Robot_RightShoulder",
  RightArm: "Robot_RightArm",
  RightForeArm: "Robot_RightForeArm",
  RightHand: "Robot_RightHand",
  RightInHandPinky: "Robot_RightInHandPinky",
  RightHandPinky1: "Robot_RightHandPinky1",
  RightHandPinky2: "Robot_RightHandPinky2",
  RightHandPinky3: "Robot_RightHandPinky3",
  RightInHandRing: "Robot_RightInHandRing",
  RightHandRing1: "Robot_RightHandRing1",
  RightHandRing2: "Robot_RightHandRing2",
  RightHandRing3: "Robot_RightHandRing3",
  RightInHandMiddle: "Robot_RightInHandMiddle",
  RightHandMiddle1: "Robot_RightHandMiddle1",
  RightHandMiddle2: "Robot_RightHandMiddle2",
  RightHandMiddle3: "Robot_RightHandMiddle3",
  RightInHandIndex: "Robot_RightInHandIndex",
  RightHandIndex1: "Robot_RightHandIndex1",
  RightHandIndex2: "Robot_RightHandIndex2",
  RightHandIndex3: "Robot_RightHandIndex3",
  RightHandThumb1: "Robot_RightHandThumb1",
  RightHandThumb2: "Robot_RightHandThumb2",
  RightHandThumb3: "Robot_RightHandThumb3",
  RightUpLeg: "Robot_RightUpLeg",
  RightLeg: "Robot_RightLeg",
  RightFoot: "Robot_RightFoot",
  LeftUpLeg: "Robot_LeftUpLeg",
  LeftLeg: "Robot_LeftLeg",
  LeftFoot: "Robot_LeftFoot",
} as const;

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
  useOsc: boolean;
}

export type ConsumerState = UnityConsumerState;

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

export type ProducerState = AxisStudioProducerState | ViconProducerState;
