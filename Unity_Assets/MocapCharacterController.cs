using System;
using System.Collections.Generic;
using System.Linq;
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
    List<string> missingSegments = new();
    foreach (SegmentData segment in data.segments)
    {
      if (transforms.ContainsKey(segment.id))
      {
        transforms.TryGetValue(segment.id, out Transform segmentTransform);
        segmentTransform.SetLocalPositionAndRotation(
          segment.pos / 100,
          segment.rot
        );
      }
      else
      {
        missingSegments.Add(segment.id);
      }
    }

    if (missingSegments.Count > 0)
    {
      Debug.LogWarning("Could not find segments in skeleton transforms: \"" + string.Join("\", \"", missingSegments) + "\"");
    }
  }
}
