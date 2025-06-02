import * as Rx from "rxjs";
import { SegmentData, SubjectData } from "../../types.js";
import { checkExhausted, raise, zip } from "../../utils.js";
import {
  ErrorCode,
  optitrackBridge,
  SFrameOfMocapData,
  SNatNetClientConnectParams,
  SSkeletonDescription,
} from "./cDefinitions.js";

function handleErrorCode(code: ErrorCode): Error | null {
  switch (code) {
    case ErrorCode.ErrorCode_OK:
      return null;

    case ErrorCode.ErrorCode_Internal:
      return new Error("Internal error");

    case ErrorCode.ErrorCode_External:
      return new Error("External error");

    case ErrorCode.ErrorCode_Network:
      return new Error("Network error");

    case ErrorCode.ErrorCode_Other:
      return new Error("Other unknown error");

    case ErrorCode.ErrorCode_InvalidArgument:
      return new Error("Invalid argument error");

    case ErrorCode.ErrorCode_InvalidOperation:
      return new Error("Invalid operation error");

    case ErrorCode.ErrorCode_InvalidSize:
      return new Error("Invalid size error");

    default:
      return checkExhausted(code);
  }
}

function connect(params: SNatNetClientConnectParams) {
  const err = handleErrorCode(optitrackBridge.clientConnect(params));
  optitrackBridge.clientRegisterFrameCallback();
  if (err != null) throw err;
}

function disconnect() {
  const err = handleErrorCode(optitrackBridge.clientDisconnect());
  if (err != null) throw err;
}

let skeletons: Record<number, SSkeletonDescription> = {};

function getSkeletonsFromIds(skeletonIds: number[]): SSkeletonDescription[] {
  let fetchedDescriptions: boolean = false;
  return skeletonIds.map((id) => {
    if (skeletons[id] != null) return skeletons[id];
    if (fetchedDescriptions)
      throw new Error(`Skeleton with ID ${id} not found.`);
    const descriptions = optitrackBridge.clientGetDataDescriptions();
    if (typeof descriptions === "number") {
      throw (
        handleErrorCode(descriptions) ??
        new Error("Unknown error getting data descriptions")
      );
    } else {
      for (const description of descriptions) {
        if (description.type === "Skeleton") {
          if (skeletons[description.skeletonId] == null) {
            skeletons[description.skeletonId] = description;
          }
        }
      }
    }
    return skeletons[id];
  });
}

function frameToSubjectData(frame: SFrameOfMocapData): SubjectData[] {
  return zip(
    frame.skeletons,
    getSkeletonsFromIds(frame.skeletons.map(({ skeletonId }) => skeletonId))
  ).map(([skeleton, desc]): SubjectData => {
    return {
      name: desc.szName,
      segments: skeleton.rigidBodies.map((rigidBody): SegmentData => {
        const rigidBodyDesc =
          desc.rigidBodies.find((desc) => desc.id === rigidBody.id) ??
          raise(
            new Error(
              `Rigid body with ID ${rigidBody.id} on skeleton ${desc.skeletonId} not found.`
            )
          );

        return {
          id: rigidBodyDesc.szName.replace(new RegExp(`^${desc.szName}_?`), ""),
          posx: -rigidBody.x,
          posy: rigidBody.y,
          posz: rigidBody.z,
          rotx: -rigidBody.qX,
          roty: rigidBody.qY,
          rotz: rigidBody.qZ,
          rotw: -rigidBody.qW,
        };
      }),
    };
  });
}

function observer(
  setIntervalTimeout: (timeout: NodeJS.Timeout) => void,
  fps = 90
): Rx.Observable<SubjectData[]> {
  return new Rx.Observable<SubjectData[]>((observer) => {
    let lastIFrame: number | null = null;
    setIntervalTimeout(
      setInterval(() => {
        const frame = optitrackBridge.clientGetPreviousFrame();
        if (frame != null && frame.iFrame !== lastIFrame) {
          lastIFrame = frame.iFrame;
          observer.next(frameToSubjectData(frame));
        }
      }, 1000 / fps)
    );
  });
}

export const optitrack = { connect, disconnect, observer };
