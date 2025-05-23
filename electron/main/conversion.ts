import osc from "osc";
import { MessageMode, SubjectData } from "./types";
import { FixedLengthTuple, tuple } from "./utils.js";

const OSC_ADDRESS_SEPARATOR = "/";

interface OscData<T = unknown> {
  address: string;
  args: T;
  mode: MessageMode;
}

export function dataToOsc({ address, args, mode }: OscData): Uint8Array {
  return osc.writeMessage({
    address: [mode, address].map((part) => "/" + part).join(""),
    args,
  });
}

export function oscToData(message: Uint8Array): OscData {
  const { address: fullAddress, args }: { address: string; args: unknown } =
    osc.readMessage(message);
  // Ignore the first "/"
  const splitIdx = fullAddress.indexOf(OSC_ADDRESS_SEPARATOR);
  const mode = fullAddress.slice(0, splitIdx) as MessageMode;
  const address = fullAddress.slice(splitIdx + 1);
  return { args, mode, address };
}

export function subjectDataToOsc(
  address: string,
  subjectData: SubjectData[]
): Uint8Array {
  const oscData: OscData = {
    address,
    args: subjectData.flatMap(({ name, segments }) => [
      name,
      ...segments.flatMap((segmentData) => [
        segmentData.id,
        segmentData.posx,
        segmentData.posy,
        segmentData.posz,
        segmentData.rotx,
        segmentData.roty,
        segmentData.rotz,
      ]),
    ]),
    mode: "mocap",
  };

  return dataToOsc(oscData);
}

export function bufferToString(buffer: Buffer): string {
  return buffer.reduce((str, value) => str + String.fromCharCode(value), "");
}

export function stringToBuffer(bvh: string): Buffer {
  return Buffer.from(bvh, "utf-8");
}

export function quaternionToEuler(
  qX: number,
  qY: number,
  qZ: number,
  qW: number
): FixedLengthTuple<number, 3> {
  const x = Math.atan2(2 * (qW * qX + qY * qZ), 1 - 2 * (qX ** 2 + qY ** 2));
  const y =
    2 *
      Math.atan2(
        Math.sqrt(1 + 2 * (qW * qY - qX * qZ)),
        Math.sqrt(1 - 2 * (qW * qY - qX * qZ))
      ) -
    Math.PI / 2;
  const z = Math.atan2(2 * (qW * qZ + qX * qY), 1 - 2 * (qY ** 2 + qZ ** 2));

  return tuple(x, y, z);
}
