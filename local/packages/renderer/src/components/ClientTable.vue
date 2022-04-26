<script lang="ts" setup>
import type { Ref } from "vue";
import type { ClientRole, ClientSummary, ClientSummaryMap } from "../../../../../shared/clients";

import { ipcRenderer } from "electron";
import { computed, ref, watch } from "vue";
import { DotsHorizontalIcon } from "@heroicons/vue/solid";
import { roleBoth, roleReceiver, roleSender } from "../../../../../shared/clients";
import { remoteName, remoteState, senderPorts } from "../remote";
import Modal from "../components/Modal.vue";
import ClientTableCell from "./ClientTableCell.vue";

const clients: Ref<ClientSummary[]> = computed(() => remoteState.value.clients);
const clientMap: Ref<ClientSummaryMap> = computed(() => remoteState.value.clientMap);
// const clients: Ref<ClientSummary[]> = ref([
//   { name: "Ohuu", role: roleSender },
//   { name: "Neal", role: roleReceiver },
//   { name: "Clem", role: roleReceiver },
//   { name: "Dan", role: roleReceiver },
//   { name: "Ash", role: roleBoth },
// ]);
// const clientMap: Ref<ClientSummaryMap> = ref([
//   [{ name: "Ohuu" }, { name: "Neal" }] as [ClientSummary, ClientSummary],
// ]);

const senders = computed(() =>
  clients.value.filter(({ role }) => role === "SENDER" || role === "BOTH")
);
const receivers = computed(() =>
  clients.value.filter(({ role }) => role === "RECEIVER" || role === "BOTH")
);

const renameOpen = ref(false);
const oldName = ref("");
const newName = ref("");

function getPortNumber(sender: string, receiver: string): number | undefined {
  return clientMap.value.find(([{ name: senderName }, { name: receiverName }]) => {
    return sender == senderName && receiver == receiverName;
  })?.[2]?.port;
}

function openRename(clientToRename: string) {
  oldName.value = clientToRename;
  renameOpen.value = true;
}

watch(remoteName, () => {
  renameOpen.value = false;
});

function isConnected(sender: ClientSummary, receiver: ClientSummary): boolean {
  return (
    clientMap.value.findIndex(([{ name: senderName }, { name: receiverName }]) => {
      return sender.name == senderName && receiver.name == receiverName;
    }) >= 0
  );
}

function sendAll(fromName: string) {
  for (let receiver of receivers.value) {
    ipcRenderer.send("map", fromName, receiver.name);
  }
}

function receiveAll(toName: string) {
  for (let sender of senders.value) {
    ipcRenderer.send("map", sender.name, toName);
  }
}

function changeRole(name: string, newRole: ClientRole) {
  ipcRenderer.send("change_role", name, newRole);
}

function rename(oldName: string, newName: string) {
  ipcRenderer.send("rename", oldName, newName);
}

function map(fromName: string, toName: string) {
  ipcRenderer.send("map", fromName, toName);
}

function unmap(fromName: string, toName: string) {
  ipcRenderer.send("unmap", fromName, toName);
}

function leave(name: string) {
  ipcRenderer.send("leave_remote", name);
}
</script>

<template>
  <table class="table">
    <thead>
      <tr>
        <th colspan="2" rowspan="2" class="bg-white border-none"></th>
        <th :colspan="receivers.length" class="bg-white text-justify">
          <div class="w-full text-center text-gray-400 normal-case text-base">receivers</div>
        </th>
      </tr>
      <tr>
        <th v-for="receiver in receivers" class="normal-case text-base text-center">
          <p>{{ receiver.name }}</p>
          <div class="dropdown dropdown-down">
            <label tabindex="0" class="link">
              <dots-horizontal-icon class="w-4" />
            </label>
            <ul
              tabindex="0"
              class="dropdown-content menu bg-base-100 shadow rounded-box text-xs ml-4"
            >
              <li><a @click="receiveAll(receiver.name)">receive all</a></li>
              <li v-if="receiver.role === 'BOTH'">
                <a @click="changeRole(receiver.name, roleSender)">stop receiving</a>
              </li>
              <li v-else><a @click="changeRole(receiver.name, roleBoth)">become sender</a></li>
              <li><a @click="openRename(receiver.name)">rename</a></li>
              <li><a @click="leave(receiver.name)">leave</a></li>
            </ul>
          </div>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(sender, i) in senders">
        <th v-if="i == 0" :rowspan="senders.length" class="border-none">
          <div class="-rotate-90 text-gray-400">senders</div>
        </th>
        <th class="bg-base-200">
          <span class="mr-8">{{ sender.name }}</span>

          <div class="dropdown dropdown-right float-right">
            <label tabindex="0" class="link">
              <dots-horizontal-icon class="w-4" />
            </label>
            <ul
              tabindex="0"
              class="dropdown-content menu bg-base-100 shadow rounded-box text-xs ml-4"
            >
              <li><a @click="sendAll(sender.name)">send all</a></li>
              <li v-if="sender.role === 'BOTH'">
                <a @click="changeRole(sender.name, roleReceiver)">stop sending</a>
              </li>
              <li v-else><a @click="changeRole(sender.name, roleBoth)">become receiver</a></li>
              <li><a @click="openRename(sender.name)">rename</a></li>
              <li><a @click="leave(sender.name)">leave</a></li>
            </ul>
          </div>
        </th>
        <client-table-cell
          v-for="receiver in receivers"
          :sender="sender.name"
          :receiver="receiver.name"
          :port-number="getPortNumber(sender.name, receiver.name)"
          :connected="isConnected(sender, receiver)"
          @map="map"
          @unmap="unmap"
        />
      </tr>
    </tbody>
  </table>

  <modal v-if="renameOpen" v-model:open="renameOpen">
    <p class="w-full text-center">Rename {{ oldName }}</p>
    <div class="divider py-4" />
    <div class="form-control">
      <input
        class="input input-bordered w-full mb-2"
        type="text"
        placeholder="name on remote"
        v-model="newName"
      />
    </div>
    <button class="btn btn-sm float-right" @click="rename(oldName, newName)">Rename</button>
  </modal>
</template>
