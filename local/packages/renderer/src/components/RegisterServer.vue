<script lang="ts" setup>
import type { Ref } from "vue";
import type { ClientRole } from "../../../shared/clients";

import { ref } from "vue";
import { InformationCircleIcon } from "@heroicons/vue/outline";

const emit = defineEmits<{
  (e: "connect", remoteUrl: string): void;
  (e: "connectAndJoin", remoteUrl: string, name: string, role: ClientRole): void;
}>();

const join = ref(false);
const remoteUrl = ref("");
const nameOnRemote = ref("");
const role: Ref<ClientRole> = ref("SENDER");

function handleClick() {
  if (join.value) emit("connectAndJoin", remoteUrl.value, nameOnRemote.value, role.value);
  else emit("connect", remoteUrl.value);
}
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

        <div class="divider mb-2">JOIN AS STREAMER</div>
        <label class="label cursor-pointer">
          <span>Join remote server and start streaming data?</span>
          <input class="checkbox" type="checkbox" v-model="join" />
        </label>

        <div v-if="join">
          <input
            class="input input-bordered w-full mb-2"
            type="text"
            placeholder="name on remote"
            v-model="nameOnRemote"
          />

          <select class="select select-bordered w-full mb-2" v-model="role">
            <option value="SENDER">SENDER</option>
            <option value="RECEIVER">RECEIVER</option>
            <option value="BOTH">BOTH</option>
          </select>
        </div>
      </div>

      <div class="modal-action">
        <button class="btn" @click="handleClick">
          Connect<span v-if="join">&nbsp; & Join</span>
        </button>
      </div>
    </div>
  </div>
</template>
