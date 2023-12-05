<script setup lang="ts">
import Peer from "peerjs";
import { computed, ref } from "vue";
import { store } from "../../store";
import { useRouter } from "vue-router";
import Modal from "../components/Modal.vue";
import { ErrorMessage, Field, Form } from "vee-validate";
import * as yup from "yup";

const router = useRouter();

const connecting = ref(false);
const connectError = ref<unknown>(null);

const schema = computed(() =>
  yup.object({
    clientName: yup
      .string()
      .trim()
      .required("You must provide a name for yourself"),
    roomName: yup.string().trim().required("You must provide a room name"),
    clientType: yup.string().oneOf(["Sender", "Receiver", "Both"]),
    host: yup.string().trim().required(),
    port: yup
      .number()
      .integer()
      .positive()
      .lessThan(2 ** 16),
  })
);

const connectToRoom = async (args: any) => {
  connecting.value = true;

  try {
    await fetch(
      `https://${args.host}:${args.port}/setup-room/${args.roomName}`,
      {
        method: "POST",
      }
    );
  } catch (err) {
    connectError.value = `Something went wrong setting up the room: ${err}`;
    connecting.value = false;
    return;
  }

  store.clientType = args.clientType;

  const peer = new Peer(args.clientName, {
    host: args.host,
    port: args.port,
    path: `/room/${args.roomName}`,
  });

  store.identity = peer;

  peer.on("open", () =>
    peer.listAllPeers((peers) => {
      connecting.value = false;
      connectError.value = null;

      store.connectedConfig = {
        dataConnections: peers.map((id) =>
          peer.connect(id, { reliable: false })
        ),
        roomName: args.roomName,
      };
      router.push("/dashboard");
    })
  );
  peer.on("error", (err) => {
    connecting.value = false;
    connectError.value = err.message;
  });
};
</script>

<template>
  <Modal :open="true">
    <h1 class="font-bold text-xl mb-6">Welcome to MocapStreamer</h1>

    <div class="form-control">
      <Form
        class="w-full flex flex-col gap-2"
        :validation-schema="schema"
        :initial-values="{
          clientType: 'Both',
          host: 'mocap-server.onrender.com',
          port: 443,
        }"
        @submit="connectToRoom"
      >
        <label>
          <span>Participant Name</span>
          <Field class="input input-bordered w-full mb-2" name="clientName" />
        </label>
        <ErrorMessage class="block text-error text-sm" name="clientName" />

        <label>
          <span>Room Name</span>
          <Field class="input input-bordered w-full mb-2" name="roomName" />
        </label>
        <ErrorMessage class="block text-error text-sm" name="roomName" />

        <label class="flex flex-row justify-between">
          <span class="h-fit self-center">Connect as a</span>

          <Field class="select w-fit" name="clientType" as="select">
            <option value="Both">Sender and Receiver</option>
            <option value="Sender">Sender only</option>
            <option value="Receiver">Receiver only</option>
          </Field>
        </label>
        <ErrorMessage class="block text-error text-sm" name="clientType" />

        <div
          tabindex="0"
          class="collapse collapse-arrow border border-slate-400"
        >
          <input type="checkbox" />
          <div class="collapse-title text-md font-medium">
            Connection Server Details
          </div>
          <div class="collapse-content">
            <label>
              <span>Host</span>
              <Field class="input input-bordered w-full mb-2" name="host" />
            </label>
            <ErrorMessage class="block text-error text-sm" name="host" />

            <label>
              <span>Port</span>
              <Field class="input input-bordered w-full mb-2" name="port" />
            </label>
            <ErrorMessage class="block text-error text-sm" name="port" />
          </div>
        </div>

        <span v-if="connectError != null" class="text-error">
          {{ connectError }}
        </span>
        <button
          type="submit"
          class="btn btn-block btn-primary my-4 col-span-2 disabled:bg-primary/50 disabled:text-inherit"
          :disabled="connecting"
        >
          <span v-if="connecting">
            Connecting
            <v-icon name="fa-spinner" animation="spin" />
          </span>
          <span v-else>Connect</span>
        </button>
      </Form>
    </div>
  </Modal>
</template>
