import { ClientRole, ClientState, ClientSummaryState, clientSummaryState } from "./clients";

///////////////////////////////////////////////////////////////////////////////////////////////////
// Messages
export type BvhFrameMsg = { _tag: "bvh_frame"; frame: any; from: string };
export const bvhFrameMsg = (frame: any, from: string): BvhFrameMsg => ({
  _tag: "bvh_frame",
  frame,
  from,
});

export type RegisterUiMsg = { _tag: "register_ui" };
export const registerUiMsg: RegisterUiMsg = { _tag: "register_ui" };

export type JoinRemoteMsg = { _tag: "join_remote"; name: string; role: ClientRole };
export const joinRemoteMsg = (name: string, role: ClientRole): JoinRemoteMsg => ({
  _tag: "join_remote",
  name,
  role,
});

export type JoinRemoteFailMsg = { _tag: "join_remote_fail"; reason: string };
export const joinRemoteFailMsg = (reason: string): JoinRemoteFailMsg => ({
  _tag: "join_remote_fail",
  reason,
});

export type JoinRemoteSuccessMsg = { _tag: "join_remote_success"; name: string };
export const joinRemoteSuccessMsg = (name: string): JoinRemoteSuccessMsg => ({
  _tag: "join_remote_success",
  name,
});

export type ChangeRoleMsg = { _tag: "change_role"; name: string; newRole: ClientRole };
export const changeRoleMsg = (name: string, role: ClientRole) => ({
  _tag: "change_role",
  name,
  role,
});

export type RenameSuccessMsg = { _tag: "rename_success"; name: string };
export const renameSuccessMsg = (name: string): RenameSuccessMsg => ({
  _tag: "rename_success",
  name,
});

export type BecomeReceiverMsg = { _tag: "become_receiver"; from: string };
export const becomeReceiverMsg = (from: string): BecomeReceiverMsg => ({
  _tag: "become_receiver",
  from,
});

export type UnbecomeReceiverMsg = { _tag: "unbecome_receiver"; from: string };
export const unbecomeReceiverMsg = (from: string): UnbecomeReceiverMsg => ({
  _tag: "unbecome_receiver",
  from,
});

export type BecomeSenderMsg = { _tag: "become_sender"; to: string };
export const becomeSenderMsg = (to: string): BecomeSenderMsg => ({ _tag: "become_sender", to });

export type RemoteStateMsg = { _tag: "remote_state"; state: ClientSummaryState };
export const remoteStateMsg = (clientState: ClientState): RemoteStateMsg => ({
  _tag: "remote_state",
  state: clientSummaryState(clientState),
});

export type WsMessage =
  | BvhFrameMsg
  | RegisterUiMsg
  | JoinRemoteMsg
  | JoinRemoteFailMsg
  | JoinRemoteSuccessMsg
  | ChangeRoleMsg
  | RenameSuccessMsg
  | BecomeReceiverMsg
  | UnbecomeReceiverMsg
  | BecomeSenderMsg
  | RemoteStateMsg;

export const serialize = (msg: WsMessage): string => JSON.stringify(msg);
