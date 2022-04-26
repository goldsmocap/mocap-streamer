<script lang="ts" setup>
import type { ClientRole } from "../../../../../shared/clients";

import { ipcRenderer } from "electron";
import { watch } from "vue";
import { useRouter } from "vue-router";
import { remoteConnected } from "../remote";
import RegisterServer from "../components/RegisterServer.vue";

const router = useRouter();

watch(remoteConnected, (connected) => {
  if (connected) router.push("/dashboard");
});

function connectRemote(remoteUrl: string) {
  ipcRenderer.send("connect_remote", remoteUrl);
}

function connectAndJoinRemote(remoteUrl: string, name: string, role: ClientRole) {
  ipcRenderer.send("connect_and_join_remote", remoteUrl, name, role);
}
</script>

<template>
  <register-server @connect="connectRemote" @connect-and-join="connectAndJoinRemote" />
</template>
