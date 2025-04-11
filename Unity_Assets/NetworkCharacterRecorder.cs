using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using UnityEngine;

public class NetworkCharacterRecorder : MonoBehaviour
{
  public string filePath;

  private readonly List<byte[]> recentFrames = new();
  private bool recording = true;
  private TimeSpan? lastFrame;
  private NetworkManager manager;
  private NetworkCharacterController character;

  void Start()
  {
    manager = GetComponentInParent<NetworkManager>();
    character = GetComponent<NetworkCharacterController>();
    Thread networkThread = new(SaveRecentFrames);
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
      byte[] data = frame.Serialise(lastFrame.GetValueOrDefault(frame.frameStart));
      lastFrame = frame.frameStart;
      lock (recentFrames)
      {
        recentFrames.Add(data);
      }
    }
  }

  private void SaveRecentFrames()
  {
    while (recording)
    {
      if (recentFrames.Count > 0)
      {
        lock (recentFrames)
        {
          StreamWriter writer = new(new FileStream(filePath, FileMode.Append, FileAccess.Write));
          foreach (byte[] data in recentFrames)
          {
            writer.BaseStream.Write(data, 0, data.Length);
          }
          writer.Close();
          recentFrames.Clear();
        }
      }
    }
  }
}
