<script lang="ts" setup>
import type { Ref } from "vue";
import type { Option } from "fp-ts/Option";
import type { SearchResult } from "../components/searchForLocal";

import { computed, ref, watch } from "vue";
import { UserCircleIcon, EyeIcon, LogoutIcon } from "@heroicons/vue/solid";
import { none } from "fp-ts/Option";
import { match, P } from "ts-pattern";
import { remoteBaseUrl } from "../remote";
import { managingLocalServer, nameOnRemote, localJoin } from "../local";
import Modal from "../components/Modal.vue";
import SearchForLocal from "../components/SearchForLocal.vue";

// search
const searchResult: Ref<Option<SearchResult>> = ref(none);
const showjoinBtn = computed(() =>
  match(searchResult.value)
    .with({ _tag: "Some", value: { _tag: P.when((tag) => tag.includes("Success")) } }, () => true)
    .otherwise(() => false)
);
function resetSearch() {
  searchResult.value = none;
  rejoinName.value = "";
  joinName.value = "";
}

// rejoin
const rejoinOpen = ref(false);
const rejoinName = ref("");
const rejoin = () => {
  localJoin(`ws://${remoteBaseUrl.value}`, rejoinName.value)
    .then(() => (rejoinOpen.value = false))
    .catch((err) => {});
};
watch(managingLocalServer, (newValue, oldValue) => {
  resetSearch();
  return (rejoinOpen.value = oldValue && !newValue);
});

// join
const joinOpen = ref(false);
const joinName = ref("");
const join = () => {
  localJoin(`ws://${remoteBaseUrl.value}`, joinName.value)
    .then(() => (joinOpen.value = false))
    .catch((err) => {});
};

// local server
function manageLocalServer() {
  resetSearch();
  joinOpen.value = true;
}

// leave
function leave() {
  fetch(`http://${remoteBaseUrl.value}/api/leave/${nameOnRemote.value}`)
    .then(() => (rejoinOpen.value = false))
    .catch((err) => console.error(err));
}
</script>

<template>
  <div class="w-screen h-screen p-1 sm:p-2 md:p-4 lg:p-8">
    <div class="rounded-lg w-full h-full bg-white border shadow-xl text-black p-4">
      <!-- Header -->
      <div class="mb-4">
        <div v-if="managingLocalServer" class="flex">
          <div class="grow">
            <div class="flex items-center">
              <user-circle-icon class="w-8 mr-2" /> {{ nameOnRemote }}
            </div>
          </div>
          <div class="shrink">
            <button class="btn" @click="leave">
              <div class="flex items-center">
                <div><logout-icon class="w-6 mr-2" /></div>
                <div>Leave</div>
              </div>
            </button>
          </div>
        </div>
        <div v-else class="flex">
          <div class="grow flex items-center">
            <eye-icon class="w-8 mr-2" /> Anonymous observer.
          </div>
          <div class="shrink">
            <button class="btn" @click="manageLocalServer">Local Server</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <modal v-if="rejoinOpen" v-model:open="rejoinOpen" :type="'WARN'">
    <p class="w-full text-center">Oops! It looks like your local server lost connection.</p>
    <div class="divider py-4" />
    <search-for-local v-model:search-result="searchResult" v-model:name-on-remote="rejoinName" />
    <button v-if="showjoinBtn" class="btn btn-sm float-right" @click="rejoin">Rejoin</button>
  </modal>

  <modal v-if="joinOpen" v-model:open="joinOpen">
    <p class="w-full text-center">Searching for a local server.</p>
    <div class="divider py-4" />
    <search-for-local
      auto-search
      v-model:search-result="searchResult"
      v-model:name-on-remote="joinName"
    />
    <button v-if="showjoinBtn" class="btn btn-sm float-right" @click="join">Join</button>
  </modal>
</template>
