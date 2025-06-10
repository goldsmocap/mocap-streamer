import * as dgram from "dgram";
import * as Rx from "rxjs";
import { bufferToString } from "../conversion";
import { Logger, SegmentData, SubjectData } from "../types";

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
      text: "Invalid data! Can only handle 23 body segments",
    });

  const segments: SegmentData[] = [];
  for (let i = 0; i < header.numBodySegments; i++) {
    const id = segmentOrder[view.getUint32(idx) - 1];
    if (id != null) {
      const segment: SegmentData = {
        id,
        posx: -view.getFloat32(idx + 8),
        posy: view.getFloat32(idx + 12),
        posz: view.getFloat32(idx + 4),
        rotx: view.getFloat32(idx + 24),
        roty: -view.getFloat32(idx + 28),
        rotz: -view.getFloat32(idx + 20),
        rotw: view.getFloat32(idx + 16),
      };
      segments.push(segment);
    }
    idx += 32;
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
