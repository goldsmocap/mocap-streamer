import * as dgram from "dgram";
import * as Rx from "rxjs";
import { bufferToString } from "../conversion.js";
import { SegmentData, SubjectData } from "../types.js";

const segmentOrder = [
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

const transformCount = 6;

export function bvhToSubjectData(bvh: string): SubjectData[] {
  return bvh
    .split(/\s*\|\|/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((subjectBvh): SubjectData => {
      const transformParts = subjectBvh
        .split(/\s+/)
        .slice(-segmentOrder.length * transformCount)
        .map(Number);

      return {
        name: subjectBvh.replace(/^\s*(\S+).*$/, "$1"),
        segments: segmentOrder.map(
          (id, sIdx): SegmentData => ({
            id,
            posx: -transformParts[sIdx * transformCount + 0],
            posy: transformParts[sIdx * transformCount + 1],
            posz: transformParts[sIdx * transformCount + 2],
            rotx: transformParts[sIdx * transformCount + 4],
            roty: -transformParts[sIdx * transformCount + 3],
            rotz: -transformParts[sIdx * transformCount + 5],
          })
        ),
      };
    });
}

export function axisStudioObserver(
  socket: dgram.Socket,
  fps: number = 90
): Rx.Observable<SubjectData[]> {
  return new Rx.Observable<SubjectData[]>((observer) => {
    const toSend = [];
    socket.on("message", (msg: Buffer) => {
      const subjectData = bvhToSubjectData(bufferToString(msg));
      const toSendNames = new Set(toSend.map(({ name }) => name));
      if (subjectData.some(({ name }) => toSendNames.has(name))) {
        observer.next(toSend);
        toSend.length = 0;
      }
      toSend.push(...subjectData);
    });
    socket.on("error", (err) => observer.error(err));
    socket.on("close", () => observer.complete());
  }).pipe(Rx.throttleTime(1000 / fps));
}
