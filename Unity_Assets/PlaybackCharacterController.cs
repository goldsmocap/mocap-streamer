using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using UnityEngine;

public class PlaybackCharacterController : MonoBehaviour
{
  public string filePath;
  public uint offsetInMs;
  public bool loop;

  private AnimationFrame[] frames;
  private MocapCharacterController controller;
  private TimeSpan accOffset;
  private Stopwatch stopwatch;
  private TimeSpan clipLength;
  private int lastIndex;

  void Start()
  {
    controller = GetComponent<MocapCharacterController>();
    lastIndex = -1;
    stopwatch = Stopwatch.StartNew();

    StreamReader reader = new(filePath);
    byte[] allData = default;
    using (MemoryStream memStream = new())
    {
      reader.BaseStream.CopyTo(memStream);
      allData = memStream.ToArray();
    }
    reader.Close();

    int serialisedLength = MocapCharacterController.TRANSFORM_DATA_LENGTH * sizeof(float) + sizeof(ushort);
    List<AnimationFrame> frameList = new();
    TimeSpan lastFrame = TimeSpan.Zero;

    for (int i = 0; i < allData.Length / serialisedLength; i++)
    {
      byte[] data = new byte[serialisedLength];
      Array.Copy(allData, i * serialisedLength, data, 0, serialisedLength);
      AnimationFrame frame = AnimationFrame.Deserialise(data, lastFrame);
      frameList.Add(frame);
      lastFrame = frame.frameStart;
    }

    if (frameList.Count == 0) throw new Exception("No frames found for " + filePath);

    frames = frameList.ToArray();
    clipLength = frames[^1].frameStart - frames[0].frameStart;
    accOffset = TimeSpan.FromMilliseconds(offsetInMs % clipLength.TotalMilliseconds);
  }

  void Update()
  {
    TimeSpan clipTimestamp = stopwatch.Elapsed + accOffset;
    int currIndex = -1;
    for (int i = 0; i < frames.Length; i++)
    {
      if (frames[i].frameStart > clipTimestamp)
      {
        currIndex = i > 0 ? i - 1 : frames.Length - 1;
        break;
      }
    }

    if (currIndex == -1)
    {
      currIndex = frames.Length - 1;
      if (loop) accOffset -= clipLength;
    }

    if (currIndex != lastIndex)
    {
      controller.SetFrame(frames[currIndex].data);
      lastIndex = currIndex;
    }
  }
}
