import * as dgram from "dgram";
import * as Rx from "rxjs";
import { bufferToString } from "../conversion";
import { SegmentData, SubjectData } from "../types";
import { raise } from "../utils";

type UIntNumBytes = 1 | 2 | 4;

const dataHeader: ({ key: string } & (
  | { uintBytes: UIntNumBytes }
  | { strBytes: number }
))[] = [
  { key: "id", strBytes: 6 },
  { key: "sampleCounter", uintBytes: 4 },
  { key: "datagramCounter", uintBytes: 1 },
  { key: "numItems", uintBytes: 1 },
  { key: "timeCode", uintBytes: 4 },
  { key: "characterId", uintBytes: 1 },
  { key: "numBodySegments", uintBytes: 1 },
  { key: "numProps", uintBytes: 1 },
  { key: "numFingerSegments", uintBytes: 1 },
  { key: "futureUse", uintBytes: 2 },
  { key: "payload", uintBytes: 2 },
];

// https://movella.my.salesforce.com/sfc/p/#09000007xxr9/a/09000000S801/cPVPGjXbSD5Tfm8JyXWyyc.7wuSg56MLVWVKNVgSKJA
export function decodeXsensMessage(buffer: Buffer): SubjectData {
  const view = new DataView(buffer.buffer);

  const header: any = {};
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

  if (header.numItems !== header.numBodySegments)
    raise(new Error("Invalid Xsens data! Can only handle body segment data"));

  if (header.payload !== header.numBodySegments * 28)
    raise(
      new Error(
        "Invalid Xsens data! Can only handle position + euler orientation data"
      )
    );

  const segments: SegmentData[] = [];
  for (let i = 0; i < header.numBodySegments; i++) {
    const segment: SegmentData = {
      id: `${view.getUint32(idx)}`,
      posx: view.getFloat32(idx + 4),
      posy: view.getFloat32(idx + 8),
      posz: view.getFloat32(idx + 12),
      rotx: view.getFloat32(idx + 16),
      roty: view.getFloat32(idx + 20),
      rotz: view.getFloat32(idx + 24),
    };
    idx += 28;
    segments.push(segment);
  }

  console.log({ ...header, segments });
  return { name: header.characterId, segments };
}

export function xsensObserver(
  socket: dgram.Socket
): Rx.Observable<SubjectData[]> {
  return new Rx.Observable<SubjectData[]>((observer) => {
    socket.on("message", (msg: Buffer) => {
      observer.next([decodeXsensMessage(msg)]);
    });
    socket.on("error", (err) => observer.error(err));
    socket.on("close", () => observer.complete());
  });
}
