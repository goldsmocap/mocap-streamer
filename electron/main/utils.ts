export const tuple = <const T extends unknown[]>(...tuple: T) => tuple;

export const raise = (error: Error): never => {
  throw error;
};

export const checkExhausted = (value: never) =>
  raise(new Error(`Value not exhausted: ${JSON.stringify(value)}`));
