import { FixedLengthTuple } from "../../utils.js";

export enum connectionTypeMapping {
  ConnectionType_Multicast = 0,
  ConnectionType_Unicast,
}

export enum errorCodeTypeMapping {
  ErrorCode_OK = 0,
  ErrorCode_Internal,
  ErrorCode_External,
  ErrorCode_Network,
  ErrorCode_Other,
  ErrorCode_InvalidArgument,
  ErrorCode_InvalidOperation,
  ErrorCode_InvalidSize,
}

export enum dataDescriptorsTypeMapping {
  Descriptor_MarkerSet = 0,
  Descriptor_RigidBody,
  Descriptor_Skeleton,
  Descriptor_ForcePlate,
  Descriptor_Device,
  Descriptor_Camera,
  Descriptor_Asset,
}

export enum assetTypesTypeMapping {
  AssetType_Undefined = 0,
  AssetType_TrainedMarkerset = 1,
}

export interface SNatNetClientConnectParams {
  connectionType?: connectionTypeMapping;
  serverCommandPort?: number;
  serverDataPort?: number;
  serverAddress?: string;
  localAddress?: string;
  multicastAddress?: string;
  subscribedDataOnly?: boolean;
  bitstreamVersion?: FixedLengthTuple<number, 4>;
}

interface SMarkerSetDescription {
  szName: string;
  szMarkerNames: string[];
}

type MarkerData = FixedLengthTuple<number, 3>;

interface SRigidBodyDescription {
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

interface SSkeletonDescription {
  szName: string;
  skeletonID: number;
  rigidBodies: SRigidBodyDescription[];
}

interface SForcePlateDescription {
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

interface SDeviceDescription {
  id: number;
  strName: string;
  strSerialNo: string;
  iDeviceType: number;
  iChannelDataType: number;
  szChannelNames: string[];
}

interface SCameraDescription {
  strName: string;
  x: number;
  y: number;
  z: number;
  qX: number;
  qY: number;
  qZ: number;
  qW: number;
}

interface SMarkerDescription {
  szName: string;
  id: number;
  x: number;
  y: number;
  z: number;
  size: number;
  params: number;
}

interface SAssetDescription {
  szName: string;
  assetType: number;
  assetId: number;
  rigidBodies: SRigidBodyDescription[];
  markers: SMarkerDescription;
}

type SDataDescription =
  | ({ type: "MarkerSet" } & SMarkerSetDescription)
  | ({ type: "RigidBody" } & SRigidBodyDescription)
  | ({ type: "Skeleton" } & SSkeletonDescription)
  | ({ type: "ForcePlate" } & SForcePlateDescription)
  | ({ type: "Device" } & SDeviceDescription)
  | ({ type: "Camera" } & SCameraDescription)
  | ({ type: "Asset" } & SAssetDescription);

export type SDataDescriptions = SDataDescription[];

interface SMarkerSetData {
  szName: string;
  markers: MarkerData[];
}

interface SRigidBodyData {
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

interface SSkeletonData {
  skeletonId: number;
  rigidBodies: SRigidBodyData[];
}

interface SMarker {
  id: number;
  x: number;
  y: number;
  z: number;
  size: number;
  params: number;
  residual: number;
}

interface SAssetData {
  assetId: number;
  rigidBodies: SRigidBodyData[];
  markerData: SMarker[];
}

type SAnalogChannelData = number[];

interface SForcePlateData {
  id: number;
  channelData: SAnalogChannelData[];
  params: number;
}

interface SDeviceData {
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
  clientConnect: (params: SNatNetClientConnectParams) => errorCodeTypeMapping;
  clientDisconnect: () => errorCodeTypeMapping;
  clientRegisterFrameCallback: () => errorCodeTypeMapping;
  clientGetDataDescriptions: () => SDataDescriptions | null;
  clientGetPreviousFrame: () => SFrameOfMocapData | null;
} = require("bindings")("optitrackBridge");
