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
    destinationId: yup.string().trim(),
    clientType: yup.string().oneOf(["Sender", "Receiver", "Both"]),
  })
);

const connectToDestination = async (args: any) => {
  connecting.value = true;

  store.clientType = args.clientType;

  store.identity = new Peer();
  store.identity.on("open", (id) => {
    connecting.value = false;
    connectError.value = null;
    store.dataConn = store.identity?.connect(args.destinationId, {
      reliable: false,
      metadata: { clientType: store.clientType },
    });
    router.push("/dashboard");
  });
  store.identity.on("error", (err) => {
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
        :initial-values="{ clientType: 'Both' }"
        @submit="connectToDestination"
      >
        <label>
          <span>Destination ID</span>
          <Field
            class="input input-bordered w-full mb-2"
            name="destinationId"
          />
        </label>
        <ErrorMessage class="block text-error text-sm" name="destinationId" />

        <label class="flex flex-row justify-between">
          <span class="h-fit self-center">Connect as a</span>

          <Field class="select w-fit" name="clientType" as="select">
            <option value="Both">Sender and Receiver</option>
            <option value="Sender">Sender only</option>
            <option value="Receiver">Receiver only</option>
          </Field>
        </label>
        <ErrorMessage class="block text-error text-sm" name="clientType" />

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
