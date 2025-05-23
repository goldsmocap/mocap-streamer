import * as Rx from "rxjs";
import { quaternionToEuler } from "../../conversion.js";
import { SegmentData, SubjectData } from "../../types.js";
import { checkExhausted, raise } from "../../utils.js";
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
  if (err != null) throw err;
}

function disconnect() {
  const err = handleErrorCode(optitrackBridge.clientDisconnect());
  if (err != null) throw err;
}

let skeletons: SSkeletonDescription[] = [];

function getSkeletonFromId(skeletonId: number): SSkeletonDescription {
  const foundSkeleton = skeletons.find(
    (skeleton) => skeletonId === skeleton.skeletonId
  );
  if (foundSkeleton != null) return foundSkeleton;

  const dataDescriptions = optitrackBridge.clientGetDataDescriptions();
  if (typeof dataDescriptions === "number") {
    throw (
      handleErrorCode(dataDescriptions) ??
      new Error("Unknown error getting data descriptions")
    );
  }

  skeletons = dataDescriptions.flatMap((description) =>
    description.type === "Skeleton" ? [description] : []
  );

  return (
    skeletons.find((skeleton) => skeletonId === skeleton.skeletonId) ??
    raise(new Error(`Skeleton with ID ${skeletonId} not found.`))
  );
}

function frameToSubjectData(frame: SFrameOfMocapData): SubjectData[] {
  return frame.skeletons.map((skeleton): SubjectData => {
    const skeletonDesc = getSkeletonFromId(skeleton.skeletonId);
    return {
      name: skeletonDesc.szName,
      segments: skeleton.rigidBodies.map((rigidBody): SegmentData => {
        const rigidBodyDesc =
          skeletonDesc.rigidBodies.find((desc) => desc.id === rigidBody.id) ??
          raise(
            new Error(
              `Rigid body with ID ${rigidBody.id} on skeleton ${skeletonDesc.skeletonId} not found.`
            )
          );

        const [rotx, roty, rotz] = quaternionToEuler(
          rigidBody.qX,
          rigidBody.qY,
          rigidBody.qZ,
          rigidBody.qW
        );

        return {
          id: rigidBodyDesc.szName,
          posx: rigidBody.x,
          posy: rigidBody.y,
          posz: rigidBody.z,
          rotx,
          roty,
          rotz,
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
