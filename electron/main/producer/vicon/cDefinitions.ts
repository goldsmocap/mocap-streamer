import koffi, { TypeSpecWithAlignment } from "koffi";

// https://help.vicon.com/space/DSSDK112/10027198/Vicon+DataStream+SDK+Quick+Start+Guide+for+Python?attachment=/download/attachments/10027198/Vicon%2520DataStream%2520SDK%25201.12%2520Developers%2520Guide.pdf&type=application/pdf&filename=Vicon+DataStream+SDK+1.12+Developers+Guide.pdf
const lib = koffi.load(".\\C\\Vicon\\ViconDataStreamSDK_C");

const KoffiOutParam = (inType: string) => `_Out_ ${inType}`;
const CPointerType = (inType: string) => `${inType}*`;
const CClientType = CPointerType("void");
const CConstStringType = "const char*";
const CStringType = "char*";
const CBoolType = "int";
const CVoidType = "void";
const CEnumType = "int";
const CIntType = "int";
const CUnsignedIntType = "unsigned int";

export const createViconOutputStruct = (
  name: string,
  attr: string,
  attrType: TypeSpecWithAlignment,
  extra: Record<string, TypeSpecWithAlignment> = {}
) => ({
  attr,
  name,
  outParamName: KoffiOutParam(CPointerType(name)),
  obj: koffi.struct(name, {
    Result: CEnumType,
    [attr]: attrType,
    ...extra,
  }),
});

// Types

export const CGetFrameNumberOutputType = createViconOutputStruct(
  "COutput_GetFrameNumber",
  "FrameNumber",
  CUnsignedIntType
);

export const CGetSubjectCountOutputType = createViconOutputStruct(
  "COutput_GetSubjectCount",
  "SubjectCount",
  CUnsignedIntType
);

export const CGetSegmentCountOutputType = createViconOutputStruct(
  "COutput_GetSegmentCount",
  "SegmentCount",
  CUnsignedIntType
);

export const CGetSegmentLocalTranslationOutputType = createViconOutputStruct(
  "COutput_GetSegmentLocalTranslation",
  "Translation",
  koffi.array("double", 3),
  { Occluded: CBoolType }
);

export const CGetSegmentLocalRotationQuaternionOutputType =
  createViconOutputStruct(
    "COutput_GetSegmentLocalRotationQuaternion",
    "Rotation",
    koffi.array("double", 4),
    { Occluded: CBoolType }
  );

export const CGetSegmentStaticScaleOutputType = createViconOutputStruct(
  "COutput_GetSegmentStaticScale",
  "Scale",
  koffi.array("double", 3)
);

// Enums

export enum TsResultTypeMapping {
  UnknownResult /**< The result is unknown. Treat it as a failure. */,
  NotImplemented /**< The function called has not been implemented in this version of the SDK.*/,
  Success /**< The function call succeeded.*/,
  InvalidHostName /**< The "HostName" parameter passed to Connect() is invalid.*/,
  InvalidMulticastIP /**< The "MulticastIP" parameter was not in the range "224.0.0.0" - "239.255.255.255"*/,
  ClientAlreadyConnected /**< Connect() was called whilst already connected to a DataStream.*/,
  ClientConnectionFailed /**< Connect() could not establish a connection to the DataStream server.*/,
  ServerAlreadyTransmittingMulticast /**< StartTransmittingMulticast() was called when the current DataStream server was already transmitting multicast on behalf of this client.*/,
  ServerNotTransmittingMulticast /**< StopTransmittingMulticast() was called when the current DataStream server was not transmitting multicast on behalf of this client.*/,
  NotConnected /**< You have called a function which requires a connection to the DataStream server, but do not have a connection.*/,
  NoFrame /**< You have called a function which requires a frame to be fetched from the DataStream server, but do not have a frame.*/,
  InvalidIndex /**< An index you have passed to a function is out of range.*/,
  InvalidCameraName /**< The Camera Name you passed to a function is invalid in this frame.*/,
  InvalidSubjectName /**< The Subject Name you passed to a function is invalid in this frame.*/,
  InvalidSegmentName /**< The Segment Name you passed to a function is invalid in this frame.*/,
  InvalidMarkerName /**< The Marker Name you passed to a function is invalid in this frame.*/,
  InvalidDeviceName /**< The Device Name you passed to a function is invalid in this frame.*/,
  InvalidDeviceOutputName /**< The Device Output Name you passed to a function is invalid in this frame.*/,
  InvalidLatencySampleName /**< The Latency Sample Name you passed to a function is invalid in this frame.*/,
  CoLinearAxes /**< The directions passed to SetAxisMapping() contain input which would cause two or more axes to lie along the same line, e.g. "Up" and "Down" are on the same line.*/,
  LeftHandedAxes /**< The directions passed to SetAxisMapping() would result in a left-handed coordinate system. This is not supported in the SDK.*/,
  HapticAlreadySet /**< Haptic feedback is already set.*/,
  EarlyDataRequested /**< Re-timed data requested is from before the first time sample we still have. */,
  LateDataRequested /**< Re-timed data requested is too far into the future to be predicted. */,
  InvalidOperation /**< The method called is not valid in the current mode of operation */,
  NotSupported /**< The SDK version or operating system does not support this function. */,
  ConfigurationFailed /**< The operating system configuration changed failed. */,
  NotPresent /**< The requested data type is not present in the stream. */,
}

export enum TsBoolTypeMapping {
  False,
  True,
}

export enum TsCDirectionTypeMapping {
  Up,
  Down,
  Left,
  Right,
  Forward,
  Backward,
}

// Functions

export const clientCreate = lib.func("Client_Create", CClientType, []);

export const clientDestroy = lib.func("Client_Destroy", CVoidType, [
  CClientType,
]);

export const clientConnect = lib.func("Client_Connect", CEnumType, [
  CClientType,
  CConstStringType,
]);

export const clientIsConnected = lib.func("Client_IsConnected", CBoolType, [
  CClientType,
]);

export const clientDisconnect = lib.func("Client_Disconnect", CEnumType, [
  CClientType,
]);

export const clientEnableSegmentData = lib.func(
  "Client_EnableSegmentData",
  CEnumType,
  [CClientType]
);

export const clientIsSegmentDataEnabled = lib.func(
  "Client_IsSegmentDataEnabled",
  CBoolType,
  [CClientType]
);

export const clientGetFrame = lib.func("Client_GetFrame", CEnumType, [
  CClientType,
]);

export const clientGetFrameNumber = lib.func(
  "Client_GetFrameNumber",
  CVoidType,
  [CClientType, CGetFrameNumberOutputType.outParamName]
);

export const clientGetSubjectCount = lib.func(
  "Client_GetSubjectCount",
  CVoidType,
  [CClientType, CGetSubjectCountOutputType.outParamName]
);

export const clientGetSubjectName = lib.func(
  "Client_GetSubjectName",
  CEnumType,
  [CClientType, CUnsignedIntType, CIntType, KoffiOutParam("char*")]
);

export const clientGetSegmentCount = lib.func(
  "Client_GetSegmentCount",
  CVoidType,
  [CClientType, CConstStringType, CGetSegmentCountOutputType.outParamName]
);

export const clientGetSegmentName = lib.func(
  "Client_GetSegmentName",
  CEnumType,
  [
    CClientType,
    CConstStringType,
    CUnsignedIntType,
    CIntType,
    KoffiOutParam(CStringType),
  ]
);

export const clientGetSegmentLocalTranslation = lib.func(
  "Client_GetSegmentLocalTranslation",
  CVoidType,
  [
    CClientType,
    CConstStringType,
    CConstStringType,
    CGetSegmentLocalTranslationOutputType.outParamName,
  ]
);

export const clientGetSegmentLocalRotationQuaternion = lib.func(
  "Client_GetSegmentLocalRotationQuaternion",
  CVoidType,
  [
    CClientType,
    CConstStringType,
    CConstStringType,
    CGetSegmentLocalRotationQuaternionOutputType.outParamName,
  ]
);

export const clientSetBufferSize = lib.func("Client_SetBufferSize", CVoidType, [
  CClientType,
  CUnsignedIntType,
]);

export const clientSetAxisMapping = lib.func(
  "Client_SetAxisMapping",
  CVoidType,
  [CClientType, CEnumType, CEnumType, CEnumType]
);
