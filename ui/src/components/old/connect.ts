export type Searching = {
  _tag: "Searching";
};

export const searching: Searching = { _tag: "Searching" };

export type SearchFail = {
  _tag: "SearchFail";
  msg: string;
};

export function searchFail(msg: string): SearchFail {
  return { _tag: "SearchFail", msg };
}

export type SearchSuccessNoName = {
  _tag: "SearchSuccessNoName";
};

export const searchSuccessNoName: SearchSuccessNoName = { _tag: "SearchSuccessNoName" };

export type SearchSuccessHasName = {
  _tag: "SearchSuccessHasName";
  name: string;
};

export function searchSuccessHasName(name: string): SearchSuccessHasName {
  return { _tag: "SearchSuccessHasName", name };
}

export type Search = Searching | SearchFail | SearchSuccessNoName | SearchSuccessHasName;

export type ConnectError = {
  _tag: "ConnectError";
  showButton: boolean;
  msg: string;
};
export function connectError(msg: string, showButton?: boolean): ConnectError {
  return {
    _tag: "ConnectError",
    showButton: showButton ?? false,
    msg,
  };
}
