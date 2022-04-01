import { ClientState, ClientSummaryState, clientSummaryState } from "./clients";

///////////////////////////////////////////////////////////////////////////////////////////////////
// Messages
export type BvhFrame = { _tag: "bvh_frame"; frame: any; from: string };
export const bvhFrame = (frame: any, from: string): BvhFrame => ({
  _tag: "bvh_frame",
  frame,
  from,
});

export type RegisterUi = { _tag: "register_ui" };
export const registerUi: RegisterUi = { _tag: "register_ui" };

export type JoinRemote = { _tag: "join_remote"; name: string };
export const joinRemote = (name: string): JoinRemote => ({ _tag: "join_remote", name });

export type JoinRemoteFail = { _tag: "join_remote_fail"; reason: string };
export const joinRemoteFail = (reason: string): JoinRemoteFail => ({
  _tag: "join_remote_fail",
  reason,
});

export type JoinRemoteSuccess = { _tag: "join_remote_success"; name: string };
export const joinRemoteSuccess = (name: string): JoinRemoteSuccess => ({
  _tag: "join_remote_success",
  name,
});

export type RenameSuccess = { _tag: "rename_success"; name: string };
export const renameSuccess = (name: string): RenameSuccess => ({ _tag: "rename_success", name });

export type BecomeReceiver = { _tag: "become_receiver"; from: string };
export const becomeReceiver = (from: string): BecomeReceiver => ({
  _tag: "become_receiver",
  from,
});

export type UnbecomeReceiver = { _tag: "unbecome_receiver"; from: string };
export const unbecomeReceiver = (from: string): UnbecomeReceiver => ({
  _tag: "unbecome_receiver",
  from,
});

export type BecomeSender = { _tag: "become_sender"; to: string };
export const becomeSender = (to: string): BecomeSender => ({ _tag: "become_sender", to });

export type RemoteState = { _tag: "remote_state"; state: ClientSummaryState };
export const remoteState = (clientState: ClientState): RemoteState => ({
  _tag: "remote_state",
  state: clientSummaryState(clientState),
});

export type WsMessage =
  | BvhFrame
  | RegisterUi
  | JoinRemote
  | JoinRemoteFail
  | JoinRemoteSuccess
  | RenameSuccess
  | BecomeReceiver
  | UnbecomeReceiver
  | BecomeSender
  | RemoteState;

export const serialize = (msg: WsMessage): string => JSON.stringify(msg);
