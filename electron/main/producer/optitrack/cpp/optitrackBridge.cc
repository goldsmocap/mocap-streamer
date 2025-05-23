#include <napi.h>
#include <iostream>
#include <NatNetClient.h>
#include <NatNetTypes.h>

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

Napi::Array wrapMarkerData(Napi::Env env, MarkerData value)
{
  Napi::Array arr = Napi::Array::New(env, 3);

  for (int32_t i = 0; i < 3; i++)
  {
    arr.Set(i, Napi::Number::New(env, (double)(value[i])));
  }

  return arr;
}

Napi::Object wrapSRigidBodyDescription(Napi::Env env, sRigidBodyDescription *value)
{
  Napi::Object obj = Napi::Object::New(env);

  obj.Set("szName", Napi::String::New(env, value->szName));
  obj.Set("id", Napi::Number::New(env, (double)(value->ID)));
  obj.Set("parentId", Napi::Number::New(env, (double)(value->parentID)));
  obj.Set("offsetX", Napi::Number::New(env, (double)(value->offsetx)));
  obj.Set("offsetY", Napi::Number::New(env, (double)(value->offsety)));
  obj.Set("offsetZ", Napi::Number::New(env, (double)(value->offsetz)));
  obj.Set("offsetQX", Napi::Number::New(env, (double)(value->offsetqx)));
  obj.Set("offsetQY", Napi::Number::New(env, (double)(value->offsetqy)));
  obj.Set("offsetQZ", Napi::Number::New(env, (double)(value->offsetqz)));
  obj.Set("offsetQW", Napi::Number::New(env, (double)(value->offsetqw)));

  Napi::Array markerPositions = Napi::Array::New(env, value->nMarkers);
  Napi::Array markerRequiredLabels = Napi::Array::New(env, value->nMarkers);
  Napi::Array markerNames = Napi::Array::New(env, value->nMarkers);

  for (int32_t i = 0; i < value->nMarkers; i++)
  {
    markerPositions.Set(i, wrapMarkerData(env, value->MarkerPositions[i]));
    markerRequiredLabels.Set(i, Napi::Number::New(env, (double)(value->MarkerRequiredLabels[i])));
    markerNames.Set(i, Napi::String::New(env, value->szMarkerNames[i]));
  }

  obj.Set("markerPositions", markerPositions);
  obj.Set("markerRequiredLabels", markerRequiredLabels);
  obj.Set("szMarkerNames", markerNames);

  return obj;
}

Napi::Object wrapSSkeletonDescription(Napi::Env env, sSkeletonDescription *value)
{
  Napi::Object obj = Napi::Object::New(env);

  obj.Set("szName", Napi::String::New(env, value->szName));
  obj.Set("skeletonId", Napi::Number::New(env, (double)(value->skeletonID)));

  Napi::Array rigidBodies = Napi::Array::New(env, value->nRigidBodies);

  for (int32_t i = 0; i < value->nRigidBodies; i++)
  {
    rigidBodies.Set(i, wrapSRigidBodyDescription(env, &value->RigidBodies[i]));
  }

  obj.Set("rigidBodies", rigidBodies);

  return obj;
}

Napi::Object wrapSForcePlateDescription(Napi::Env env, sForcePlateDescription *value)
{
  Napi::Object obj = Napi::Object::New(env);

  obj.Set("id", Napi::Number::New(env, (double)(value->ID)));
  obj.Set("strSerialNo", Napi::String::New(env, value->strSerialNo));
  obj.Set("fWidth", Napi::Number::New(env, (double)(value->fWidth)));
  obj.Set("fLength", Napi::Number::New(env, (double)(value->fLength)));
  obj.Set("fOriginX", Napi::Number::New(env, (double)(value->fOriginX)));
  obj.Set("fOriginY", Napi::Number::New(env, (double)(value->fOriginY)));
  obj.Set("fOriginZ", Napi::Number::New(env, (double)(value->fOriginZ)));

  Napi::Array fCalMat = Napi::Array::New(env, 12);
  for (int32_t i = 0; i < 12; i++)
  {
    Napi::Array row = Napi::Array::New(env, 12);
    for (int32_t j = 0; j < 12; j++)
    {
      row.Set(j, Napi::Number::New(env, (double)(value->fCalMat[i][j])));
    }
    fCalMat.Set(i, row);
  }
  obj.Set("fCalMat", fCalMat);

  Napi::Array fCorners = Napi::Array::New(env, 4);
  for (int32_t i = 0; i < 4; i++)
  {
    fCorners.Set(i, wrapMarkerData(env, value->fCorners[i]));
  }
  obj.Set("fCorners", fCorners);

  obj.Set("iPlateType", Napi::Number::New(env, (double)(value->iPlateType)));
  obj.Set("iChannelDataType", Napi::Number::New(env, (double)(value->iChannelDataType)));

  Napi::Array szChannelNames = Napi::Array::New(env, value->nChannels);
  for (int32_t i = 0; i < value->nChannels; i++)
  {
    szChannelNames.Set(i, Napi::String::New(env, value->szChannelNames[i]));
  }
  obj.Set("szChannelNames", szChannelNames);

  return obj;
}

Napi::Object wrapSDeviceDescription(Napi::Env env, sDeviceDescription *value)
{
  Napi::Object obj = Napi::Object::New(env);

  obj.Set("id", Napi::Number::New(env, (double)(value->ID)));
  obj.Set("strName", Napi::String::New(env, value->strName));
  obj.Set("strSerialNo", Napi::String::New(env, value->strSerialNo));
  obj.Set("iDeviceType", Napi::Number::New(env, (double)(value->iDeviceType)));
  obj.Set("iChannelDataType", Napi::Number::New(env, (double)(value->iChannelDataType)));

  Napi::Array szChannelNames = Napi::Array::New(env, value->nChannels);
  for (int32_t i = 0; i < value->nChannels; i++)
  {
    szChannelNames.Set(i, Napi::String::New(env, value->szChannelNames[i]));
  }
  obj.Set("szChannelNames", szChannelNames);

  return obj;
}

Napi::Object wrapSCameraDescription(Napi::Env env, sCameraDescription *value)
{
  Napi::Object obj = Napi::Object::New(env);

  obj.Set("strName", Napi::String::New(env, value->strName));
  obj.Set("x", Napi::Number::New(env, (double)(value->x)));
  obj.Set("y", Napi::Number::New(env, (double)(value->y)));
  obj.Set("z", Napi::Number::New(env, (double)(value->z)));
  obj.Set("qX", Napi::Number::New(env, (double)(value->qx)));
  obj.Set("qY", Napi::Number::New(env, (double)(value->qy)));
  obj.Set("qZ", Napi::Number::New(env, (double)(value->qz)));
  obj.Set("qW", Napi::Number::New(env, (double)(value->qw)));

  return obj;
}

Napi::Object wrapSMarkerDescription(Napi::Env env, sMarkerDescription *value)
{
  Napi::Object obj = Napi::Object::New(env);

  obj.Set("szName", Napi::String::New(env, value->szName));
  obj.Set("id", Napi::Number::New(env, (double)(value->ID)));
  obj.Set("x", Napi::Number::New(env, (double)(value->x)));
  obj.Set("y", Napi::Number::New(env, (double)(value->y)));
  obj.Set("z", Napi::Number::New(env, (double)(value->z)));
  obj.Set("size", Napi::Number::New(env, (double)(value->size)));
  obj.Set("params", Napi::Number::New(env, (double)(value->params)));

  return obj;
}

Napi::Object wrapSAssetDescription(Napi::Env env, sAssetDescription *value)
{
  Napi::Object obj = Napi::Object::New(env);

  obj.Set("szName", Napi::String::New(env, value->szName));
  obj.Set("assetType", Napi::Number::New(env, (double)(value->AssetType)));
  obj.Set("assetId", Napi::Number::New(env, (double)(value->AssetID)));

  Napi::Array rigidBodies = Napi::Array::New(env, value->nRigidBodies);
  for (int32_t i = 0; i < value->nRigidBodies; i++)
  {
    rigidBodies.Set(i, wrapSRigidBodyDescription(env, &value->RigidBodies[i]));
  }
  obj.Set("rigidBodies", rigidBodies);

  Napi::Array markers = Napi::Array::New(env, value->nMarkers);
  for (int32_t i = 0; i < value->nMarkers; i++)
  {
    markers.Set(i, wrapSMarkerDescription(env, &value->Markers[i]));
  }
  obj.Set("markers", markers);

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
    obj = wrapSForcePlateDescription(env, value->Data.ForcePlateDescription);
    obj.Set("type", Napi::String::New(env, "ForcePlate"));
    break;

  case DataDescriptors::Descriptor_Device:
    obj = wrapSDeviceDescription(env, value->Data.DeviceDescription);
    obj.Set("type", Napi::String::New(env, "Device"));
    break;

  case DataDescriptors::Descriptor_Camera:
    obj = wrapSCameraDescription(env, value->Data.CameraDescription);
    obj.Set("type", Napi::String::New(env, "Camera"));
    break;

  case DataDescriptors::Descriptor_Asset:
    obj = wrapSAssetDescription(env, value->Data.AssetDescription);
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

Napi::Object wrapSMarkerSetData(Napi::Env env, sMarkerSetData *value)
{
  Napi::Object obj = Napi::Object::New(env);

  obj.Set("szName", Napi::String::New(env, value->szName));

  Napi::Array markers = Napi::Array::New(env, value->nMarkers);
  for (int32_t i = 0; i < value->nMarkers; i++)
  {
    markers.Set(i, wrapMarkerData(env, value->Markers[i]));
  }
  obj.Set("markers", markers);

  return obj;
}

Napi::Object wrapSRigidBodyData(Napi::Env env, sRigidBodyData *value)
{
  Napi::Object obj = Napi::Object::New(env);

  obj.Set("id", Napi::Number::New(env, (double)(value->ID)));
  obj.Set("x", Napi::Number::New(env, (double)(value->x)));
  obj.Set("y", Napi::Number::New(env, (double)(value->y)));
  obj.Set("z", Napi::Number::New(env, (double)(value->z)));
  obj.Set("qX", Napi::Number::New(env, (double)(value->qx)));
  obj.Set("qY", Napi::Number::New(env, (double)(value->qy)));
  obj.Set("qZ", Napi::Number::New(env, (double)(value->qz)));
  obj.Set("qW", Napi::Number::New(env, (double)(value->qw)));
  obj.Set("meanError", Napi::Number::New(env, (double)(value->MeanError)));
  obj.Set("params", Napi::Number::New(env, (double)(value->params)));

  return obj;
}

Napi::Object wrapSSkeletonData(Napi::Env env, sSkeletonData *value)
{
  Napi::Object obj = Napi::Object::New(env);

  obj.Set("skeletonId", Napi::Number::New(env, (double)(value->skeletonID)));

  Napi::Array rigidBodies = Napi::Array::New(env, value->nRigidBodies);
  for (int32_t i = 0; i < value->nRigidBodies; i++)
  {
    rigidBodies.Set(i, wrapSRigidBodyData(env, value->RigidBodyData));
  }
  obj.Set("rigidBodies", rigidBodies);

  return obj;
}

Napi::Object wrapSMarker(Napi::Env env, sMarker *value)
{
  Napi::Object obj = Napi::Object::New(env);

  obj.Set("id", Napi::Number::New(env, (double)(value->ID)));
  obj.Set("x", Napi::Number::New(env, (double)(value->x)));
  obj.Set("y", Napi::Number::New(env, (double)(value->y)));
  obj.Set("z", Napi::Number::New(env, (double)(value->z)));
  obj.Set("size", Napi::Number::New(env, (double)(value->size)));
  obj.Set("params", Napi::Number::New(env, (double)(value->params)));
  obj.Set("residual", Napi::Number::New(env, (double)(value->residual)));

  return obj;
}

Napi::Object wrapSAssetData(Napi::Env env, sAssetData *value)
{
  Napi::Object obj = Napi::Object::New(env);

  obj.Set("assetId", Napi::Number::New(env, (double)(value->assetID)));

  Napi::Array rigidBodies = Napi::Array::New(env, value->nRigidBodies);
  for (int32_t i = 0; i < value->nRigidBodies; i++)
  {
    rigidBodies.Set(i, wrapSRigidBodyData(env, value->RigidBodyData));
  }
  obj.Set("rigidBodies", rigidBodies);

  Napi::Array markerData = Napi::Array::New(env, value->nMarkers);
  for (int32_t i = 0; i < value->nMarkers; i++)
  {
    rigidBodies.Set(i, wrapSMarker(env, &value->MarkerData[i]));
  }
  obj.Set("markerData", markerData);

  return obj;
}

Napi::Array wrapSAnalogChannelData(Napi::Env env, sAnalogChannelData *value)
{
  Napi::Array arr = Napi::Array::New(env, value->nFrames);
  for (int32_t i = 0; i < value->nFrames; i++)
  {
    arr.Set(i, Napi::Number::New(env, (double)(value->Values[i])));
  }
  return arr;
}

Napi::Object wrapSForcePlateData(Napi::Env env, sForcePlateData *value)
{
  Napi::Object obj = Napi::Object::New(env);

  obj.Set("id", Napi::Number::New(env, (double)(value->ID)));

  Napi::Array channelData = Napi::Array::New(env, value->nChannels);
  for (int32_t i = 0; i < value->nChannels; i++)
  {
    channelData.Set(i, wrapSAnalogChannelData(env, &value->ChannelData[i]));
  }
  obj.Set("channelData", channelData);

  obj.Set("params", Napi::Number::New(env, (double)(value->params)));

  return obj;
}

Napi::Object wrapSDeviceData(Napi::Env env, sDeviceData *value)
{
  Napi::Object obj = Napi::Object::New(env);

  obj.Set("id", Napi::Number::New(env, (double)(value->ID)));

  Napi::Array channelData = Napi::Array::New(env, value->nChannels);
  for (int32_t i = 0; i < value->nChannels; i++)
  {
    channelData.Set(i, wrapSAnalogChannelData(env, &value->ChannelData[i]));
  }
  obj.Set("channelData", channelData);

  obj.Set("params", Napi::Number::New(env, (double)(value->params)));

  return obj;
}

Napi::Object wrapSFrameOfMocapData(Napi::Env env, sFrameOfMocapData *value)
{
  Napi::Object obj = Napi::Object::New(env);

  obj.Set("iFrame", Napi::Number::New(env, value->iFrame));

  Napi::Array markerSets = Napi::Array::New(env, value->nMarkerSets);
  for (int32_t i = 0; i < value->nMarkerSets; i++)
  {
    markerSets.Set(i, wrapSMarkerSetData(env, &value->MocapData[i]));
  }
  obj.Set("markerSets", markerSets);

  Napi::Array otherMarkers = Napi::Array::New(env, value->nOtherMarkers);
  for (int32_t i = 0; i < value->nOtherMarkers; i++)
  {
    otherMarkers.Set(i, wrapMarkerData(env, value->OtherMarkers[i]));
  }
  obj.Set("otherMarkers", otherMarkers);

  Napi::Array rigidBodies = Napi::Array::New(env, value->nRigidBodies);
  for (int32_t i = 0; i < value->nRigidBodies; i++)
  {
    rigidBodies.Set(i, wrapSRigidBodyData(env, &value->RigidBodies[i]));
  }
  obj.Set("rigidBodies", rigidBodies);

  Napi::Array skeletons = Napi::Array::New(env, value->nSkeletons);
  for (int32_t i = 0; i < value->nSkeletons; i++)
  {
    skeletons.Set(i, wrapSSkeletonData(env, &value->Skeletons[i]));
  }
  obj.Set("skeletons", skeletons);

  Napi::Array assets = Napi::Array::New(env, value->nAssets);
  for (int32_t i = 0; i < value->nAssets; i++)
  {
    assets.Set(i, wrapSAssetData(env, &value->Assets[i]));
  }
  obj.Set("assets", assets);

  Napi::Array labeledMarkers = Napi::Array::New(env, value->nLabeledMarkers);
  for (int32_t i = 0; i < value->nLabeledMarkers; i++)
  {
    labeledMarkers.Set(i, wrapSMarker(env, &value->LabeledMarkers[i]));
  }
  obj.Set("labeledMarkers", labeledMarkers);

  Napi::Array forcePlates = Napi::Array::New(env, value->nForcePlates);
  for (int32_t i = 0; i < value->nForcePlates; i++)
  {
    forcePlates.Set(i, wrapSForcePlateData(env, &value->ForcePlates[i]));
  }
  obj.Set("forcePlates", forcePlates);

  Napi::Array devices = Napi::Array::New(env, value->nDevices);
  for (int32_t i = 0; i < value->nDevices; i++)
  {
    devices.Set(i, wrapSDeviceData(env, &value->Devices[i]));
  }
  obj.Set("devices", devices);

  obj.Set("timecode", Napi::Number::New(env, (double)(value->Timecode)));
  obj.Set("timecodeSubframe", Napi::Number::New(env, (double)(value->TimecodeSubframe)));
  obj.Set("fTimestamp", Napi::Number::New(env, (double)(value->fTimestamp)));
  obj.Set("cameraMidExposureTimestamp", Napi::Number::New(env, (double)(value->CameraMidExposureTimestamp)));
  obj.Set("cameraDataReceivedTimestamp", Napi::Number::New(env, (double)(value->CameraDataReceivedTimestamp)));
  obj.Set("transmitTimestamp", Napi::Number::New(env, (double)(value->TransmitTimestamp)));
  obj.Set("precisionTimestampSecs", Napi::Number::New(env, (double)(value->PrecisionTimestampSecs)));
  obj.Set("precisionTimestampFractionalSecs", Napi::Number::New(env, (double)(value->PrecisionTimestampFractionalSecs)));
  obj.Set("params", Napi::Number::New(env, (double)(value->params)));

  return obj;
}

uint32_t unwrapAsUint32(Napi::Value value)
{
  if (value.IsNumber())
  {
    return value.As<Napi::Number>().Uint32Value();
  }

  return 0;
}

int32_t unwrapAsInt32(Napi::Value value)
{
  if (value.IsNumber())
  {
    return value.As<Napi::Number>().Int32Value();
  }

  return 0;
}

const char *unwrapAsString(Napi::Value value)
{
  if (value.IsString())
  {
    std::string str = value.As<Napi::String>().Utf8Value();
    char *cstr = new char[str.size() + 1];
    std::strcpy(cstr, str.c_str());
    return cstr;
  }

  return NULL;
}

bool unwrapAsBoolean(Napi::Value value)
{
  if (value.IsBoolean())
  {
    return value.As<Napi::Boolean>().Value();
  }

  return false;
}

void unwrapAsBitstreamVersion(Napi::Value value, uint8_t *bitstreamVersion)
{
  if (value.IsArray())
  {
    Napi::Array arr = value.As<Napi::Array>();
    if (arr.Length() == 4)
    {
      for (int32_t i = 0; i < 4; i++)
      {
        if (arr.Get(i).IsNumber())
        {
          bitstreamVersion[i] = arr.Get(i).As<Napi::Number>().Uint32Value();
        }
      }
    }
  }
}

sNatNetClientConnectParams unwrapSNatNetClientConnectParams(Napi::Object *value)
{
  sNatNetClientConnectParams params = {};

  params.connectionType =
      unwrapAsInt32(value->Get("connectionType")) == ConnectionType::ConnectionType_Unicast
          ? ConnectionType::ConnectionType_Unicast
          : ConnectionType::ConnectionType_Multicast;

  params.serverCommandPort = unwrapAsUint32(value->Get("serverCommandPort"));
  params.serverDataPort = unwrapAsUint32(value->Get("serverDataPort"));
  params.serverAddress = unwrapAsString(value->Get("serverAddress"));
  params.localAddress = unwrapAsString(value->Get("localAddress"));
  params.multicastAddress = unwrapAsString(value->Get("multicastAddress"));
  params.subscribedDataOnly = unwrapAsBoolean(value->Get("subscribedDataOnly"));
  unwrapAsBitstreamVersion(value->Get("bitstreamVersion"), params.BitstreamVersion);

  return params;
}

static NatNetClient *client;
static sFrameOfMocapData *lastFrame;

void FrameCallback(sFrameOfMocapData *frameData, void *pUserData)
{
  lastFrame = frameData;
}

Napi::Number ClientConnect(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  Napi::Object rawParams = info[0].As<Napi::Object>();
  sNatNetClientConnectParams params = unwrapSNatNetClientConnectParams(&rawParams);

  std::cout
      << "[C++] CONNECT PARAMS:\nconnectionType: " << params.connectionType
      << "\nserverCommandPort: " << params.serverCommandPort
      << "\nserverDataPort: " << params.serverDataPort
      << "\nserverAddress: \"" << params.serverAddress
      << "\"\nlocalAddress: \"" << params.localAddress
      << "\"\nmulticastAddress: \"" << params.multicastAddress
      << "\"\nsubscribedDataOnly: " << params.subscribedDataOnly
      << "\n\n";

  client = new NatNetClient();
  ErrorCode code = client->Connect(params);

  return Napi::Number::New(env, (double)code);
}

Napi::Number ClientDisconnect(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  ErrorCode code = client->Disconnect();
  client = NULL;

  return Napi::Number::New(env, (double)code);
}

Napi::Number ClientRegisterFrameCallback(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  ErrorCode code = client->SetFrameReceivedCallback(FrameCallback);

  return Napi::Number::New(env, (double)code);
}

Napi::Value ClientGetDataDescriptions(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  sDataDescriptions *outDescriptions = {};
  ErrorCode code = client->GetDataDescriptionList(&outDescriptions);

  if (code == ErrorCode::ErrorCode_OK)
  {
    return wrapSDataDescriptions(env, outDescriptions);
  }
  else
  {
    return Napi::Number::New(env, code);
  }
}

Napi::Value ClientGetPreviousFrame(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  if (lastFrame != NULL)
  {
    return wrapSFrameOfMocapData(env, lastFrame);
  }
  else
  {
    return env.Null();
  }
}

Napi::Object
InitAll(Napi::Env env, Napi::Object exports)
{
  exports.Set(Napi::String::New(env, "clientConnect"),
              Napi::Function::New(env, ClientConnect));

  exports.Set(Napi::String::New(env, "clientDisconnect"),
              Napi::Function::New(env, ClientDisconnect));

  exports.Set(Napi::String::New(env, "clientRegisterFrameCallback"),
              Napi::Function::New(env, ClientRegisterFrameCallback));

  exports.Set(Napi::String::New(env, "clientGetDataDescriptions"),
              Napi::Function::New(env, ClientGetDataDescriptions));

  exports.Set(Napi::String::New(env, "clientGetPreviousFrame"),
              Napi::Function::New(env, ClientGetPreviousFrame));

  return exports;
}

NODE_API_MODULE("optitrackBridge", InitAll)
