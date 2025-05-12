using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using UnityEngine;

public class NetworkCharacterRecorder : MonoBehaviour
{
  public string filePath;

  private bool writeMode = true;
  private readonly List<byte[]> recentData = new();
  private byte[] header;
  private bool recording = true;
  private TimeSpan? lastFrame;
  private NetworkManager manager;
  private NetworkCharacterController character;

  void Start()
  {
    manager = GetComponentInParent<NetworkManager>();
    character = GetComponent<NetworkCharacterController>();
    Thread networkThread = new(SaveRecentData);
    networkThread.Start();
  }

  void OnDestroy()
  {
    recording = false;
  }

  void Update()
  {
    AnimationFrame? maybeFrame = manager.PollCharacter(character.peerName, character.characterID, lastFrame);
    if (maybeFrame.HasValue)
    {
      AnimationFrame frame = maybeFrame.Value;

      byte[] data = frame.SerialiseData(lastFrame.GetValueOrDefault(frame.frameStart));

      lastFrame = frame.frameStart;
      lock (recentData)
      {
        if (writeMode) header ??= frame.SerialiseHeader();
        recentData.Add(data);
      }
    }
  }

  private void SaveRecentData()
  {
    while (recording)
    {
      if (recentData.Count > 0)
      {
        lock (recentData)
        {
          StreamWriter writer = new(filePath, !writeMode);

          if (writeMode)
          {
            writer.BaseStream.Write(header, 0, header.Length);
          }

          foreach (byte[] data in recentData)
          {
            writer.BaseStream.Write(data, 0, data.Length);
          }

          writer.Close();
          recentData.Clear();
          writeMode = false;
        }
      }
    }
  }
}
