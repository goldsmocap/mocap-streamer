import koffi, { TypeSpecWithAlignment } from "koffi";

const lib = koffi.load(".\\C\\Optitrack\\NatNetML.dll");
const KoffiOutParam = (inType: string) => `_Out_ ${inType}`;
const CPointerType = (inType: string) => `${inType}*`;

const CClientType = CPointerType("void");
const CStringType = "const char*";
const CBoolType = "int";
const CVoidType = "void";
const CEnumType = "int";
const CIntType = "int";
const CUInt16T = "uint16_t";
const CUnsignedIntType = "unsigned int";

enum verbosityTypeMapping {
  Verbosity_None = 0,
  Verbosity_Debug,
  Verbosity_Info,
  Verbosity_Warning,
  Verbosity_Error,
}
enum connectionTypeMapping {
  ConnectionType_Multicast = 0,
  ConnectionType_Unicast,
}
enum errorCodeTypeMapping {
  ErrorCode_OK = 0,
  ErrorCode_Internal,
  ErrorCode_External,
  ErrorCode_Network,
  ErrorCode_Other,
  ErrorCode_InvalidArgument,
  ErrorCode_InvalidOperation,
  ErrorCode_InvalidSize,
}
enum dataDescriptorsTypeMapping {
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

const connectParams = koffi.struct("sNatNetClientConnectParams", {
  connectionType: CEnumType,
  serverCommandPort: CUInt16T,
  serverDataPort: CUInt16T,
  serverAddress: CStringType,
  localAddress: CStringType,
  multicastAddress: CStringType,
  subscribedDataOnly: CBoolType,
});

export const clientCreate = lib.func("NatNetClient", CClientType, []);
export const clientConnect = lib.func("Connect", CEnumType, [connectParams]);
