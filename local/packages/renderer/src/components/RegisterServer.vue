<script lang="ts" setup>
import type { Ref } from "vue";
import type { ClientRole } from "../../../../../shared/clients";

import { computed, ref } from "vue";
import { InformationCircleIcon } from "@heroicons/vue/outline";
import { ErrorMessage, Field, Form } from "vee-validate";
import * as yup from "yup";

const emit = defineEmits<{
  (e: "connect", remoteUrl: string): void;
  (e: "connectAndJoin", remoteUrl: string, name: string, role: ClientRole): void;
}>();

const join = ref(false);
// const remoteUrl = ref("");
// const nameOnRemote = ref("");
const role: Ref<ClientRole> = ref("SENDER");

const schema = computed(() =>
  yup.object({
    remoteUrl: yup.string().trim().required(),
    nameOnRemote: join.value ? yup.string().trim().required() : yup.string().optional(),
  })
);

// function handleClick() {
//   if (join.value) emit("connectAndJoin", remoteUrl.value, nameOnRemote.value, role.value);
//   else emit("connect", remoteUrl.value);
// }

const login = (args: any) => {
  const remoteUrl = args.remoteUrl as string;
  if (join.value) {
    const nameOnRemote = args.nameOnRemote as string;
    emit("connectAndJoin", remoteUrl, nameOnRemote, role.value);
  } else {
    emit("connect", remoteUrl);
  }
};
</script>

<template>
  <div class="modal modal-open">
    <div class="modal-box bg-yellow-300">
      <information-circle-icon class="btn btn-xs btn-circle float-right" />
      <h1 class="font-bold text-xl mb-6">Welcome to MocapStreamer</h1>

      <p class="mb-2">Please enter the URL for the remote server.</p>

      <div class="form-control">
        <Form class="w-full" :validation-schema="schema" @submit="login">
          <Field class="input input-bordered w-full mb-2" name="remoteUrl" placeholder="ws://" />
          <ErrorMessage class="block text-error text-sm" name="remoteUrl" />
          <!-- <input
            class="input input-bordered w-full mb-2"
            type="text"
            placeholder="ws://..."
            v-model="remoteUrl"
          /> -->

          <div class="divider mb-2">JOIN AS STREAMER</div>
          <label class="label cursor-pointer">
            <span>Join remote server and start streaming data?</span>
            <input class="checkbox" type="checkbox" v-model="join" />
          </label>

          <div v-if="join">
            <Field
              class="input input-bordered w-full mb-2"
              name="nameOnRemote"
              placeholder="name on remote"
            />
            <ErrorMessage class="block text-error text-sm" name="nameOnRemote" />
            <!-- <input
              class="input input-bordered w-full mb-2"
              type="text"
              placeholder="name on remote"
              v-model="nameOnRemote"
            /> -->

            <select class="select select-bordered w-full mb-2" v-model="role">
              <option value="SENDER">SENDER</option>
              <option value="RECEIVER">RECEIVER</option>
              <option value="BOTH">BOTH</option>
            </select>
          </div>

          <div class="modal-action">
            <button class="btn" type="submit">Connect<span v-if="join">&nbsp; & Join</span></button>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>
