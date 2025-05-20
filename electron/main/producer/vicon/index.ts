import { BitStream } from "bit-buffer";
import * as Rx from "rxjs";

import { SegmentData, SubjectData } from "../../types";
import {
  CGetFrameNumberOutputType,
  CGetSegmentCountOutputType,
  CGetSegmentGlobalRotationEulerOutputType,
  CGetSegmentGlobalTranslationOutputType,
  CGetSegmentLocalRotationEulerOutputType,
  CGetSegmentLocalTranslationOutputType,
  CGetSegmentStaticRotationEulerOutputType,
  CGetSegmentStaticTranslationOutputType,
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
  clientGetSegmentStaticTranslation,
  clientGetSubjectCount,
  clientGetSubjectName,
  clientIsConnected,
  clientIsSegmentDataEnabled,
  clientSetAxisMapping,
  clientSetBufferSize,
  createViconOutputStruct,
  TsBoolTypeMapping,
  TsCDirectionTypeMapping,
  TsResultTypeMapping,
} from "./cDefinitions";
import { viconTransformMap } from "./transformMap.js";

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
  // clientSetAxisMapping(
  //   client,
  //   TsCDirectionTypeMapping.Left,
  //   TsCDirectionTypeMapping.Up,
  //   TsCDirectionTypeMapping.Forward
  // );
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

      const segments: SegmentData[] = [];

      for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
        const segmentNameBuffer = Buffer.allocUnsafe(128);
        clientGetSegmentName(
          client,
          subjectName,
          segmentIndex,
          segmentNameBuffer.length,
          segmentNameBuffer
        );
        const segmentName = viconTransformMap[bufToString(segmentNameBuffer)];
        if (segmentName == null) continue;

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
          const staticTranslation = callAsUnpackedOutputStruct<Float64Array>(
            CGetSegmentStaticTranslationOutputType,
            (result) =>
              clientGetSegmentStaticTranslation(
                client,
                subjectName,
                segmentName,
                result
              )
          );
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

          segments.push({
            id: segmentName,
            // posx: -processTranslation(globalTranslation.at(1)),
            // posy: processTranslation(globalTranslation.at(2)),
            // posz: processTranslation(globalTranslation.at(0)),
            posx: -processTranslation(localTranslation.at(1)),
            posy: processTranslation(localTranslation.at(2)),
            posz: -processTranslation(localTranslation.at(0)),
            // posx: processTranslation(globalTranslation.at(0)),
            // posy: processTranslation(globalTranslation.at(1)),
            // posz: processTranslation(globalTranslation.at(2)),

            // SUPER CLOSE
            // rotx: -processRotation(globalRotation.at(1)),
            // roty: processRotation(globalRotation.at(2)),
            // rotz: processRotation(globalRotation.at(0)),

            // 120, 102 are close
            // Tried: 012, 120, 102, 201, 021, 210
            rotx: processRotation(staticRotation.at(0)), // Try variations on 90 degree offsets
            roty: processRotation(staticRotation.at(1)),
            rotz: processRotation(staticRotation.at(2)),
          });
        } else {
          segments.push({
            id: segmentName,
            // posx: processTranslation(localTranslation.at(0)),
            // posy: processTranslation(localTranslation.at(1)),
            // posz: processTranslation(localTranslation.at(2)),
            posx: processTranslation(localTranslation.at(0)),
            posy: processTranslation(localTranslation.at(1)),
            posz: processTranslation(localTranslation.at(2)),
            rotx: processRotation(localRotation.at(0)),
            roty: processRotation(localRotation.at(1)),
            rotz: processRotation(localRotation.at(2)),
          });
        }
      }

      result.push({ name: subjectName, segments });
    }
    return result;
  }
  return null;
}

const objectKeys = <K extends keyof {}>(obj: Record<K, unknown>): K[] =>
  (Object.getOwnPropertyNames(obj) as K[]).concat(
    Object.getOwnPropertySymbols(obj) as K[]
  );

function objectEntriesChecks<T extends object>(a: T, b: object): b is T {
  const aKeys = objectKeys(a);
  const bKeySet = new Set(objectKeys(b));
  return (
    aKeys.length === bKeySet.size &&
    aKeys.every((k) => bKeySet.has(k) && isEqual(a[k], b[k]))
  );
}

function isEqual(a: unknown, b: unknown): boolean {
  return (
    // Shallow checks
    a === b ||
    (Number.isNaN(a) && Number.isNaN(b)) ||
    (Array.isArray(a)
      ? // Array checks
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((v, i) => isEqual(v, b[i]))
      : // Object checks
        a != null &&
        b != null &&
        typeof a === "object" &&
        typeof b === "object" &&
        !Array.isArray(b) &&
        objectEntriesChecks(a, b))
  );
}

export function viconObserver(
  setIntervalTimeout: (timeout: NodeJS.Timeout) => void,
  fps = 90
): Rx.Observable<SubjectData[]> {
  return new Rx.Observable<SubjectData[]>((observer) => {
    let lastData: SubjectData[] | null = null;
    setIntervalTimeout(
      setInterval(() => {
        const data = getData();
        if (data != null && !isEqual(data, lastData)) {
          observer.next(data);
          lastData = data;
        }
      }, 1000 / fps)
    );
  });
}
