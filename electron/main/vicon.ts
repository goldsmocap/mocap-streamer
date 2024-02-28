import { BitStream } from "bit-buffer";
import koffi, { TypeSpecWithAlignment } from "koffi";

const lib = koffi.load(
  "C:\\Program Files\\Vicon\\DataStream SDK\\Win64\\C\\ViconDataStreamSDK_C"
);

const KoffiOutParam = (inType: string) => `_Out_ ${inType}`;
const CPointerType = (inType: string) => `${inType}*`;
const CClientType = CPointerType("void");
const CStringType = "const char*";
const CBoolType = "int";
const CVoidType = "void";
const CEnumType = "int";
const CIntType = "int";
const CUnsignedIntType = "unsigned int";

const createViconOutputStruct = (
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

const CGetFrameNumberOutputType = createViconOutputStruct(
  "COutput_GetFrameNumber",
  "FrameNumber",
  CUnsignedIntType
);
const CGetSubjectCountOutputType = createViconOutputStruct(
  "COutput_GetSubjectCount",
  "SubjectCount",
  CUnsignedIntType
);
const CGetSegmentCountOutputType = createViconOutputStruct(
  "COutput_GetSegmentCount",
  "SegmentCount",
  CUnsignedIntType
);
const CGetSegmentLocalTranslationOutputType = createViconOutputStruct(
  "COutput_GetSegmentLocalTranslation",
  "Translation",
  koffi.array("double", 3),
  { Occluded: CBoolType }
);
const CGetSegmentLocalRotationEulerOutputType = createViconOutputStruct(
  "COutput_GetSegmentLocalRotationEulerXYZ",
  "Rotation",
  koffi.array("double", 3),
  { Occluded: CBoolType }
);

enum TsResultTypeMapping {
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
enum TsBoolTypeMapping {
  False,
  True,
}

const clientCreate = lib.func("Client_Create", CClientType, []);
const clientDestroy = lib.func("Client_Destroy", CVoidType, [CClientType]);
const clientConnect = lib.func("Client_Connect", CEnumType, [
  CClientType,
  CStringType,
]);
const clientIsConnected = lib.func("Client_IsConnected", CBoolType, [
  CClientType,
]);
const clientDisconnect = lib.func("Client_Disconnect", CEnumType, [
  CClientType,
]);
const clientEnableSegmentData = lib.func(
  "Client_EnableSegmentData",
  CEnumType,
  [CClientType]
);
const clientIsSegmentDataEnabled = lib.func(
  "Client_IsSegmentDataEnabled",
  CBoolType,
  [CClientType]
);
const clientGetFrame = lib.func("Client_GetFrame", CEnumType, [CClientType]);
const clientGetFrameNumber = lib.func("Client_GetFrameNumber", CVoidType, [
  CClientType,
  CGetFrameNumberOutputType.outParamName,
]);
const clientGetSubjectCount = lib.func("Client_GetSubjectCount", CVoidType, [
  CClientType,
  CGetSubjectCountOutputType.outParamName,
]);
const clientGetSubjectName = lib.func("Client_GetSubjectName", CEnumType, [
  CClientType,
  CUnsignedIntType,
  CIntType,
  KoffiOutParam("char*"),
]);
const clientGetSegmentCount = lib.func("Client_GetSegmentCount", CVoidType, [
  CClientType,
  CStringType,
  CGetSegmentCountOutputType.outParamName,
]);
const clientGetSegmentName = lib.func("Client_GetSegmentName", CEnumType, [
  CClientType,
  CStringType,
  CUnsignedIntType,
  CIntType,
  KoffiOutParam("char*"),
]);
const clientGetSegmentLocalTranslation = lib.func(
  "Client_GetSegmentLocalTranslation",
  CVoidType,
  [
    CClientType,
    CStringType,
    CStringType,
    CGetSegmentLocalTranslationOutputType.outParamName,
  ]
);
const clientGetSegmentLocalRotationEuler = lib.func(
  "Client_GetSegmentLocalRotationEulerXYZ",
  CVoidType,
  [
    CClientType,
    CStringType,
    CStringType,
    CGetSegmentLocalRotationEulerOutputType.outParamName,
  ]
);
const clientSetBufferSize = lib.func("Client_SetBufferSize", CVoidType, [
  CClientType,
  CUnsignedIntType,
]);

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
  console.log("Connecting to", host);
  clientSetBufferSize(client, 5);
  return [clientConnect(client, host), clientEnableSegmentData(client)].every(
    (result) => result === TsResultTypeMapping.Success
  );
}

function bufToString(buf: Buffer): string {
  return Array.from(buf.values())
    .map((c) => String.fromCharCode(c))
    .join("");
}

function callAsUnpackedOutputStruct<R = any>(
  createdEnum: ReturnType<typeof createViconOutputStruct>,
  callback: (result: any) => void,
  log = false
): R {
  const result: any = {};
  callback(result);
  if (log) console.log(result);
  return result[createdEnum.attr];
}

function swapBits(arr: Float64Array): Float64Array {
  let result = new Float64Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    const stream = new BitStream(arr.subarray(i, i + 1).buffer);
    stream.bigEndian = false;
    result[i] = stream.readFloat64();
  }
  return result;
}

export function getData() {
  if (
    isConnected() &&
    clientIsSegmentDataEnabled(client) === TsBoolTypeMapping.True &&
    clientGetFrame(client) === TsResultTypeMapping.Success
  ) {
    console.log(
      clientGetFrame(client),
      callAsUnpackedOutputStruct(CGetFrameNumberOutputType, (result) =>
        clientGetFrameNumber(client, result)
      )
    );
    const subjectCount = callAsUnpackedOutputStruct(
      CGetSubjectCountOutputType,
      (result) => clientGetSubjectCount(client, result)
    );
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
      console.log(subjectName, segmentCount);

      for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
        const segmentNameBuffer = Buffer.allocUnsafe(128);
        clientGetSegmentName(
          client,
          subjectName,
          segmentIndex,
          segmentNameBuffer.length,
          segmentNameBuffer
        );
        const segmentName = bufToString(segmentNameBuffer);
        const translation = callAsUnpackedOutputStruct<Float64Array>(
          CGetSegmentLocalTranslationOutputType,
          (result) =>
            clientGetSegmentLocalTranslation(
              client,
              subjectName,
              segmentName,
              result
            )
        );
        const rotation = callAsUnpackedOutputStruct<Float64Array>(
          CGetSegmentLocalRotationEulerOutputType,
          (result) =>
            clientGetSegmentLocalRotationEuler(
              client,
              subjectName,
              segmentName,
              result
            )
        );
        translation.buffer;
        console.log(
          `${segmentName} translation: [${swapBits(translation).join(
            ", "
          )}] rotation: [${swapBits(rotation).join(", ")}]`
        );
      }
    }
  }
  return null;
}
