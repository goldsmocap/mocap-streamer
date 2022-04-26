import type { Ref } from "vue";
import type { ClientSummaryState } from "../../shared/clients";

import { ipcRenderer } from "electron";
import { ref } from "vue";

export const remoteName: Ref<string | undefined> = ref(undefined);
export const remoteConnected = ref(false);
export const remoteJoined = ref(false);

export const remoteState: Ref<ClientSummaryState> = ref({ clients: [], clientMap: [] });

///////////////////////////////////////////////////////////////////////////////////////////////////
// IPC from main
ipcRenderer.on("connect_remote_success", (_, newRemoteBaseUrl: string) => {
  console.log(`⚡ successfully connected to remote at ${newRemoteBaseUrl}`);
  remoteConnected.value = true;
});

ipcRenderer.on("join_remote_success", (_, newNameOnRemote: string) => {
  console.log(`💃 successfully joined remote with name ${remoteName.value}`);
  remoteName.value = newNameOnRemote;
  remoteJoined.value = true;
});

ipcRenderer.on("rename_success", (_, newName: string) => {
  remoteName.value = newName;
});

ipcRenderer.on("remote_disconnect", () => {
  remoteConnected.value = false;
});

ipcRenderer.on("remote_state", (_, newRemoteState: ClientSummaryState) => {
  remoteState.value = newRemoteState;

  if (!newRemoteState.clients.find(({ name }) => remoteName.value === name)) {
    remoteJoined.value = false;
  }
});
