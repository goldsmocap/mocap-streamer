import * as Rx from "rxjs";
import { Logger, LogMessage, SegmentData, SubjectData } from "../../types.js";
import { checkExhausted, raise, zip } from "../../utils.js";
import {
  ErrorCode,
  optitrackBridge,
  SFrameOfMocapData,
  SNatNetClientConnectParams,
  SSkeletonDescription,
} from "./cDefinitions.js";

function handleErrorCode(
  code: ErrorCode,
  logger: Logger,
  okLog?: LogMessage
): void {
  switch (code) {
    case ErrorCode.ErrorCode_OK:
      if (okLog != null) logger(okLog);
      break;

    case ErrorCode.ErrorCode_Internal:
      logger({ type: "error", text: "[Optitrack] Internal error" });
      break;

    case ErrorCode.ErrorCode_External:
      logger({ type: "error", text: "[Optitrack] External error" });
      break;

    case ErrorCode.ErrorCode_Network:
      logger({ type: "error", text: "[Optitrack] Network error" });
      break;

    case ErrorCode.ErrorCode_Other:
      logger({ type: "error", text: "[Optitrack] Other unknown error" });
      break;

    case ErrorCode.ErrorCode_InvalidArgument:
      logger({ type: "error", text: "[Optitrack] Invalid argument error" });
      break;

    case ErrorCode.ErrorCode_InvalidOperation:
      logger({ type: "error", text: "[Optitrack] Invalid operation error" });
      break;

    case ErrorCode.ErrorCode_InvalidSize:
      logger({ type: "error", text: "[Optitrack] Invalid size error" });
      break;

    default:
      return checkExhausted(code);
  }
}

function connect(params: SNatNetClientConnectParams, logger: Logger) {
  handleErrorCode(optitrackBridge.clientConnect(params), logger);
  optitrackBridge.clientRegisterFrameCallback();
}

function disconnect(logger: Logger) {
  handleErrorCode(optitrackBridge.clientDisconnect(), logger);
}

let skeletons: Record<number, SSkeletonDescription> = {};

function getSkeletonsFromIds(
  skeletonIds: number[],
  logger: Logger
): SSkeletonDescription[] {
  let fetchedDescriptions: boolean = false;
  return skeletonIds.map((id) => {
    if (skeletons[id] != null) return skeletons[id];
    if (fetchedDescriptions)
      throw new Error(`Skeleton with ID ${id} not found.`);
    const descriptions = optitrackBridge.clientGetDataDescriptions();
    if (typeof descriptions === "number") {
      handleErrorCode(descriptions, logger, {
        type: "error",
        text: "[Optitrack] Unknown error getting data descriptions",
      });
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

function frameToSubjectData(
  frame: SFrameOfMocapData,
  logger: Logger
): SubjectData[] {
  return zip(
    frame.skeletons,
    getSkeletonsFromIds(
      frame.skeletons.map(({ skeletonId }) => skeletonId),
      logger
    )
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
  logger: Logger,
  fps = 90
): Rx.Observable<SubjectData[]> {
  return new Rx.Observable<SubjectData[]>((observer) => {
    let lastIFrame: number | null = null;
    setIntervalTimeout(
      setInterval(() => {
        const frame = optitrackBridge.clientGetPreviousFrame();
        if (frame != null && frame.iFrame !== lastIFrame) {
          lastIFrame = frame.iFrame;
          observer.next(frameToSubjectData(frame, logger));
        }
      }, 1000 / fps)
    );
  });
}

export const optitrack = { connect, disconnect, observer };
