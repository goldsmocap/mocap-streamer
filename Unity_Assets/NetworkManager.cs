using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using UnityEngine;

public class NetworkManager : MonoBehaviour
{
  // 59 transforms, each with 3 coordinates and 3 rotations
  private static readonly char PREFIX_SEPARATOR = ':';
  private static readonly char CHAR_ID_SEPARATOR = '&';

  public int port = 7000;

  private Stopwatch stopwatch;
  private UdpClient networkClient;
  private readonly Dictionary<string, AnimationFrame[]> allCurrentFrames = new();

  void Start()
  {
    networkClient = new UdpClient(port);
    Thread networkThread = new(ReceiveData);
    networkThread.Start();
    stopwatch = Stopwatch.StartNew();
  }

  void OnDestroy()
  {
    if (networkClient.Client != null)
    {
      networkClient.Close();
    }
  }

  public AnimationFrame? PollCharacter(string peerName, ushort characterId, TimeSpan? from)
  {
    AnimationFrame? frame = null;
    lock (allCurrentFrames)
    {
      if (allCurrentFrames.TryGetValue(peerName, out AnimationFrame[] peerCharacterFrames) &&
      characterId < peerCharacterFrames.Length &&
      (!from.HasValue || peerCharacterFrames[characterId].frameStart > from.Value))
      {
        frame = peerCharacterFrames[characterId];
      }
    }
    return frame;
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

  static private OscParts ParseOscParts(byte[] bytes)
  {
    int bytesIndex = 0;
    string combinedAddress = ParseOscString(bytes, ref bytesIndex);
    if (combinedAddress[0] != '/')
    {
      throw new Exception("Malformed OSC address");
    }
    string[] addressParts = combinedAddress[1..].Split(PREFIX_SEPARATOR, 2);

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

  private (string, AnimationFrame[]) ParseOscMocap(OscParts parts)
  {
    // IMPLEMENTED FROM: https://github.com/colinbdclark/osc.js

    string[] addressParts = parts.address.Split(PREFIX_SEPARATOR, 2);
    string peerName = addressParts[0];
    string[] charIds = addressParts[1].Split(CHAR_ID_SEPARATOR);

    // Only ever sending float data in multiples of CHARACTER_TRANSFORM_DATA_LENGTH
    if (parts.argTypes != new string('f', MocapCharacterController.TRANSFORM_DATA_LENGTH * charIds.Length))
    {
      throw new Exception("Malformed OSC arg types");
    }

    if (parts.args.Length != MocapCharacterController.TRANSFORM_DATA_LENGTH * charIds.Length * 4)
    {
      throw new Exception(
        "Malformed Mocap OSC data values. Data length: "
          + parts.args.Length
          + " Expected length: "
          + (MocapCharacterController.TRANSFORM_DATA_LENGTH * charIds.Length * 4));
    }

    AnimationFrame[] parsedFrames = new AnimationFrame[charIds.Length];

    int argsIndex = 0;
    for (int i = 0; i < parsedFrames.Length; i++)
    {
      float[] data = new float[MocapCharacterController.TRANSFORM_DATA_LENGTH]
          .Select((_, _) => ParseOscFloat32(parts.args, ref argsIndex))
          .ToArray();
      parsedFrames[i] = new AnimationFrame(data, stopwatch.Elapsed);
    }

    return (peerName, parsedFrames);
  }

  private void ReceiveData()
  {
    IPEndPoint remoteIpEndPoint = new(IPAddress.Any, 0);
    while (networkClient.Client != null)
    {
      byte[] rawData;
      try
      {
        rawData = networkClient.Receive(ref remoteIpEndPoint);
      }
      catch (SocketException)
      {
        break;
      }

      OscParts parts = ParseOscParts(rawData);

      if (parts.mode == "mocap")
      {
        (string peerName, AnimationFrame[] parsedFrames) = ParseOscMocap(parts);

        lock (allCurrentFrames)
        {
          if (allCurrentFrames.ContainsKey(peerName))
          {
            allCurrentFrames[peerName] = parsedFrames;
          }
          else
          {
            allCurrentFrames.Add(peerName, parsedFrames);
          }
        }
      }
      else if (parts.mode == "data")
      {
        if (parts.argTypes == "s")
        {
          int bytesIndex = 0;
          string data = ParseOscString(parts.args, ref bytesIndex);
          UnityEngine.Debug.Log(data);
        }
        else
        {
          throw new Exception("Malformed OSC data arg types. Got: " + parts.argTypes);
        }
      }
    }
  }
}
