using UnityEngine;

public struct SubjectData
{
  public string name;
  public SegmentData[] segments;

  public SubjectData(string name, SegmentData[] segments)
  {
    this.name = name;
    this.segments = segments;
  }
}

public struct SegmentData
{
  public string id;

  public Vector3 pos;
  public Quaternion rot;

  public SegmentData(string id, Vector3 pos, Quaternion rot)
  {
    this.id = id;
    this.pos = pos;
    this.rot = rot;
  }

  public static SegmentData fromData(string id, float posx, float posy, float posz, float rotx, float roty, float rotz)
  {
    return new SegmentData(
      id,
      new Vector3(posx, posy, posz),
      Quaternion.Euler(rotx, roty, rotz)
    );
  }
}
