export type Observer = {
  _tag: "Observer";
};
export const observer: Observer = { _tag: "Observer" };

export type User = {
  _tag: "User";
  name: string;
};
export function user(name: string): User {
  return { _tag: "User", name };
}

export type ConnectedAs = Observer | User;
