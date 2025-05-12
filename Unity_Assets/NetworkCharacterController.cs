using System;
using UnityEngine;

public class NetworkCharacterController : MonoBehaviour
{
  public string peerName;
  public ushort characterID = 0;

  private TimeSpan lastFrame;
  private NetworkManager manager;
  private MocapCharacterController controller;

  void Start()
  {
    manager = GetComponentInParent<NetworkManager>();
    controller = GetComponent<MocapCharacterController>();
    lastFrame = TimeSpan.Zero;
  }

  void Update()
  {
    AnimationFrame? maybeFrame = manager.PollCharacter(peerName, characterID, lastFrame);
    if (maybeFrame.HasValue)
    {
      AnimationFrame frame = maybeFrame.Value;
      if (frame.frameStart > lastFrame)
      {
        controller.SetFrame(maybeFrame.Value.subject);
        lastFrame = frame.frameStart;
      }
    }
  }
}
