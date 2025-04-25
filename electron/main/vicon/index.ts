import { BitStream } from "bit-buffer";
import * as Rx from "rxjs";

import { subjectDataToBvh } from "../conversion";
import { SegmentData, SubjectData } from "../types";
import {
  CGetFrameNumberOutputType,
  CGetSegmentCountOutputType,
  CGetSegmentGlobalRotationEulerOutputType,
  CGetSegmentGlobalTranslationOutputType,
  CGetSegmentLocalRotationEulerOutputType,
  CGetSegmentLocalTranslationOutputType,
  CGetSegmentStaticRotationEulerOutputType,
  CGetSubjectCountOutputType,
  clientConnect,
  clientCreate,
  clientDestroy,
  clientDisconnect,
  clientEnableSegmentData,
  clientGetFrame,
  clientGetFrameNumber,
  clientGetSegmentCount,
  clientGetSegmentGlobalRotationEuler,
  clientGetSegmentGlobalTranslation,
  clientGetSegmentLocalRotationEuler,
  clientGetSegmentLocalTranslation,
  clientGetSegmentName,
  clientGetSegmentStaticRotationEuler,
  clientGetSubjectCount,
  clientGetSubjectName,
  clientIsConnected,
  clientIsSegmentDataEnabled,
  clientSetBufferSize,
  createViconOutputStruct,
  TsBoolTypeMapping,
  TsResultTypeMapping,
} from "./cDefinitions";
import { isExact } from "deep-guards";

let client: any = null;

function isConnected() {
  return client != null && clientIsConnected(client) === TsBoolTypeMapping.True;
}

export function disconnect(): boolean {
  if (isConnected()) {
    const result = clientDisconnect(client) === TsResultTypeMapping.Success;
    clientDestroy(client);
    client = null;
    return result;
  }
  return false;
}

export function connect(host: string) {
  disconnect();
  client = clientCreate();
  clientSetBufferSize(client, 1);
  return [clientConnect(client, host), clientEnableSegmentData(client)].every(
    (result) => result === TsResultTypeMapping.Success
  );
}

function bufToString(buf: Buffer): string {
  return Array.from(buf.values())
    .map((c) => String.fromCharCode(c))
    .join("")
    .replace(/\x00*$/, "");
}

function callAsUnpackedOutputStruct<R = any>(
  createdEnum: ReturnType<typeof createViconOutputStruct>,
  callback: (result: any) => void
): R {
  const result: any = {};
  callback(result);
  return result[createdEnum.attr];
}
function reverseBits(n: number): number {
  const stream = new BitStream(Buffer.from(new Float64Array([n]).buffer));
  stream.bigEndian = false;
  return stream.readFloat64();
}

function posMod(a: number, b: number): number {
  return ((a % b) + b) % b;
}

export function getData(): SubjectData[] | null {
  if (
    isConnected() &&
    clientIsSegmentDataEnabled(client) === TsBoolTypeMapping.True &&
    clientGetFrame(client) === TsResultTypeMapping.Success
  ) {
    // Pull frame - these lines are necessary to retrieve data!
    clientGetFrame(client);
    callAsUnpackedOutputStruct(CGetFrameNumberOutputType, (result) =>
      clientGetFrameNumber(client, result)
    );

    const subjectCount = callAsUnpackedOutputStruct(
      CGetSubjectCountOutputType,
      (result) => clientGetSubjectCount(client, result)
    );
    let result: SubjectData[] = [];
    for (let subjectIndex = 0; subjectIndex < subjectCount; subjectIndex++) {
      const subjectNameBuffer = Buffer.allocUnsafe(128);
      clientGetSubjectName(
        client,
        subjectIndex,
        subjectNameBuffer.length,
        subjectNameBuffer
      );
      const subjectName = bufToString(subjectNameBuffer);
      const segmentCount = callAsUnpackedOutputStruct(
        CGetSegmentCountOutputType,
        (result) => clientGetSegmentCount(client, subjectName, result)
      );

      const segments: Record<string, SegmentData> = {};

      for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
        const segmentNameBuffer = Buffer.allocUnsafe(128);
        clientGetSegmentName(
          client,
          subjectName,
          segmentIndex,
          segmentNameBuffer.length,
          segmentNameBuffer
        );
        const segmentName = bufToString(segmentNameBuffer);
        const processTranslation = (n: number) => reverseBits(n) / 10;
        const processRotation = (n: number, offset: number = 0) =>
          posMod((reverseBits(n) / Math.PI) * 180 + offset + 180, 360) - 180;

        const localTranslation = callAsUnpackedOutputStruct<Float64Array>(
          CGetSegmentLocalTranslationOutputType,
          (result) =>
            clientGetSegmentLocalTranslation(
              client,
              subjectName,
              segmentName,
              result
            )
        );
        const localRotation = callAsUnpackedOutputStruct<Float64Array>(
          CGetSegmentLocalRotationEulerOutputType,
          (result) =>
            clientGetSegmentLocalRotationEuler(
              client,
              subjectName,
              segmentName,
              result
            )
        );

        if (segmentIndex === 0) {
          const globalTranslation = callAsUnpackedOutputStruct<Float64Array>(
            CGetSegmentGlobalTranslationOutputType,
            (result) =>
              clientGetSegmentGlobalTranslation(
                client,
                subjectName,
                segmentName,
                result
              )
          );

          const staticRotation = callAsUnpackedOutputStruct<Float64Array>(
            CGetSegmentStaticRotationEulerOutputType,
            (result) =>
              clientGetSegmentStaticRotationEuler(
                client,
                subjectName,
                segmentName,
                result
              )
          );

          const globalRotation = callAsUnpackedOutputStruct<Float64Array>(
            CGetSegmentGlobalRotationEulerOutputType,
            (result) =>
              clientGetSegmentGlobalRotationEuler(
                client,
                subjectName,
                segmentName,
                result
              )
          );

          segments[segmentName] = {
            id: segmentIndex,
            // posx: -processTranslation(globalTranslation.at(1)),
            // posy: processTranslation(globalTranslation.at(2)),
            // posz: processTranslation(globalTranslation.at(0)),
            posx: processTranslation(localTranslation.at(0)),
            posy: processTranslation(localTranslation.at(1)),
            posz: processTranslation(localTranslation.at(2)),
            // posx: processTranslation(globalTranslation.at(0)),
            // posy: processTranslation(globalTranslation.at(1)),
            // posz: processTranslation(globalTranslation.at(2)),

            // SUPER CLOSE
            // rotx: -processRotation(globalRotation.at(1)),
            // roty: processRotation(globalRotation.at(2)),
            // rotz: processRotation(globalRotation.at(0)),

            // 120, 102 are close
            // Tried: 012, 120, 102, 201, 021, 210
            rotx: processRotation(localRotation.at(1)),
            roty: processRotation(localRotation.at(2)),
            rotz: processRotation(localRotation.at(0)),
          };
        } else {
          segments[segmentName] = {
            id: segmentIndex,
            posx: processTranslation(localTranslation.at(0)),
            posy: processTranslation(localTranslation.at(1)),
            posz: processTranslation(localTranslation.at(2)),
            rotx: processRotation(localRotation.at(0)),
            roty: processRotation(localRotation.at(1)),
            rotz: processRotation(localRotation.at(2)),
          };
        }
      }

      result.push({ name: subjectName, segments });
    }
    return result;
  }
  return null;
}

export function viconObserver(
  setIntervalTimeout: (timeout: NodeJS.Timeout) => void,
  fps = 90
): Rx.Observable<Buffer> {
  return new Rx.Observable<Buffer>((observer) => {
    let isLastData: (data: SubjectData[]) => boolean = () => false;
    setIntervalTimeout(
      setInterval(() => {
        const data = getData();
        if (!isLastData(data)) {
          observer.next(
            Buffer.from(data.map(subjectDataToBvh).join(""), "utf-8")
          );
          // isLastData = isExact(data, true);
        }
      }, 1000 / fps)
    );
  });
}
