<script setup lang="ts">
import { match, P } from "ts-pattern";
import { computed, ref, watchEffect, type PropType } from "vue";
import { ExclamationCircleIcon, InformationCircleIcon } from "@heroicons/vue/outline";
import type { Search, ConnectError } from "./connect";

const props = defineProps({
  open: {
    required: true,
    type: Boolean,
  },
  search: {
    required: true,
    type: Object as PropType<Search>,
  },
  err: Object as PropType<ConnectError>,
});

const emit = defineEmits<{
  (e: "join-as-observer", url: string): void;
  (e: "join", url: string, name: string): void;
  (e: "update:err", err?: string): void;
}>();

const remoteUrl = ref(import.meta.env.DEV ? "ws://localhost:3000" : "");
const name = ref("");
watchEffect(() => {
  match<Search>(props.search)
    .with({ _tag: "SearchSuccessHasName", name: P.select() }, (initName) => (name.value = initName))
    .with({ _tag: "SearchSuccessNoName" }, () => (name.value = ""))
    .otherwise(() => undefined);
});
const ready = computed(() => {
  const notSearching = match(props.search)
    .with({ _tag: "Searching" }, () => false)
    .with({ _tag: P.union("SearchSuccessNoName", "SearchSuccessHasName") }, () =>
      name.value ? name.value.length > 0 : false
    )
    .otherwise(() => true);

  return remoteUrl.value.length > 5 && notSearching;
});
const connecting = ref(false);

watchEffect(() => {
  if (props.err || props.open) connecting.value = false;
});

function join() {
  connecting.value = true;
  if (name.value) {
    emit("join", remoteUrl.value, name.value);
  } else {
    emit("join-as-observer", remoteUrl.value);
  }
}
</script>

<template>
  <!-- Put this part before </body> tag -->
  <div class="modal" :class="{ 'modal-open': open }">
    <div class="modal-box">
      <div v-if="err" class="flex flex-col items-center text-error">
        <exclamation-circle-icon class="w-24" />
        <p class="my-8">{{ err.msg }}</p>
        <button v-if="err.showButton" class="btn" @click="emit('update:err', undefined)">Ok</button>
      </div>
      <div v-else>
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

          <div class="divider">LOCAL SERVER</div>

          <div class="flex justify-center my-4">
            <span v-if="search?._tag === 'Searching'" class="text-sm animate-pulse">
              searching...
            </span>

            <span v-else-if="search?._tag === 'SearchFail'" class="text-sm">
              No local streamer found.
            </span>

            <div v-else-if="search?._tag.startsWith('SearchSuccess')" class="w-full">
              <p class="mb-2 text-sm">🎉 Local server found</p>
              <p v-if="search?._tag === 'SearchSuccessHasName'" class="mb-4 text-sm">
                ⚡Local server already connected.
              </p>
              <label for="name">Name:</label>
              <input
                class="input input-bordered w-full"
                type="text"
                id="name"
                placeholder="Name"
                v-model="name"
              />
            </div>

            <span v-else class="text-sm">WAT!?!</span>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn" :class="{ 'btn-disabled': !ready }" @click="join">
            <span v-if="!connecting">Join!</span>
            <div v-else class="flex items-center">
              <div class="radial-progress animate-spin mr-2" style="--value: 70; --size: 1rem" />
              <span>Join!</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
