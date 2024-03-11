<script setup lang="ts">
import Peer from "peerjs";
import { computed, ref } from "vue";
import { connectionServerBaseUrl, store } from "../../store";
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
    https: yup.bool(),
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
    await fetch(`${connectionServerBaseUrl()}/setup-room/${args.roomName}`, {
      method: "POST",
    });
  } catch (err) {
    connectError.value = `Something went wrong setting up the room: ${err}`;
    connecting.value = false;
    return;
  }

  store.clientType = args.clientType;
  store.roomName = args.roomName;
  store.dataConnections = [];
  store.connectionServer.https = args.https;
  store.connectionServer.host = args.host;
  store.connectionServer.port = args.port;

  const response = await fetch("https://global.xirsys.net/_turn/MyFirstApp", {
    method: "PUT",
    body: { format: "urls" },
    headers: {
      Authorization: `Basic ${btoa()}`,
    },
  });

  const iceServers = await response.json();

  store.identity = new Peer(args.clientName, {
    host: args.host,
    port: args.port,
    path: `/room/${args.roomName}`,
    secure: args.https,
    config: {
      iceServers,
    },
    debug: 3,
  });

  store.identity?.on("open", () => {
    connecting.value = false;
    connectError.value = null;

    router.push("/dashboard");
  });
  store.identity?.on("error", (err) => {
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
          roomName: store.roomName ?? '',
          clientType: 'Both',
          https: store.connectionServer.https,
          host: store.connectionServer.host,
          port: store.connectionServer.port,
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
          <div class="collapse-content flex flex-col gap-4">
            <label class="flex flex-row gap-4">
              <Field
                name="https"
                type="checkbox"
                class="self-center w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                :value="true"
                :unchecked-value="false"
              />
              <span>Use https</span>
            </label>

            <label>
              <span>Host</span>
              <Field class="input input-bordered w-full my-2" name="host" />
            </label>
            <ErrorMessage class="block text-error text-sm" name="host" />

            <label>
              <span>Port</span>
              <Field class="input input-bordered w-full my-2" name="port" />
            </label>
            <ErrorMessage class="block text-error text-sm" name="port" />
          </div>
        </div>

        <span v-if="connectError != null" class="text-error">
          {{ connectError }}
        </span>
        <button
          type="submit"
          class="btn btn-block btn-primary mt-4 col-span-2 disabled:bg-primary/50 disabled:text-inherit"
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
