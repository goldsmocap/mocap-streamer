import * as Rx from "rxjs";
import { Logger, LogMessage, SegmentData, SubjectData } from "../../types.js";
import { checkExhausted, zip } from "../../utils.js";
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
      logger({ type: "error", text: "Internal error" });
      break;

    case ErrorCode.ErrorCode_External:
      logger({ type: "error", text: "External error" });
      break;

    case ErrorCode.ErrorCode_Network:
      logger({ type: "error", text: "Network error" });
      break;

    case ErrorCode.ErrorCode_Other:
      logger({ type: "error", text: "Other unknown error" });
      break;

    case ErrorCode.ErrorCode_InvalidArgument:
      logger({ type: "error", text: "Invalid argument error" });
      break;

    case ErrorCode.ErrorCode_InvalidOperation:
      logger({ type: "error", text: "Invalid operation error" });
      break;

    case ErrorCode.ErrorCode_InvalidSize:
      logger({ type: "error", text: "Invalid size error" });
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

function getSkeletonsFromIds(
  skeletonIds: number[],
  logger: Logger
): SSkeletonDescription[] {
  let fetchedDescriptions: boolean = false;
  const descriptions = optitrackBridge.clientGetDataDescriptions();
  if (typeof descriptions === "number") {
    handleErrorCode(descriptions, logger, {
      type: "error",
      text: "Unknown error getting data descriptions",
    });
    return;
  }
  const skeletons = descriptions.reduce(
    (acc, description) =>
      description.type === "Skeleton"
        ? { ...acc, [description.skeletonId]: description }
        : acc,
    {} as Record<number, SSkeletonDescription>
  );
  return skeletonIds.map((id) => {
    if (fetchedDescriptions)
      logger({ type: "error", text: `Skeleton with ID ${id} not found.` });
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
        const rigidBodyDesc = desc.rigidBodies.find(
          (desc) => desc.id === rigidBody.id
        );
        if (rigidBodyDesc != null) {
          return {
            id: rigidBodyDesc.szName.replace(
              new RegExp(`^${desc.szName}_?`),
              ""
            ),
            posx: 100 * -rigidBody.x,
            posy: 100 * rigidBody.y,
            posz: 100 * rigidBody.z,
            rotx: -rigidBody.qX,
            roty: rigidBody.qY,
            rotz: rigidBody.qZ,
            rotw: -rigidBody.qW,
          };
        } else {
          logger({
            type: "error",
            text: `Rigid body with ID ${rigidBody.id} on skeleton ${desc.skeletonId} not found.`,
          });
        }
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
