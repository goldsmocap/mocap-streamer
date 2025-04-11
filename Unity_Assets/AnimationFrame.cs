using System;

public struct AnimationFrame
{
  public TimeSpan frameStart;
  public float[] data;

  public AnimationFrame(float[] data, TimeSpan frameStart)
  {
    this.data = data;
    this.frameStart = frameStart;
  }

  public readonly byte[] Serialise(TimeSpan? lastFrame)
  {
    byte[] bytes = new byte[data.Length * sizeof(float) + sizeof(ushort)];

    TimeSpan diff = lastFrame.HasValue ? frameStart - lastFrame.Value : TimeSpan.Zero;
    byte[] delta = BitConverter.GetBytes((ushort)Math.Round(diff.TotalMilliseconds));
    Buffer.BlockCopy(delta, 0, bytes, 0, delta.Length);
    Buffer.BlockCopy(data, 0, bytes, delta.Length, data.Length * sizeof(float));

    return bytes;
  }

  public static AnimationFrame Deserialise(byte[] serialised, TimeSpan lastFrame)
  {
    ushort delta = BitConverter.ToUInt16(serialised, 0);

    float[] data = new float[(serialised.Length - sizeof(ushort)) / sizeof(float)];
    for (int i = 0; i < data.Length; i++)
    {
      data[i] = BitConverter.ToSingle(serialised, i * sizeof(float) + sizeof(ushort));
    }

    return new AnimationFrame(data, lastFrame + TimeSpan.FromMilliseconds(delta));
  }
}
