import osc from "osc";

const BVH_DATA_NUMBER_COUNT = 59 * 6;
const BVH_PRECISION = 2;

export function bvhToOsc(bvhString: string, outputMultiple: true): Uint8Array[];
export function bvhToOsc(bvhString: string, outputMultiple?: false): Uint8Array;
export function bvhToOsc(
  bvhString: string,
  outputMultiple: boolean = false
): Uint8Array | Uint8Array[] {
  const characters = bvhString
    .split(" ||")
    .slice(0, -1)
    .map((str) => str.split(" "));
  if (outputMultiple) {
    return characters
      .map(
        (character) =>
          [
            character
              .slice(0, character.length - BVH_DATA_NUMBER_COUNT)
              .join(" ")
              .replace(/^\d+\s+/, ""),
            character
              .slice(character.length - BVH_DATA_NUMBER_COUNT)
              .map(Number),
          ] as const
      )
      .map(([address, args]) => osc.writeMessage({ address, args }));
  } else {
    const allCharIds = characters.map((character) =>
      encodeURIComponent(
        character.slice(0, character.length - BVH_DATA_NUMBER_COUNT).join(" ")
      )
    );
    const args = characters.flatMap((character) =>
      character.slice(character.length - BVH_DATA_NUMBER_COUNT).map(Number)
    );
    return osc.writeMessage({ address: `/${allCharIds.join(":")}`, args });
  }
}

export function oscToBvh(oscMessage: Uint8Array): string {
  const decoded = osc.readMessage(oscMessage);
  const charIds = decoded.address.slice(1).split(":").map(decodeURIComponent);
  return charIds
    .map(
      (charId, i) =>
        `${charId} ${decoded.args
          .slice(i * BVH_DATA_NUMBER_COUNT, (i + 1) * BVH_DATA_NUMBER_COUNT)
          .map((n) => n.toFixed(BVH_PRECISION))
          .join(" ")} ||`
    )
    .join("");
}

export function bufferToBvh(buffer: Buffer): string {
  return buffer.reduce((str, value) => str + String.fromCharCode(value), "");
}

export function bvhToBuffer(bvh: string): Buffer {
  return Buffer.from(bvh, "utf-8");
}
