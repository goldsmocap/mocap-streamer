<script lang="ts" setup>
import type { ComputedRef, Ref } from "vue";
import type { ClientSummary, ClientSummaryMap } from "../../../shared/clients";

import { computed, ref } from "vue";
import { PlusIcon, DotsHorizontalIcon } from "@heroicons/vue/solid";
import { remoteState } from "../remote";

// const clients: ComputedRef<ClientSummary[]> = computed(() => remoteState.value.clients);
const clients: Ref<ClientSummary[]> = ref([
  { name: "Ohuu" },
  { name: "Neal" },
  { name: "Clem" },
  { name: "Dan" },
  { name: "Ash" },
]);
const clientMap: Ref<ClientSummaryMap> = ref([
  [{ name: "Ohuu" }, { name: "Neal" }] as [ClientSummary, ClientSummary],
]);

function isConnected(sender: ClientSummary, receiver: ClientSummary): boolean {
  return (
    clientMap.value.findIndex(([{ name: senderName }, { name: receiverName }]) => {
      return sender.name == senderName && receiver.name == receiverName;
    }) >= 0
  );
}
</script>

<template>
  <table class="table">
    <thead>
      <tr>
        <th colspan="2" rowspan="2" class="bg-white border-none"></th>
        <th :colspan="clients.length" class="bg-white text-justify">
          <div class="w-full text-center text-gray-400 normal-case text-base">receivers</div>
        </th>
      </tr>
      <tr>
        <th v-for="receiver in clients" class="normal-case text-base text-center">
          <p>{{ receiver.name }}</p>
          <div class="dropdown dropdown-down">
            <label tabindex="0" class="link">
              <dots-horizontal-icon class="w-4" />
            </label>
            <ul
              tabindex="0"
              class="dropdown-content menu bg-base-100 shadow rounded-box text-xs ml-4"
            >
              <li><a>receive all</a></li>
              <li><a>rename</a></li>
              <li><a>delete</a></li>
            </ul>
          </div>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(sender, i) in clients">
        <th v-if="i == 0" :rowspan="clients.length" class="border-none">
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
              <li><a>send all</a></li>
              <li><a>rename</a></li>
              <li><a>delete</a></li>
            </ul>
          </div>
        </th>
        <td
          v-for="receiver in clients"
          class="link"
          :class="[isConnected(sender, receiver) ? 'bg-secondary' : 'bg-white']"
        >
          <!-- <plus-icon class="w-8 m-auto animate-pulse" /> -->
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style lang="postcss" scoped></style>
