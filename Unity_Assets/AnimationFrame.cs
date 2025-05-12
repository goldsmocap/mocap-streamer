using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

public struct AnimationFrame
{
  public TimeSpan frameStart;
  public SubjectData subject;

  public AnimationFrame(SubjectData subject, TimeSpan frameStart)
  {
    this.subject = subject;
    this.frameStart = frameStart;
  }

  public byte[] SerialiseHeader()
  {
    List<byte> serialised = new();

    serialised.AddRange(Encoding.ASCII.GetBytes(subject.name));
    serialised.Add(0);

    byte[] lengthBytes = BitConverter.GetBytes((ushort)subject.segments.Length);
    serialised.AddRange(lengthBytes);

    byte[] segmentIdsBytes = subject.segments.SelectMany(
      segment =>
        Encoding.ASCII.GetBytes(segment.id).Concat(new[] { (byte)0 })
    ).ToArray();
    serialised.AddRange(segmentIdsBytes);

    return serialised.ToArray();
  }

  public byte[] SerialiseData(TimeSpan? lastFrame)
  {
    byte[] serialised = new byte[
      sizeof(ushort)
      + subject.segments.Length * 6 * sizeof(float)
    ];

    TimeSpan delta = lastFrame.HasValue ? frameStart - lastFrame.Value : TimeSpan.Zero;
    byte[] deltaBytes = BitConverter.GetBytes((ushort)Math.Round(delta.TotalMilliseconds));
    Buffer.BlockCopy(deltaBytes, 0, serialised, 0, deltaBytes.Length);

    float[] segmentData = subject.segments.SelectMany(
      segment => new[] {
        segment.pos.x, segment.pos.y, segment.pos.z,
        segment.rot.eulerAngles.x, segment.rot.eulerAngles.y, segment.rot.eulerAngles.z
      }
    ).ToArray();
    Buffer.BlockCopy(segmentData, 0, serialised, deltaBytes.Length, segmentData.Length * sizeof(float));

    return serialised;
  }

  public static byte[] Serialise(AnimationFrame[] frames)
  {
    List<byte> serialised = new();
    serialised.AddRange(frames[0].SerialiseHeader());
    serialised.AddRange(
      frames.SelectMany(
        (frame, i) => frame.SerialiseData(
          i > 0 ? frames[i].frameStart : null
        )
      ).ToArray()
    );
    return serialised.ToArray();
  }

  private static string bytesToString(byte[] data, ref int byteIndex)
  {
    string parsed = "";

    while (data[byteIndex] != 0)
    {
      parsed += Convert.ToChar(data[byteIndex]);
      byteIndex++;
    }

    if (data[byteIndex] == 0) byteIndex++;

    return parsed;
  }

  private static ushort bytesToUshort(byte[] data, ref int byteIndex)
  {
    ushort parsed = BitConverter.ToUInt16(data, byteIndex);
    byteIndex += sizeof(ushort);
    return parsed;
  }

  private static float bytesToFloat(byte[] data, ref int byteIndex)
  {
    float parsed = BitConverter.ToSingle(data, byteIndex);
    byteIndex += sizeof(float);
    return parsed;
  }

  public static AnimationFrame[] Deserialise(byte[] data)
  {
    int byteIndex = 0;

    string subjectName = bytesToString(data, ref byteIndex);
    ushort segmentsLength = bytesToUshort(data, ref byteIndex);

    string[] segmentIds = Enumerable
      .Range(0, segmentsLength)
      .Select(_ => bytesToString(data, ref byteIndex))
      .ToArray();

    AnimationFrame[] frames = new AnimationFrame[
      (data.Length - byteIndex) / (sizeof(ushort) + segmentsLength * 6 * sizeof(float))
    ];
    TimeSpan lastFrame = TimeSpan.Zero;

    for (int i = 0; i < frames.Length; i++)
    {
      ushort delta = bytesToUshort(data, ref byteIndex);
      SegmentData[] segments = segmentIds.Select(
        id => SegmentData.fromData(
          id,
          bytesToFloat(data, ref byteIndex),
          bytesToFloat(data, ref byteIndex),
          bytesToFloat(data, ref byteIndex),
          bytesToFloat(data, ref byteIndex),
          bytesToFloat(data, ref byteIndex),
          bytesToFloat(data, ref byteIndex)
        )
      ).ToArray();

      TimeSpan deltaSpan = TimeSpan.FromMilliseconds(delta);

      frames[i] = new AnimationFrame(
        new SubjectData(subjectName, segments),
        lastFrame + deltaSpan
      );
      lastFrame += deltaSpan;
    }

    return frames;
  }
}
