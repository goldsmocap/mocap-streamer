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
