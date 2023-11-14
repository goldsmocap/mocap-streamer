<script setup lang="ts">
import Peer from "peerjs";
import { computed, ref } from "vue";
import { store } from "../../store";
import { useRouter } from "vue-router";
import Modal from "../components/Modal.vue";
import { ErrorMessage, Field, Form } from "vee-validate";
import * as yup from "yup";

const router = useRouter();

const connecting = ref(true);
const connectError = ref<unknown>(null);

const schema = computed(() =>
  yup.object({
    destinationId: yup.string().trim(),
  })
);
const myId = ref<string | null>(null);
store.identity = new Peer();
store.identity.on("open", (id) => {
  connecting.value = false;
  connectError.value = null;
  myId.value = id;
});
store.identity.on("error", (err) => (connectError.value = err.message));

const connectToDestination = async (args: any) => {
  // connecting.value = true;
  store.dataConn = store.identity?.connect(args.destinationId, {
    reliable: false,
  });

  router.push("/dashboard");
};
</script>

<template>
  <Modal :open="true">
    <h1 class="font-bold text-xl mb-6">Welcome to MocapStreamer</h1>

    <div class="mb-4 flex flex-row gap-6">
      <label>My ID</label>
      <span class="input input-bordered px-2 h-fit">
        {{ myId }}
      </span>
    </div>
    <div class="form-control">
      <Form
        class="w-full"
        :validation-schema="schema"
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
