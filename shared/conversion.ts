import osc from "osc";

const BVH_DATA_NUMBER_COUNT = 59 * 6;
const BVH_PRECISION = 2;
const PREFIX_SEPARATOR = ":";
const CHAR_ID_SEPARATOR = "&";

interface ConversionOptions {
  addressPrefix?: string;
  outputMultiple?: boolean;
}

export function bvhToOsc(
  bvhString: string,
  options: ConversionOptions & { outputMultiple: true }
): Uint8Array[];
export function bvhToOsc(
  bvhString: string,
  options?: ConversionOptions & { outputMultiple?: false }
): Uint8Array;
export function bvhToOsc(
  bvhString: string,
  options?: ConversionOptions
): Uint8Array | Uint8Array[] {
  const characters = bvhString
    .split(" ||")
    .slice(0, -1)
    .map((str) => str.split(" "));
  const toAddress = (charIds: string[]) =>
    "/" +
    (options.addressPrefix != null
      ? encodeURIComponent(options.addressPrefix) + PREFIX_SEPARATOR
      : "") +
    charIds.map(encodeURIComponent).join(CHAR_ID_SEPARATOR);
  if (options.outputMultiple) {
    return characters.map(
      (character): Uint8Array =>
        osc.writeMessage({
          address: toAddress([
            character
              .slice(0, character.length - BVH_DATA_NUMBER_COUNT)
              .join(" "),
          ]),
          args: character
            .slice(character.length - BVH_DATA_NUMBER_COUNT)
            .map(Number),
        })
    );
  } else {
    return osc.writeMessage({
      address: toAddress(
        characters.map((character) =>
          character.slice(0, character.length - BVH_DATA_NUMBER_COUNT).join(" ")
        )
      ),
      args: characters.flatMap((character) =>
        character.slice(character.length - BVH_DATA_NUMBER_COUNT).map(Number)
      ),
    });
  }
}

interface BvhData {
  addressPrefix?: string;
  data: string[];
}

interface InternalOSCMessage {
  address: string;
  args: number[];
}

export function oscToBvh(oscMessage: Uint8Array): BvhData {
  const decoded: InternalOSCMessage = osc.readMessage(oscMessage);
  const [charIds, prefix] = decoded.address
    // Ignore the first "/"
    .slice(1)
    .split(PREFIX_SEPARATOR)
    // Reversed so the charId variable always contains the character Id
    .reverse();
  return {
    addressPrefix: decodeURIComponent(prefix),
    data: charIds.split(CHAR_ID_SEPARATOR).map(
      (charId, i) =>
        `${decodeURIComponent(charId)} ${decoded.args
          .slice(i * BVH_DATA_NUMBER_COUNT, (i + 1) * BVH_DATA_NUMBER_COUNT)
          .map((n) => n.toFixed(BVH_PRECISION))
          .join(" ")} ||`
    ),
  };
}

export function bufferToBvh(buffer: Buffer): string {
  return buffer.reduce((str, value) => str + String.fromCharCode(value), "");
}

export function bvhToBuffer(bvh: string): Buffer {
  return Buffer.from(bvh, "utf-8");
}
