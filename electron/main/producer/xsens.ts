import * as dgram from "dgram";
import * as Rx from "rxjs";
import { bufferToString } from "../conversion";
import { Logger, SegmentData, SubjectData } from "../types";
import { raise } from "../utils.js";

type UIntNumBytes = 1 | 2 | 4;

const segmentOrder = [
  "Pelvis",
  "L5",
  "L3",
  "T12",
  "T8",
  "Neck",
  "Head",
  "RightShoulder",
  "RightUpperArm",
  "RightLowerArm",
  "RightHand",
  "LeftShoulder",
  "LeftUpperArm",
  "LeftLowerArm",
  "LeftHand",
  "RightUpperLeg",
  "RightLowerLeg",
  "RightFoot",
  "RightToe",
  "LeftUpperLeg",
  "LeftLowerLeg",
  "LeftFoot",
  "LeftToe",
];
const characterMapping = {
  Pelvis: "Hips",
  LeftUpperLeg: "LeftUpperLeg",
  LeftLowerLeg: "LeftLowerLeg",
  LeftFoot: "LeftFoot",
  LeftToe: "LeftToes",
  RightUpperLeg: "RightUpperLeg",
  RightLowerLeg: "RightLowerLeg",
  RightFoot: "RightFoot",
  RightToe: "RightToes",
  L3: "Spine",
  T8: "Chest",
  LeftShoulder: "LeftShoulder",
  LeftUpperArm: "LeftUpperArm",
  LeftLowerArm: "LeftLowerArm",
  LeftHand: "LeftHand",
  RightShoulder: "RightShoulder",
  RightUpperArm: "RightUpperArm",
  RightLowerArm: "RightLowerArm",
  RightHand: "RightHand",
  Neck: "Neck",
  Head: "Head",
};

interface Header {
  id: string;
  sampleCounter: number;
  datagramCounter: number;
  numItems: number;
  timeCode: number;
  characterId: number;
  numBodySegments: number;
  numProps: number;
  numFingerSegments: number;
  futureUse: number;
  payload: number;
}

const strHeader = <const S extends keyof Header>(key: S, strBytes: number) => ({
  key,
  strBytes,
});

const uintHeader = <const S extends keyof Header>(
  key: S,
  uintBytes: UIntNumBytes
) => ({ key, uintBytes });

const dataHeader = [
  strHeader("id", 6),
  uintHeader("sampleCounter", 4),
  uintHeader("datagramCounter", 1),
  uintHeader("numItems", 1),
  uintHeader("timeCode", 4),
  uintHeader("characterId", 1),
  uintHeader("numBodySegments", 1),
  uintHeader("numProps", 1),
  uintHeader("numFingerSegments", 1),
  uintHeader("futureUse", 2),
  uintHeader("payload", 2),
];

function decodeHeader(buffer: Buffer): [number, Header] {
  const view = new DataView(buffer.buffer);
  const header: Record<string, string | number> = {};
  let idx = 0;
  for (const item of dataHeader) {
    if ("strBytes" in item) {
      header[item.key] = bufferToString(buffer.subarray(idx, item.strBytes));
      idx += item.strBytes;
    } else {
      switch (item.uintBytes) {
        case 1:
          header[item.key] = view.getUint8(idx);
          break;
        case 2:
          header[item.key] = view.getUint16(idx);
          break;
        case 4:
          header[item.key] = view.getUint32(idx);
          break;
      }
      idx += item.uintBytes;
    }
  }
  return [idx, header as unknown as Header];
}

// https://movella.my.salesforce.com/sfc/p/#09000007xxr9/a/09000000S801/cPVPGjXbSD5Tfm8JyXWyyc.7wuSg56MLVWVKNVgSKJA
function decodeXsensMessage(buffer: Buffer, logger: Logger): SubjectData {
  const view = new DataView(buffer.buffer);
  let [idx, header] = decodeHeader(buffer);

  if (header.numBodySegments !== 23)
    logger({
      type: "error",
      text: "[Xsens] Invalid data! Can only handle 23 body segments",
    });

  const segments: SegmentData[] = [];
  for (let i = 0; i < header.numBodySegments; i++) {
    const translatedId =
      characterMapping[segmentOrder[view.getUint32(idx) - 1]];
    if (translatedId != null) {
      const segment: SegmentData = {
        id: translatedId,
        posx: -view.getFloat32(idx + 8) / 10,
        posy: view.getFloat32(idx + 12) / 10,
        posz: view.getFloat32(idx + 4) / 10,
        rotx: -view.getFloat32(idx + 16),
        roty: view.getFloat32(idx + 24),
        rotz: -view.getFloat32(idx + 20),
        rotw: null,
      };
      segments.push(segment);
    }
    idx += 28;
  }

  return { name: `${header.characterId}`, segments };
}

export function xsensObserver(
  socket: dgram.Socket,
  logger: Logger
): Rx.Observable<SubjectData[]> {
  return new Rx.Observable<SubjectData[]>((observer) => {
    socket.on("message", (msg: Buffer) => {
      observer.next([decodeXsensMessage(msg, logger)]);
    });
    socket.on("error", (err) => observer.error(err));
    socket.on("close", () => observer.complete());
  });
}
