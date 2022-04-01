<script lang="ts" setup>
import type { Ref } from "vue";
import type { Option } from "fp-ts/Option";
import type { SearchResult } from "./searchForLocal";

import { ref } from "vue";
import { InformationCircleIcon } from "@heroicons/vue/outline";
import { none } from "fp-ts/Option";
import { match, P } from "ts-pattern";
import SearchForLocal from "./SearchForLocal.vue";

const emit = defineEmits<{
  (e: "register", remoteUrl: string): void;
  (e: "registerAndJoin", remoteUrl: string, nameOnRemote: string): void;
  (e: "registerAndTakeover", remoteUrl: string, nameOnRemote: string): void;
}>();

const remoteUrl = ref("");
const nameOnRemote = ref("");
const searchResult: Ref<Option<SearchResult>> = ref(none);

function register() {
  match(searchResult.value)
    .with({ _tag: "None" }, () => emit("register", remoteUrl.value))
    .with({ _tag: "Some", value: { _tag: "SearchFail" } }, () => emit("register", remoteUrl.value))
    .with({ _tag: "Some", value: { _tag: "SearchSuccessNoName" } }, () => {
      emit("registerAndJoin", remoteUrl.value, nameOnRemote.value);
    })
    .with({ _tag: "Some", value: { _tag: "SearchSuccessHasName", name: P.select() } }, (name) => {
      emit("registerAndTakeover", remoteUrl.value, name);
    })
    .run();
}
</script>

<template>
  <div class="modal modal-open">
    <div class="modal-box">
      <!-- <div v-if="err" class="flex flex-col items-center text-error">
        <exclamation-circle-icon class="w-24" />
        <p class="my-8">{{ err.msg }}</p>
        <button v-if="err.showButton" class="btn" @click="emit('update:err', undefined)">Ok</button>
      </div>
      <div v-else> -->
      <information-circle-icon class="btn btn-xs btn-circle float-right" />
      <h1 class="font-bold text-xl mb-6">Welcome to MocapStreamer</h1>

      <p class="mb-2">Please enter the URL for the remote server.</p>

      <div class="form-control">
        <input
          class="input input-bordered w-full mb-2"
          type="text"
          placeholder="ws://..."
          v-model="remoteUrl"
        />
      </div>

      <div class="divider">LOCAL SERVER</div>

      <search-for-local
        auto-search
        v-model:name-on-remote="nameOnRemote"
        v-model:search-result="searchResult"
      />

      <div class="modal-action">
        <button class="btn" @click="register">Join</button>
      </div>
    </div>
  </div>
</template>
