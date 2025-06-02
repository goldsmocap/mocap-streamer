type RecursionLimit = 1001;

export type FixedLengthTuple<
  T,
  N extends number,
  A extends T[] = [T]
> = A["length"] extends RecursionLimit
  ? [T, ...T[]]
  : A["length"] extends N
  ? A
  : FixedLengthTuple<T, N, [...A, T]>;

export const tuple = <const T extends unknown[]>(...tuple: T) => tuple;

export const raise = (error: Error): never => {
  throw error;
};

export const checkExhausted = (value: never) =>
  raise(new Error(`Value not exhausted: ${JSON.stringify(value)}`));

export const typedKeys = <O extends object>(obj: O): (keyof O)[] =>
  Object.keys(obj) as (keyof O)[];

export type Entry<O extends object> = [keyof O, O[keyof O]];

export const typedToEntries = <O extends object>(
  obj: O
): [keyof O, O[keyof O]][] => Object.entries(obj) as [keyof O, O[keyof O]][];

export const typedFromEntries = <O extends object>(
  entries: [keyof O, O[keyof O]][]
): O => Object.fromEntries(entries) as O;

export const mapObject = <I extends object, O extends object>(
  obj: I,
  mapper: (entry: Entry<I>, index: number, array: Entry<I>[]) => Entry<O>
): O => typedFromEntries(typedToEntries(obj).map(mapper));

type Zippable = [readonly unknown[], ...(readonly unknown[])[]];
type ZippedItem<Z extends Zippable> = {
  [K in keyof Z]: Z[K] extends readonly (infer T)[] ? T : Z[K];
};

export const zip = <const Z extends Zippable>(...toZip: Z) =>
  toZip.every((arr) => arr.length === toZip[0].length)
    ? toZip[0].map((_, i) => toZip.map((arr) => arr[i]) as ZippedItem<Z>)
    : raise(new Error("Zip index out of bounds"));
