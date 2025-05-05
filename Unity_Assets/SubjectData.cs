using System;

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
  public float posx;
  public float posy;
  public float posz;
  public float rotx;
  public float roty;
  public float rotz;

  public SegmentData(string id, float posx, float posy, float posz, float rotx, float roty, float rotz)
  {
    this.id = id;
    this.posx = posx;
    this.posy = posy;
    this.posz = posz;
    this.rotx = rotx;
    this.roty = roty;
    this.rotz = rotz;
  }
}
