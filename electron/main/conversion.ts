import osc from "osc";
import {
  MessageMode,
  SubjectData,
  dataOrder,
  transformOrder,
  viconTransformMap,
} from "./types";

const BVH_DATA_NUMBER_COUNT = transformOrder.length * dataOrder.length;
const BVH_PRECISION = 2;
const PREFIX_SEPARATOR = ":";
const CHAR_ID_SEPARATOR = "&";

interface ConversionOptions {
  addressPrefix: string;
  outputMultiple?: boolean;
}

export function bvhToOsc(
  bvhString: string,
  options: ConversionOptions & { outputMultiple: true }
): Uint8Array[];
export function bvhToOsc(
  bvhString: string,
  options: ConversionOptions & { outputMultiple?: false }
): Uint8Array;
export function bvhToOsc(
  bvhString: string,
  options: ConversionOptions
): Uint8Array | Uint8Array[] {
  const characters = bvhString
    .split(" ||")
    .slice(0, -1)
    .map((str) => str.split(" "));
  const toAddress = (charIds: string[]) =>
    (options.addressPrefix != null
      ? encodeURIComponent(options.addressPrefix) + PREFIX_SEPARATOR
      : "") + charIds.map(encodeURIComponent).join(CHAR_ID_SEPARATOR);
  if (options.outputMultiple) {
    return characters.map(
      (character): Uint8Array =>
        dataToOsc({
          address: toAddress([
            character
              .slice(0, character.length - BVH_DATA_NUMBER_COUNT)
              .join(" "),
          ]),
          args: character
            .slice(character.length - BVH_DATA_NUMBER_COUNT)
            .map(Number),
          mode: "mocap",
        })
    );
  } else {
    return dataToOsc({
      address: toAddress(
        characters.map((character) =>
          character.slice(0, character.length - BVH_DATA_NUMBER_COUNT).join(" ")
        )
      ),
      args: characters.flatMap((character) =>
        character.slice(character.length - BVH_DATA_NUMBER_COUNT).map(Number)
      ),
      mode: "mocap",
    });
  }
}

interface OscData<T = unknown> {
  address: string;
  args: T;
  mode: MessageMode;
}

export function dataToOsc({ address, args, mode }: OscData): Uint8Array {
  return osc.writeMessage({
    address: "/" + mode + PREFIX_SEPARATOR + address,
    args,
  });
}

export function oscToData(message: Uint8Array): OscData {
  const { address: fullAddress, args }: Omit<OscData, "mode"> =
    osc.readMessage(message);
  // Ignore the first "/"
  const combinedAddress = fullAddress.slice(1);
  const prefixIdx = combinedAddress.indexOf(PREFIX_SEPARATOR);
  const mode = combinedAddress.slice(0, prefixIdx) as MessageMode;
  const address = combinedAddress.slice(prefixIdx + 1);
  return { args, mode, address };
}

interface InternalOSCMessage {
  address: string;
  args: number[];
}
interface BvhData {
  addressPrefix?: string;
  data: string[];
}

export function oscToBvh({ address, args }: OscData<number[]>): BvhData {
  const [charIds, prefix] = address
    .slice(1)
    .split(PREFIX_SEPARATOR)
    // Reversed so the charId variable always contains the character Id
    .reverse();
  return {
    addressPrefix: decodeURIComponent(prefix),
    data: charIds.split(CHAR_ID_SEPARATOR).map(
      (charId, i) =>
        `${decodeURIComponent(charId)} ${args
          .slice(i * BVH_DATA_NUMBER_COUNT, (i + 1) * BVH_DATA_NUMBER_COUNT)
          .map((n) => n.toFixed(BVH_PRECISION))
          .join(" ")} ||`
    ),
  };
}

export function subjectDataToBvh(subjectData: SubjectData): string | null {
  const data = transformOrder
    .flatMap((transformName) =>
      dataOrder
        .map(
          (dataName) =>
            subjectData.segments[viconTransformMap[transformName]][dataName]
        )
        .map((n) => (isNaN(n) ? 0 : n))
    )
    .map((n) => n.toFixed(BVH_PRECISION));
  return `0 ${subjectData.name} ${data.join(" ")} ||`;
}

export function bufferToString(buffer: Buffer): string {
  return buffer.reduce((str, value) => str + String.fromCharCode(value), "");
}

export function stringToBuffer(bvh: string): Buffer {
  return Buffer.from(bvh, "utf-8");
}
