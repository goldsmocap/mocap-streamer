<script lang="ts" setup>
import { ref } from "vue";
import { InformationCircleIcon } from "@heroicons/vue/outline";

const emit = defineEmits<{ (e: "register", remoteUrl: string, name: string): void }>();

const remoteUrl = ref("");
const nameOnRemote = ref("");
</script>

<template>
  <div class="modal modal-open">
    <div class="modal-box">
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

        <input
          class="input input-bordered w-full mb-2"
          type="text"
          placeholder="name on remote"
          v-model="nameOnRemote"
        />
      </div>

      <div class="modal-action">
        <button class="btn" @click="emit('register', remoteUrl, nameOnRemote)">Join</button>
      </div>
    </div>
  </div>
</template>
