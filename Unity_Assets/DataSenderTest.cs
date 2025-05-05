// TODO: USE 2022.3.10
using System;
using UnityEngine;

public class DataSenderTest : MonoBehaviour
{
  public NetworkManager manager;
  public bool isOn;

  void Start()
  {
    InvokeRepeating("Send", 0f, 0.5f);
  }

  void Send()
  {
    if (manager != null)
    {
      manager.SendData(isOn ? "1" : "0");
    }
    else
    {
      throw new Exception("No network manager setup!");
    }
  }
}
