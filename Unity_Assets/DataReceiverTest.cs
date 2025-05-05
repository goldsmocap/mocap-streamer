// TODO: USE 2022.3.10
using System;
using UnityEngine;

public class DataReceiverTest : MonoBehaviour
{
  public NetworkManager manager;
  public string targetPeerName;

  void Start()
  {
    InvokeRepeating("Receive", 0f, 0.5f);
  }

  void Receive()
  {
    if (manager != null)
    {
      string maybeData = manager.TryGetData(targetPeerName);
      if (maybeData != null)
      {
        Debug.Log(maybeData);
      }
    }
    else
    {
      throw new Exception("No network manager setup!");
    }
  }
}
