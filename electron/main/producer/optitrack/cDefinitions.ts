import koffi from "koffi";

// const lib = koffi.load(".\\C\\Optitrack\\OptitrackCPPClient.dll");
const lib = koffi.load(
  ".\\OptitrackCPPClient\\x64\\Release\\OptitrackCPPClient.dll"
);
const KoffiOutParam = (inType: string) => `_Out_ ${inType}`;
const CPointerType = (inType: string) => `${inType}*`;

const CClientType = CPointerType("void");
const CStringType = "const char*";
const CBoolType = "int";
const CVoidType = "void";
const CEnumType = "int";
const CIntType = "int";
const CUInt16T = "uint16_t";
const CInt32T = "int32_t";
const CFloat = "float";
const CUnsignedIntType = "unsigned int";

enum verbosityTypeMapping {
  Verbosity_None = 0,
  Verbosity_Debug,
  Verbosity_Info,
  Verbosity_Warning,
  Verbosity_Error,
}
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
enum assetTypesTypeMapping {
  AssetType_Undefined = 0,
  AssetType_TrainedMarkerset = 1,
}

export const connectParams = koffi.struct("sNatNetClientConnectParams", {
  connectionType: CEnumType,
  serverCommandPort: CUInt16T,
  serverDataPort: CUInt16T,
  serverAddress: CStringType,
  localAddress: CStringType,
  multicastAddress: CStringType,
  subscribedDataOnly: CBoolType,
});

export const markerData = koffi.array(CFloat, 3, "Array");

export const rigidBodyDescription = koffi.struct("sRigidBodyDescription", {
  szName: CPointerType("char"),
  ID: CInt32T,
  parentID: CInt32T,
  offsetx: CFloat,
  offsety: CFloat,
  offsetz: CFloat,
  offsetqx: CFloat,
  offsetqy: CFloat,
  offsetqz: CFloat,
  offsetqw: CFloat,
  nMarkers: CInt32T,
  MarkerPositions: markerData,
  MarkerRequiredLabels: CPointerType(CInt32T),
  szMarkerNames: CPointerType("char*"),
});

export const skeletonDescription = koffi.struct("sSkeletonDescription", {
  szName: CPointerType("char"),
  skeletonID: CInt32T,
  nRigidBodies: CInt32T,
  RigidBodies: rigidBodyDescription,
});

export const markerSetDescription = koffi.struct("sMarkerSetDescription", {
  szName: CPointerType("char"),
  nMarkers: CInt32T,
  szMarkerNames: CPointerType("char*"),
});

export const dataDescription = koffi.struct("sDataDescription", {
  type: CInt32T,
  Data: koffi.union({
    MarkerSetDescription: markerSetDescription,
    RigidBodyDescription: rigidBodyDescription,
    SkeletonDescription: skeletonDescription,
    // ForcePlateDescription: CPointerType("sForcePlateDescription"),
    // DeviceDescription: CPointerType("sDeviceDescription"),
    // CameraDescription: CPointerType("sCameraDescription"),
    // AssetDescription: CPointerType("sAssetDescription"),
  }),
});

export const dataDescriptions = koffi.struct("sDataDescriptions", {
  nDataDescriptions: CInt32T,
  arrDataDescription: koffi.array(dataDescription, 2000, "Array"),
});

// Functions

export const clientConnect = lib.func("Client_Connect", CEnumType, [
  connectParams,
]);
export const clientDisconnect = lib.func("Client_Disconnect", CEnumType, []);
export const clientRegisterFrameCallback = lib.func(
  "Client_RegisterFrameCallback",
  CEnumType,
  []
);
export const clientGetDataDescriptions = lib.func(
  "Client_GetDataDescriptions",
  CEnumType,
  [KoffiOutParam(CPointerType("sDataDescription*"))]
);
export const clientGetPreviousFrame = lib.func(
  "Client_GetPreviousFrame",
  CVoidType,
  []
);
