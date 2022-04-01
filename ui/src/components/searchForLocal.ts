export type SearchFail = { _tag: "SearchFail"; msg: string };
export const searchFail = (msg: string): SearchFail => ({ _tag: "SearchFail", msg });

export type SearchSuccessNoName = { _tag: "SearchSuccessNoName" };
export const searchSuccessNoName: SearchSuccessNoName = { _tag: "SearchSuccessNoName" };

export type SearchSuccessHasName = { _tag: "SearchSuccessHasName"; name: string };
export const searchSuccessHasName = (name: string): SearchSuccessHasName => ({
  _tag: "SearchSuccessHasName",
  name,
});

export type SearchResult = SearchFail | SearchSuccessNoName | SearchSuccessHasName;
