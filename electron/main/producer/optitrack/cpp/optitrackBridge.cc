#include <napi.h>
#include <NatNetClient.h>
#include <NatNetTypes.h>

static NatNetClient *client;
static sFrameOfMocapData *lastFrame;

Napi::String Hello(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  return Napi::String::New(env, "World!");
}

Napi::Number ClientConnect(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  sNatNetClientConnectParams *params =
      Napi::ObjectWrap<sNatNetClientConnectParams>::Unwrap(info[0].As<Napi::Object>());

  client = new NatNetClient();
  ErrorCode code = client->Connect(*params);

  return Napi::Number::New(env, code);
}

Napi::Number ClientDisconnect(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  ErrorCode code = client->Disconnect();
  client = NULL;

  return Napi::Number::New(env, code);
}

void FrameCallback(sFrameOfMocapData *frameData, void *pUserData)
{
  lastFrame = frameData;
}

Napi::Number ClientRegisterFrameCallback(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  ErrorCode code = client->SetFrameReceivedCallback(FrameCallback);

  return Napi::Number::New(env, code);
}

Napi::Object wrapSMarkerSetDescription(Napi::Env env, sMarkerSetDescription *value)
{
  Napi::Object obj = Napi::Object::New(env);

  obj.Set("szName", Napi::String::New(env, value->szName));

  Napi::Array markerNames = Napi::Array::New(env, value->nMarkers);
  for (int32_t i = 0; i < value->nMarkers; i++)
  {
    markerNames.Set(i, Napi::String::New(env, value->szMarkerNames[i]));
  }
  obj.Set("szMarkerNames", markerNames);

  return obj;
}

Napi::Object wrapSRigidBodyDescription(Napi::Env env, sRigidBodyDescription *value)
{
  Napi::Object obj = Napi::Object::New(env);

  obj.Set("szName", Napi::String::New(env, value->szName));
  obj.Set("ID", Napi::Number::New(env, value->ID));
  obj.Set("parentID", Napi::Number::New(env, value->parentID));
  obj.Set("offsetx", Napi::Number::New(env, value->offsetx));
  obj.Set("offsety", Napi::Number::New(env, value->offsety));
  obj.Set("offsetz", Napi::Number::New(env, value->offsetz));
  obj.Set("offsetqx", Napi::Number::New(env, value->offsetqx));
  obj.Set("offsetqy", Napi::Number::New(env, value->offsetqy));
  obj.Set("offsetqz", Napi::Number::New(env, value->offsetqz));
  obj.Set("offsetqw", Napi::Number::New(env, value->offsetqw));

  Napi::Array markerPositions = Napi::Array::New(env, value->nMarkers);
  Napi::Array markerRequiredLabels = Napi::Array::New(env, value->nMarkers);
  Napi::Array markerNames = Napi::Array::New(env, value->nMarkers);

  for (int32_t i = 0; i < value->nMarkers; i++)
  {
    markerRequiredLabels.Set(i, Napi::Number::New(env, value->MarkerRequiredLabels[i]));

    Napi::Array position = Napi::Array::New(env, 3);
    position.Set((uint32_t)0, Napi::Number::New(env, value->MarkerPositions[i][0]));
    position.Set((uint32_t)1, Napi::Number::New(env, value->MarkerPositions[i][1]));
    position.Set((uint32_t)2, Napi::Number::New(env, value->MarkerPositions[i][2]));
    markerPositions.Set(i, position);

    markerNames.Set(i, Napi::String::New(env, value->szMarkerNames[i]));
  }

  obj.Set("MarkerPositions", markerPositions);
  obj.Set("MarkerRequiredLabels", markerRequiredLabels);
  obj.Set("szMarkerNames", markerNames);

  return obj;
}

Napi::Object wrapSSkeletonDescription(Napi::Env env, sSkeletonDescription *value)
{
  Napi::Object obj = Napi::Object::New(env);

  obj.Set("szName", Napi::String::New(env, value->szName));
  obj.Set("skeletonID", Napi::Number::New(env, value->skeletonID));

  Napi::Array rigidBodies = Napi::Array::New(env, value->nRigidBodies);

  for (int32_t i = 0; i < value->nRigidBodies; i++)
  {
    rigidBodies.Set(i, wrapSRigidBodyDescription(env, &value->RigidBodies[i]));
  }

  obj.Set("RigidBodies", rigidBodies);

  return obj;
}

Napi::Object wrapSDataDescription(Napi::Env env, sDataDescription *value)
{
  Napi::Object obj;

  switch (value->type)
  {
  case DataDescriptors::Descriptor_MarkerSet:
    obj = wrapSMarkerSetDescription(env, value->Data.MarkerSetDescription);
    obj.Set("type", Napi::String::New(env, "MarkerSet"));
    break;

  case DataDescriptors::Descriptor_RigidBody:
    obj = wrapSRigidBodyDescription(env, value->Data.RigidBodyDescription);
    obj.Set("type", Napi::String::New(env, "RigidBody"));
    break;

  case DataDescriptors::Descriptor_Skeleton:
    obj = wrapSSkeletonDescription(env, value->Data.SkeletonDescription);
    obj.Set("type", Napi::String::New(env, "Skeleton"));
    break;

  case DataDescriptors::Descriptor_ForcePlate:
    obj = Napi::Object::New(env);
    obj.Set("type", Napi::String::New(env, "ForcePlate"));
    break;

  case DataDescriptors::Descriptor_Device:
    obj = Napi::Object::New(env);
    obj.Set("type", Napi::String::New(env, "Device"));
    break;

  case DataDescriptors::Descriptor_Camera:
    obj = Napi::Object::New(env);
    obj.Set("type", Napi::String::New(env, "Camera"));
    break;

  case DataDescriptors::Descriptor_Asset:
    obj = Napi::Object::New(env);
    obj.Set("type", Napi::String::New(env, "Asset"));
    break;
  }

  return obj;
}

Napi::Array wrapSDataDescriptions(Napi::Env env, sDataDescriptions *value)
{
  Napi::Array arr = Napi::Array::New(env, value->nDataDescriptions);

  for (int32_t i = 0; i < value->nDataDescriptions; i++)
  {
    arr.Set(i, wrapSDataDescription(env, &value->arrDataDescriptions[i]));
  }

  return arr;
}

Napi::Object ClientGetDataDescriptions(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  sDataDescriptions **outDescriptions;
  ErrorCode code = client->GetDataDescriptionList(outDescriptions);

  return wrapSDataDescriptions(env, *outDescriptions);
}

Napi::Object wrapSFrameOfMocapData(Napi::Env env, sFrameOfMocapData *value)
{
  // TODO: Wrap the properties of this struct!
  Napi::Object obj = Napi::Object::New(env);

  obj.Set("iFrame", value->iFrame);

  obj.Set("nMarkerSets", value->nMarkerSets);
  obj.Set("MocapData", value->MocapData);

  obj.Set("nOtherMarkers", value->nOtherMarkers);
  obj.Set("OtherMarkers", value->OtherMarkers);

  obj.Set("nRigidBodies", value->nRigidBodies);
  obj.Set("RigidBodies", value->RigidBodies);

  obj.Set("nSkeletons", value->nSkeletons);
  obj.Set("Skeletons", value->Skeletons);

  obj.Set("nAssets", value->nAssets);
  obj.Set("Assets", value->Assets);

  obj.Set("nLabeledMarkers", value->nLabeledMarkers);
  obj.Set("LabeledMarkers", value->LabeledMarkers);

  obj.Set("nForcePlates", value->nForcePlates);
  obj.Set("ForcePlates", value->ForcePlates);

  obj.Set("nDevices", value->nDevices);
  obj.Set("Devices", value->Devices);

  obj.Set("Timecode", value->Timecode);
  obj.Set("TimecodeSubframe", value->TimecodeSubframe);
  obj.Set("fTimestamp", value->fTimestamp);
  obj.Set("CameraMidExposureTimestamp", value->CameraMidExposureTimestamp);
  obj.Set("CameraDataReceivedTimestamp", value->CameraDataReceivedTimestamp);
  obj.Set("TransmitTimestamp", value->TransmitTimestamp);
  obj.Set("PrecisionTimestampSecs", value->PrecisionTimestampSecs);
  obj.Set("PrecisionTimestampFractionalSecs", value->PrecisionTimestampFractionalSecs);
  obj.Set("params", value->params);

  return obj;
}

Napi::Object ClientGetPreviousFrame(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  // Wrap up lastFrame
  return wrapSFrameOfMocapData(env, lastFrame);
}

Napi::Object
InitAll(Napi::Env env, Napi::Object exports)
{
  exports.Set(Napi::String::New(env, "hello"),
              Napi::Function::New(env, Hello));

  exports.Set(Napi::String::New(env, "clientConnect"),
              Napi::Function::New(env, ClientConnect));

  exports.Set(Napi::String::New(env, "clientDisconnect"),
              Napi::Function::New(env, ClientDisconnect));

  exports.Set(Napi::String::New(env, "clientRegisterFrameCallback"),
              Napi::Function::New(env, ClientRegisterFrameCallback));

  return exports;
}

NODE_API_MODULE("optitrackBridge", InitAll)
