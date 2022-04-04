<script lang="ts" setup>
import type { Ref } from "vue";
import type { ClientRole } from "../../../../../shared/dist/clients";

import { ipcRenderer } from "electron";
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  UserCircleIcon,
  EyeIcon,
  LogoutIcon,
  StatusOfflineIcon,
  StatusOnlineIcon,
} from "@heroicons/vue/solid";
import { remoteConnected, remoteJoined, remoteName } from "../remote";
import Modal from "../components/Modal.vue";
import ClientTable from "../components/ClientTable.vue";

const router = useRouter();

// join
const joinOpen = ref(false);
const joinType: Ref<"INFO" | "WARN"> = ref("INFO");
const joinMsg = ref("");
const joinName = ref("");
const joinRole: Ref<ClientRole> = ref("SENDER");

watch(remoteConnected, (connected) => {
  if (!connected) {
    router.push("/");
  }
});

watch(remoteJoined, (joined) => {
  if (joined) {
    joinOpen.value = false;
    joinMsg.value = "";
    joinName.value = "";
  } else {
    joinOpen.value = true;
    joinType.value = "WARN";
    joinMsg.value = "It looks like you lost connection with the remote server.";
  }
});

// open modal
function openJoinModal() {
  joinOpen.value = true;
  joinType.value = "INFO";
  joinMsg.value = "Provide a name to join the remote server.";
}

function joinRemote() {
  ipcRenderer.send("join_remote", joinName.value, joinRole.value);
}

// leave
function leave() {
  ipcRenderer.send("leave_remote", remoteName.value);
}

// close
function close() {
  ipcRenderer.send("close_remote", remoteName.value);
}
</script>

<template>
  <div class="w-screen h-screen p-1 sm:p-2 md:p-4 lg:p-8">
    <div class="rounded-lg w-full h-full bg-white border shadow-xl text-black p-4">
      <!-- Header -->
      <div class="mb-8">
        <div v-if="remoteJoined" class="flex items-center w-full">
          <div class="grow">
            <div class="flex items-center">
              <user-circle-icon class="w-8 mr-2" /> {{ remoteName }}
            </div>
          </div>
          <div class="shrink flex">
            <button class="btn mr-2" @click="leave">
              <div class="flex items-center">
                <div><status-offline-icon class="w-6 mr-2" /></div>
                <div>Leave</div>
              </div>
            </button>
            <button class="btn" @click="close">
              <div class="flex items-center">
                <div><logout-icon class="w-6 mr-2" /></div>
                <div>Close</div>
              </div>
            </button>
          </div>
        </div>
        <div v-else class="flex items-center w-full">
          <div class="grow flex items-center"><eye-icon class="w-8 mr-2" /> Observer</div>
          <button class="btn mr-2" @click="openJoinModal">
            <div class="flex items-center">
              <div><status-online-icon class="w-6 mr-2" /></div>
              <div>Join</div>
            </div>
          </button>
          <button class="btn" @click="close">
            <div class="flex items-center">
              <div><logout-icon class="w-6 mr-2" /></div>
              <div>Close</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Table -->
      <client-table />
    </div>
  </div>

  <modal v-if="joinOpen" :type="joinType" v-model:open="joinOpen">
    <p class="w-full text-center">{{ joinMsg }}</p>
    <div class="divider py-4" />
    <div class="form-control">
      <input
        class="input input-bordered w-full mb-2"
        type="text"
        placeholder="name on remote"
        v-model="joinName"
      />
      <select class="select select-bordered w-full mb-2" v-model="joinRole">
        <option value="SENDER">SENDER</option>
        <option value="RECEIVER">RECEIVER</option>
        <option value="BOTH">BOTH</option>
      </select>
    </div>
    <button class="btn btn-sm float-right" @click="joinRemote">Join</button>
  </modal>
</template>
