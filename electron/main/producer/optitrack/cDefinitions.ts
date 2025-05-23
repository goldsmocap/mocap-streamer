import { FixedLengthTuple } from "../../utils.js";

export enum ConnectionType {
  ConnectionType_Multicast = 0,
  ConnectionType_Unicast,
}

export enum ErrorCode {
  ErrorCode_OK = 0,
  ErrorCode_Internal,
  ErrorCode_External,
  ErrorCode_Network,
  ErrorCode_Other,
  ErrorCode_InvalidArgument,
  ErrorCode_InvalidOperation,
  ErrorCode_InvalidSize,
}

export enum DataDescriptors {
  Descriptor_MarkerSet = 0,
  Descriptor_RigidBody,
  Descriptor_Skeleton,
  Descriptor_ForcePlate,
  Descriptor_Device,
  Descriptor_Camera,
  Descriptor_Asset,
}

export enum AssetTypes {
  AssetType_Undefined = 0,
  AssetType_TrainedMarkerset = 1,
}

export interface SNatNetClientConnectParams {
  connectionType?: ConnectionType;
  serverCommandPort?: number;
  serverDataPort?: number;
  serverAddress?: string;
  localAddress?: string;
  multicastAddress?: string;
  subscribedDataOnly?: boolean;
  bitstreamVersion?: FixedLengthTuple<number, 4>;
}

export interface SMarkerSetDescription {
  szName: string;
  szMarkerNames: string[];
}

export type MarkerData = FixedLengthTuple<number, 3>;

export interface SRigidBodyDescription {
  szName: string;
  id: number;
  parentId: number;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  offsetQX: number;
  offsetQY: number;
  offsetQZ: number;
  offsetQW: number;
  markerPositions: MarkerData[];
  markerRequiredLabels: number[];
  szMarkerNames: string[];
}

export interface SSkeletonDescription {
  szName: string;
  skeletonId: number;
  rigidBodies: SRigidBodyDescription[];
}

export interface SForcePlateDescription {
  id: number;
  strSerialNo: string;
  fWidth: number;
  fLength: number;
  fOriginX: number;
  fOriginY: number;
  fOriginZ: number;
  fCalMat: FixedLengthTuple<FixedLengthTuple<number, 12>, 12>;
  fCorners: FixedLengthTuple<MarkerData, 4>;
  iPlateType: number;
  iChannelDataType: number;
  szChannelNames: string[];
}

export interface SDeviceDescription {
  id: number;
  strName: string;
  strSerialNo: string;
  iDeviceType: number;
  iChannelDataType: number;
  szChannelNames: string[];
}

export interface SCameraDescription {
  strName: string;
  x: number;
  y: number;
  z: number;
  qX: number;
  qY: number;
  qZ: number;
  qW: number;
}

export interface SMarkerDescription {
  szName: string;
  id: number;
  x: number;
  y: number;
  z: number;
  size: number;
  params: number;
}

export interface SAssetDescription {
  szName: string;
  assetType: number;
  assetId: number;
  rigidBodies: SRigidBodyDescription[];
  markers: SMarkerDescription;
}

export type SDataDescription =
  | ({ type: "MarkerSet" } & SMarkerSetDescription)
  | ({ type: "RigidBody" } & SRigidBodyDescription)
  | ({ type: "Skeleton" } & SSkeletonDescription)
  | ({ type: "ForcePlate" } & SForcePlateDescription)
  | ({ type: "Device" } & SDeviceDescription)
  | ({ type: "Camera" } & SCameraDescription)
  | ({ type: "Asset" } & SAssetDescription);

export type SDataDescriptions = SDataDescription[];

export interface SMarkerSetData {
  szName: string;
  markers: MarkerData[];
}

export interface SRigidBodyData {
  id: number;
  x: number;
  y: number;
  z: number;
  qX: number;
  qY: number;
  qZ: number;
  qW: number;
  meanError: number;
  params: number;
}

export interface SSkeletonData {
  skeletonId: number;
  rigidBodies: SRigidBodyData[];
}

export interface SMarker {
  id: number;
  x: number;
  y: number;
  z: number;
  size: number;
  params: number;
  residual: number;
}

export interface SAssetData {
  assetId: number;
  rigidBodies: SRigidBodyData[];
  markerData: SMarker[];
}

export type SAnalogChannelData = number[];

export interface SForcePlateData {
  id: number;
  channelData: SAnalogChannelData[];
  params: number;
}

export interface SDeviceData {
  id: number;
  channelData: SAnalogChannelData[];
  params: number;
}

export interface SFrameOfMocapData {
  iFrame: number;
  markerSets: SMarkerSetData[];
  otherMarkers: MarkerData[];
  rigidBodies: SRigidBodyData[];
  skeletons: SSkeletonData[];
  assets: SAssetData[];
  labeledMarkers: SMarker[];
  forcePlates: SForcePlateData[];
  devices: SDeviceData[];
  timecode: number;
  timecodeSubframe: number;
  fTimestamp: number;
  cameraMidExposureTimestamp: number;
  cameraDataReceivedTimestamp: number;
  transmitTimestamp: number;
  precisionTimestampSecs: number;
  precisionTimestampFractionalSecs: number;
  params: number;
}

export const optitrackBridge: {
  clientConnect: (params: SNatNetClientConnectParams) => ErrorCode;
  clientDisconnect: () => ErrorCode;
  clientRegisterFrameCallback: () => ErrorCode;
  clientGetDataDescriptions: () => SDataDescriptions | ErrorCode;
  clientGetPreviousFrame: () => SFrameOfMocapData | null;
} = require("bindings")("optitrackBridge");
