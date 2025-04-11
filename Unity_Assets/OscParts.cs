public struct OscParts
{
  public readonly string mode;
  public readonly string address;
  public readonly string argTypes;
  public readonly byte[] args;

  public OscParts(string mode, string address, string argTypes, byte[] args)
  {
    this.mode = mode;
    this.address = address;
    this.argTypes = argTypes;
    this.args = args;
  }
}
