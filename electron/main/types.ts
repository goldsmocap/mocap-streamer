import * as dgram from "dgram";
import { Observer, Subscription } from "rxjs";

export const TransformOrder = [
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

export const DataOrder = [
  "posx",
  "posy",
  "posz",
  "roty",
  "rotx",
  "rotz",
] as const;

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
  socket: dgram.Socket;
}

export type ProducerState = AxisStudioProducerState | ViconProducerState;
