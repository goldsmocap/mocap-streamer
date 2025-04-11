using System;
using UnityEngine;

public class MocapCharacterController : MonoBehaviour
{
  public static readonly int TRANSFORM_DATA_LENGTH = 59 * 6;
  private Transform[] transforms;
  readonly private string[] transformOrder = {
        // "Root",
        "Hips",
        "RightUpLeg",
        "RightLeg",
        "RightFoot",
        "LeftUpLeg",
        "LeftLeg",
        "LeftFoot",
        "Spine",
        "Spine1",
        "Spine2",
        "Neck",
        "Neck1",
        "Head",
        "RightShoulder",
        "RightArm",
        "RightForeArm",
        "RightHand",
        "RightHandThumb1",
        "RightHandThumb2",
        "RightHandThumb3",
        "RightInHandIndex",
        "RightHandIndex1",
        "RightHandIndex2",
        "RightHandIndex3",
        "RightInHandMiddle",
        "RightHandMiddle1",
        "RightHandMiddle2",
        "RightHandMiddle3",
        "RightInHandRing",
        "RightHandRing1",
        "RightHandRing2",
        "RightHandRing3",
        "RightInHandPinky",
        "RightHandPinky1",
        "RightHandPinky2",
        "RightHandPinky3",
        "LeftShoulder",
        "LeftArm",
        "LeftForeArm",
        "LeftHand",
        "LeftHandThumb1",
        "LeftHandThumb2",
        "LeftHandThumb3",
        "LeftInHandIndex",
        "LeftHandIndex1",
        "LeftHandIndex2",
        "LeftHandIndex3",
        "LeftInHandMiddle",
        "LeftHandMiddle1",
        "LeftHandMiddle2",
        "LeftHandMiddle3",
        "LeftInHandRing",
        "LeftHandRing1",
        "LeftHandRing2",
        "LeftHandRing3",
        "LeftInHandPinky",
        "LeftHandPinky1",
        "LeftHandPinky2",
        "LeftHandPinky3",
    };

  void Start()
  {
    InitialiseTransforms(GetComponentInParent<Transform>());
  }

  private void InitialiseTransforms(Transform baseTransform)
  {
    transforms = new Transform[transformOrder.Length];
    Transform[] transformStack = new Transform[100];
    ushort foundTransforms = 0;
    short stackIndex = 0;
    transformStack[0] = baseTransform;
    while (stackIndex >= 0)
    {
      Transform currTransform = transformStack[stackIndex];
      stackIndex--;
      int orderIndex = Array.IndexOf(transformOrder, currTransform.name);
      if (orderIndex >= 0)
      {
        transforms[orderIndex] = currTransform;
        foundTransforms++;
      }
      for (ushort i = 0; i < currTransform.childCount; i++)
      {
        stackIndex++;
        transformStack[stackIndex] = currTransform.GetChild(i);
      }
    }
  }

  public void SetFrame(float[] data)
  {
    for (int i = 0; i < transforms.Length; i++)
    {
      if (transforms[i] != null)
      {
        int dataIndex = i * 6;
        transforms[i].SetLocalPositionAndRotation(
            new Vector3(-data[dataIndex] / 100, data[dataIndex + 1] / 100, data[dataIndex + 2] / 100),
            Quaternion.Euler(data[dataIndex + 4], -data[dataIndex + 3], -data[dataIndex + 5])
        );
      }
    }
  }
}
