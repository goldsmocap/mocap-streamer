using System;
using System.Collections.Generic;
using UnityEngine;

public class MocapCharacterController : MonoBehaviour
{
  private Dictionary<string, Transform> transforms;

  void Start()
  {
    transforms = new();
    InitialiseTransforms(GetComponentInParent<Transform>());
  }

  private void InitialiseTransforms(Transform baseTransform)
  {
    Stack<Transform> transformStack = new();
    transformStack.Push(baseTransform);
    while (transformStack.Count > 0)
    {
      transformStack.TryPop(out Transform currTransform);
      transforms.Add(currTransform.name, currTransform);
      for (ushort i = 0; i < currTransform.childCount; i++)
      {
        transformStack.Push(currTransform.GetChild(i));
      }
    }
  }

  public void SetFrame(SubjectData data)
  {
    foreach (SegmentData segment in data.segments)
    {
      if (transforms.ContainsKey(segment.id))
      {
        transforms.TryGetValue(segment.id, out Transform segmentTransform);
        segmentTransform.SetLocalPositionAndRotation(
          new Vector3(segment.posx / 100, segment.posy / 100, segment.posz / 100),
          Quaternion.Euler(segment.rotx, segment.roty, segment.rotz)
        );
      }
      else
      {
        Debug.LogWarning("Could not find segment ID in skeleton transforms: " + segment.id);
      }
    }
  }
}
