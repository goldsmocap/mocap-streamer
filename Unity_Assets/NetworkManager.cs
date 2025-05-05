using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using UnityEngine;

public class NetworkManager : MonoBehaviour
{
  private static readonly char OSC_ADDRESS_SEPARATOR = '/';

  public int receivingDataPort = 7000;
  public int sendingDataPort = 8000;

  private Stopwatch stopwatch;
  private UdpClient sendingNetworkClient;
  private UdpClient receivingNetworkClient;
  private readonly Dictionary<string, List<AnimationFrame>> allCurrentFrames = new();
  private readonly Dictionary<string, string> incomingDataReceived = new();

  void Start()
  {
    sendingNetworkClient = new UdpClient();

    receivingNetworkClient = new UdpClient(receivingDataPort);
    Thread networkThread = new(ReceiveData);
    networkThread.Start();
    stopwatch = Stopwatch.StartNew();
  }

  void OnDestroy()
  {
    if (receivingNetworkClient?.Client != null)
    {
      receivingNetworkClient.Close();
    }
    if (sendingNetworkClient?.Client != null)
    {
      sendingNetworkClient.Close();
    }
  }

  public AnimationFrame? PollCharacter(string peerName, ushort characterId, TimeSpan? from)
  {
    lock (allCurrentFrames)
    {
      if (allCurrentFrames.TryGetValue(peerName, out List<AnimationFrame> peerCharacterFrames) &&
      characterId < peerCharacterFrames.Count &&
      (!from.HasValue || peerCharacterFrames[characterId].frameStart > from.Value))
      {
        return peerCharacterFrames[characterId];
      }
    }
    return null;
  }

  public string TryGetData(string peerName)
  {
    if (incomingDataReceived.ContainsKey(peerName))
    {
      incomingDataReceived.TryGetValue(peerName, out string data);
      return data;
    }
    return null;
  }

  public void SendData(string data)
  {
    byte[] dataBytes = Encoding.ASCII.GetBytes(data);
    sendingNetworkClient.Send(dataBytes, dataBytes.Length, "localhost", sendingDataPort);
  }


  private static string ParseOscString(byte[] bytes, ref int bytesIndex)
  {
    List<byte> charCodes = new();
    for (; bytesIndex < bytes.Length; bytesIndex++)
    {
      if (bytes[bytesIndex] != 0)
      {
        charCodes.Add(bytes[bytesIndex]);
      }
      else
      {
        bytesIndex++;
        break;
      }
    }
    // As a multiple of 4
    bytesIndex = (bytesIndex + 3) & ~0x03;
    return new string(Encoding.ASCII.GetChars(charCodes.ToArray()));
  }

  private static float ParseOscFloat32(byte[] bytes, ref int bytesIndex)
  {
    float value;
    if (BitConverter.IsLittleEndian)
    {
      byte[] slice = bytes.Skip(bytesIndex).Take(4).ToArray();
      Array.Reverse(slice);
      value = BitConverter.ToSingle(slice);
    }
    else
    {
      value = BitConverter.ToSingle(bytes, bytesIndex);
    }
    bytesIndex += 4;
    return value;
  }

  private static OscParts ParseOscParts(byte[] bytes)
  {
    // IMPLEMENTED FROM: https://github.com/colinbdclark/osc.js
    int bytesIndex = 0;
    string combinedAddress = ParseOscString(bytes, ref bytesIndex);
    if (combinedAddress[0] != '/')
    {
      throw new Exception("Malformed OSC address");
    }
    string[] addressParts = combinedAddress[1..].Split(OSC_ADDRESS_SEPARATOR, 2);

    string mode = addressParts[0];
    string address = addressParts[1];
    string argTypes = ParseOscString(bytes, ref bytesIndex);
    byte[] args = bytes.Skip(bytesIndex).ToArray();

    if (argTypes[0] != ',')
    {
      throw new Exception("Malformed OSC arg types");
    }

    return new OscParts(mode, address, argTypes[1..], args);
  }

  private static SegmentData ParseSegmentData(byte[] args, ref int bytesIndex)
  {
    string id = ParseOscString(args, ref bytesIndex);
    float posx = ParseOscFloat32(args, ref bytesIndex);
    float posy = ParseOscFloat32(args, ref bytesIndex);
    float posz = ParseOscFloat32(args, ref bytesIndex);
    float rotx = ParseOscFloat32(args, ref bytesIndex);
    float roty = ParseOscFloat32(args, ref bytesIndex);
    float rotz = ParseOscFloat32(args, ref bytesIndex);
    return new SegmentData(id, posx, posy, posz, rotx, roty, rotz);
  }

  private List<AnimationFrame> ParseOscSubjectData(OscParts parts)
  {
    Regex argTypeRe = new Regex(@"ssffffff(s?sffffff)*", RegexOptions.None);
    if (!argTypeRe.IsMatch(parts.argTypes))
      throw new Exception("Malformed OSC arg types " + parts.argTypes);

    List<AnimationFrame> frames = new();
    List<SegmentData> segments = new();
    int argTypesIdx = 1;
    int argsIdx = 0;
    string subjectName = ParseOscString(parts.args, ref argsIdx);
    TimeSpan frameStart = stopwatch.Elapsed;

    while (argTypesIdx < parts.argTypes.Length)
    {
      if (parts.argTypes.Substring(argTypesIdx, 2) == "ss")
      {
        frames.Add(
          new AnimationFrame(new SubjectData(subjectName, segments.ToArray()),
          frameStart
          ));
        segments.Clear();
        subjectName = ParseOscString(parts.args, ref argsIdx);
        argTypesIdx += 1;
      }
      else
      {
        segments.Add(ParseSegmentData(parts.args, ref argsIdx));
        argTypesIdx += 7;
      }
    }

    if (segments.Count > 0)
    {
      frames.Add(
        new AnimationFrame(new SubjectData(subjectName, segments.ToArray()),
        frameStart
      ));
    }

    return frames;
  }

  private void AddMocapData(OscParts parts)
  {
    List<AnimationFrame> frames = ParseOscSubjectData(parts);

    lock (allCurrentFrames)
    {
      if (allCurrentFrames.ContainsKey(parts.address))
      {
        foreach (AnimationFrame frame in frames)
        {
          bool isNew = true;
          for (int i = 0; i < allCurrentFrames[parts.address].Count; i++)
          {
            if (allCurrentFrames[parts.address][i].data.name == frame.data.name)
            {
              allCurrentFrames[parts.address][i] = frame;
              isNew = false;
            }
          }
          if (isNew)
          {
            allCurrentFrames[parts.address].Add(frame);
          }
        }
        allCurrentFrames[parts.address] = frames;
      }
      else
      {
        allCurrentFrames.Add(parts.address, frames);
      }
    }
  }

  private void AddIncomingData(OscParts parts)
  {
    if (parts.argTypes == "s")
    {
      int bytesIndex = 0;
      string data = ParseOscString(parts.args, ref bytesIndex);
      if (incomingDataReceived.ContainsKey(parts.address))
      {
        incomingDataReceived[parts.address] = data;
      }
      else
      {
        incomingDataReceived.Add(parts.address, data);
      }
    }
    else
    {
      throw new Exception("Malformed OSC data arg types. Got: " + parts.argTypes);
    }
  }

  private void ReceiveData()
  {
    IPEndPoint remoteIpEndPoint = new(IPAddress.Any, 0);
    while (receivingNetworkClient.Client != null)
    {
      byte[] rawData;
      try
      {
        rawData = receivingNetworkClient.Receive(ref remoteIpEndPoint);
      }
      catch (SocketException)
      {
        break;
      }

      OscParts parts = ParseOscParts(rawData);

      switch (parts.mode)
      {
        case "mocap":
          AddMocapData(parts);
          break;

        case "data":
          AddIncomingData(parts);
          break;

        default:
          throw new Exception("Unknown message mode: " + parts.mode);
      }
    }
  }
}
