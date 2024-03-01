import * as dgram from "dgram";
import { Observer, Subscription } from "rxjs";

export const viconTransformMap = {
  Hips: "pelvis",
  Spine: "spine_01",
  Spine1: "spine_02",
  Spine2: "spine_03",
  Neck: "neck_01",
  Neck1: "neck_02",
  Head: "head",
  LeftShoulder: "clavicle_l",
  LeftArm: "upperarm_l",
  LeftForeArm: "lowerarm_l",
  LeftHand: "hand_l",
  LeftInHandIndex: "index_metacarpal_l",
  LeftHandIndex1: "index_01_l",
  LeftHandIndex2: "index_02_l",
  LeftHandIndex3: "index_03_l",
  LeftInHandMiddle: "middle_metacarpal_l",
  LeftHandMiddle1: "middle_01_l",
  LeftHandMiddle2: "middle_02_l",
  LeftHandMiddle3: "middle_03_l",
  LeftHandThumb1: "thumb_01_l",
  LeftHandThumb2: "thumb_02_l",
  LeftHandThumb3: "thumb_03_l",
  LeftInHandPinky: "pinky_metacarpal_l",
  LeftHandPinky1: "pinky_01_l",
  LeftHandPinky2: "pinky_02_l",
  LeftHandPinky3: "pinky_03_l",
  LeftInHandRing: "ring_metacarpal_l",
  LeftHandRing1: "ring_01_l",
  LeftHandRing2: "ring_02_l",
  LeftHandRing3: "ring_03_l",
  RightShoulder: "clavicle_r",
  RightArm: "upperarm_r",
  RightForeArm: "lowerarm_r",
  RightHand: "hand_r",
  RightInHandPinky: "pinky_metacarpal_r",
  RightHandPinky1: "pinky_01_r",
  RightHandPinky2: "pinky_02_r",
  RightHandPinky3: "pinky_03_r",
  RightInHandRing: "ring_metacarpal_r",
  RightHandRing1: "ring_01_r",
  RightHandRing2: "ring_02_r",
  RightHandRing3: "ring_03_r",
  RightInHandMiddle: "middle_metacarpal_r",
  RightHandMiddle1: "middle_01_r",
  RightHandMiddle2: "middle_02_r",
  RightHandMiddle3: "middle_03_r",
  RightInHandIndex: "index_metacarpal_r",
  RightHandIndex1: "index_01_r",
  RightHandIndex2: "index_02_r",
  RightHandIndex3: "index_03_r",
  RightHandThumb1: "thumb_01_r",
  RightHandThumb2: "thumb_02_r",
  RightHandThumb3: "thumb_03_r",
  RightUpLeg: "thigh_r",
  RightLeg: "calf_r",
  RightFoot: "foot_r",
  LeftUpLeg: "thigh_l",
  LeftLeg: "calf_l",
  LeftFoot: "foot_l",
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
  subscription: Subscription;
}

export type ProducerState = AxisStudioProducerState | ViconProducerState;
