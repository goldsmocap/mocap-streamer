<script lang="ts" setup>
import type { Option } from "fp-ts/Option";
import type { PropType } from "vue";
import type { SearchResult } from "./searchForLocal";

import { ref, onMounted, onUpdated } from "vue";
import { some } from "fp-ts/Option";
import { searchFail, searchSuccessNoName, searchSuccessHasName } from "./searchForLocal";

const props = defineProps({
  autoSearch: {
    type: Boolean,
    default: false,
  },
  nameOnRemote: {
    required: true,
    type: String,
  },
  searchResult: {
    required: true,
    type: Object as PropType<Option<SearchResult>>,
  },
});

const emit = defineEmits<{
  (e: "update:searchResult", result: Option<SearchResult>): void;
  (e: "update:nameOnRemote", nameOnRemote: string): void;
}>();

onMounted(() => {
  if (props.autoSearch) search();
});

// searching
const searching = ref(false);
function search() {
  searching.value = true;

  setTimeout(() => {
    fetch("http://localhost:4000/api/status")
      .then((res) => res.json())
      .then((body) => {
        switch (body.status) {
          case "CLOSED":
            emit("update:searchResult", some(searchSuccessNoName));
            emit("update:nameOnRemote", "");
            break;

          case "CONNECTING":
          case "CONNECTED":
            emit("update:searchResult", some(searchSuccessHasName(body.nameOnRemote)));
            emit("update:nameOnRemote", body.nameOnRemote);
            break;

          default:
            emit("update:searchResult", some(searchFail("")));
            emit("update:nameOnRemote", "");
            break;
        }
      })
      .catch((err) => {
        emit("update:searchResult", some(searchFail(err)));
        emit("update:nameOnRemote", "");
      })
      .finally(() => {
        searching.value = false;
      });
  }, 3000);
}

// name
const name = ref("");
</script>

<template>
  <div class="flex justify-center my-4">
    <span v-if="searching" class="text-sm animate-pulse">searching...</span>

    <button v-else-if="searchResult._tag === 'None'" class="btn btn-sm" @click="search">
      Search
    </button>

    <div v-else-if="searchResult._tag === 'Some'" class="w-full">
      <div v-if="searchResult.value._tag === 'SearchFail'" class="text-sm">
        <div class="flex flex-col items-center">
          <p class="text-sm py-4">No local streamer found.</p>
          <button class="btn btn-sm" @click="search">Search again</button>
        </div>
      </div>

      <div v-else-if="searchResult.value._tag === 'SearchSuccessHasName'" class="w-full">
        <p class="mb-2 text-sm">🎉 Local server found.</p>
        <p class="my-4 text-sm">
          💃 Name on remote: <span class="font-bold text-lg">{{ searchResult.value.name }}</span>
        </p>
      </div>

      <div v-else-if="searchResult.value._tag === 'SearchSuccessNoName'" class="w-full">
        <p class="mb-2 text-sm">🎉 Local server found.</p>
        <label for="name">Name:</label>
        <input
          class="input input-bordered w-full"
          type="text"
          id="name"
          placeholder="Name"
          v-model="name"
          @input="emit('update:nameOnRemote', name)"
        />
      </div>
    </div>
  </div>
</template>
