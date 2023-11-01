<script setup lang="ts">
import { ipcRenderer } from "electron";
import { Room } from "livekit-client";
import { computed, ref } from "vue";
import { store } from "../../store";
import { useRouter } from "vue-router";
import Modal from "../components/Modal.vue";
import { ErrorMessage, Field, Form } from "vee-validate";
import * as yup from "yup";

const router = useRouter();

const connecting = ref(false);
const connectError = ref();

const schema = computed(() =>
  yup.object({
    participantName: yup.string().trim().required(),
    roomName: yup.string().trim().required(),
  })
);

const roomConnect = async (args: any) => {
  connecting.value = true;
  store.participantName = args.participantName;
  store.roomName = args.roomName;

  const token = await ipcRenderer.invoke(
    "create-token",
    args.roomName,
    args.participantName
  );

  const room = new Room();

  await room
    .connect("ws://staging.mocapstreamer.com:7880", token)
    .then(() => {
      store.room = room;
      router.push("/dashboard");
    })
    .catch((err) => (connectError.value = err))
    .finally(() => (connecting.value = false));
};
</script>

<template>
  <Modal :open="true">
    <h1 class="font-bold text-xl mb-6">Welcome to MocapStreamer</h1>

    <div class="form-control">
      <Form
        class="w-full"
        :validation-schema="schema"
        :initial-values="store"
        @submit="roomConnect"
      >
        <label>
          <span>Participant Name</span>
          <Field
            class="input input-bordered w-full mb-2"
            name="participantName"
          />
        </label>
        <ErrorMessage class="block text-error text-sm" name="participantName" />
        <label>
          <span>Room Name</span>
          <Field class="input input-bordered w-full mb-2" name="roomName" />
        </label>
        <ErrorMessage class="block text-error text-sm" name="roomName" />

        <button
          type="submit"
          class="btn btn-block btn-primary my-4 col-span-2 disabled:bg-primary/50 disabled:text-inherit"
          :disabled="connecting"
        >
          <span v-if="connecting">
            Connecting
            <v-icon name="fa-spinner" animation="spin" />
          </span>
          <span v-else>Connect to Room</span>
        </button>
        <!-- <div class="divider mb-2">JOIN AS STREAMER</div>
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

        <div class="modal-action">
          <button class="btn" type="submit">
            Connect<span v-if="join">&nbsp; & Join</span>
          </button>
        </div> -->
      </Form>
    </div>
  </Modal>
</template>
