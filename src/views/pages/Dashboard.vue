<script setup lang="ts">
import { DataPacket_Kind, RoomEvent } from "livekit-client";
import { computed, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { store } from "../../store";
import Modal from "../components/Modal.vue";
import { ErrorMessage, Field, Form } from "vee-validate";
import * as yup from "yup";
import { ipcRenderer } from "electron";

const router = useRouter();

interface LogMessage {
  type?: "info" | "error" | "warn";
  text: string;
}

const participants = ref([...(store.room?.participants.values() ?? [])]);

const log = ref<LogMessage[]>([]);

const connectionSchema = computed(() =>
  yup.object({
    address: yup.string().trim().required(),
    port: yup
      .number()
      .integer()
      .positive()
      .lessThan(2 ** 16),
  })
);
// const address = ref<string>()
const status = ref<"connected" | "disconnected" | "no-response">(
  "disconnected"
);
const lastReceivedTimestamp = ref<number | null>(null);
const noResponseTimeoutId = ref<NodeJS.Timeout | null>(null);
const packetCount = ref<number>(0);

// interface LocalConnectionState {
//   connection: { address: string; port: number };
//   status: "connected" | "disconnected" | "no-response";
//   lastReceivedTimestamp: number | null;
//   noResponseTimeout: NodeJS.Timeout | null;
//   packetCount: number;
// }
// const localConnectionState = reactive<LocalConnectionState>({
//   connection: { address: "127.0.0.1", port: 7004 },
//   status: "disconnected",
//   lastReceivedTimestamp: null,
//   noResponseTimeout: null,
//   packetCount: 0,
// });

function noResponseTimeout() {
  return setTimeout(() => {
    status.value = "no-response";
  }, 10000);
}

function connectUdp(args: any) {
  ipcRenderer
    // .invoke("udpConnect", args.address, args.port)
    .invoke("udpConnect", "127.0.0.1", 7004)
    .then(() => {
      log.value.push({ type: "info", text: "Connecting to Axis Studio" });
      status.value = "connected";
      lastReceivedTimestamp.value = Date.now();
      noResponseTimeoutId.value = noResponseTimeout();
    })
    .catch(console.error);
}

const message = Buffer.from("hello");

ipcRenderer.on("udpDataReceived", (_evt, buffer: Buffer) => {
  if (status.value !== "disconnected") {
    if (packetCount.value++ % 16 === 0) {
      // store.room?.localParticipant.publishData(message, DataPacket_Kind.LOSSY, {
      //   topic: "mocap-data",
      // })
      store.room?.localParticipant.publishData(buffer, DataPacket_Kind.LOSSY);
      // .then(() => {
      //   lastReceivedTimestamp.value = Date.now();
      //   if (noResponseTimeoutId.value != null) {
      //     clearTimeout(noResponseTimeoutId.value);
      //   }
      //   noResponseTimeoutId.value = noResponseTimeout();
      // })
      // .catch(console.error);
    }
  }
});

function disconnectUdp() {
  if (status.value !== "disconnected") {
    status.value = "disconnected";
    ipcRenderer.invoke("udpDisconnect").then(() => {
      if (noResponseTimeoutId.value != null) {
        clearTimeout(noResponseTimeoutId.value);
      }
      lastReceivedTimestamp.value = null;
      noResponseTimeoutId.value = null;
    });
  }
}

watch(() => participants, console.log);

watch(
  () => store.room,
  (room) => {
    if (room == null) {
      router.push("/");
    }
  }
);

store.room?.on(RoomEvent.DataReceived, (payload, participant, kind, topic) => {
  if (store.room?.localParticipant.sid !== participant?.sid) {
    console.log(
      "data received!",
      payload.length,
      topic,
      kind,
      participant?.sid,
      store.room?.localParticipant.sid
    );
  }
});
store.room?.on(RoomEvent.ParticipantConnected, (participant) => {
  log.value.push({
    type: "info",
    text: `${participant.identity} has connected.`,
  });
  participants.value = [...participants.value, participant];
  console.log(participant.identity);
});
store.room?.on(RoomEvent.ParticipantDisconnected, (participant) => {
  log.value.push({
    type: "info",
    text: `${participant.identity} has disconnected.`,
  });
  participants.value = participants.value.filter(
    ({ sid }) => sid !== participant.sid
  );
});

store.room?.on(RoomEvent.Reconnecting, () => {
  log.value.push({ type: "error", text: "Connection dropped. Reconnecting …" });
});
store.room?.on(RoomEvent.Reconnected, () => {
  log.value.push({ type: "info", text: "Reconnected" });
});

store.room?.on(RoomEvent.Disconnected, () => {
  store.room = null;
  router.push("/");
});
</script>

<template>
  <Modal :open="true">
    <nav
      class="h-12 mb-10 flex flex-row flex-wrap content-center justify-between"
    >
      <div class="flex flex-row gap-2 text-white/50">
        <button
          class="bg-slate-500/75 hover:bg-slate-500 aspect-square rounded px-1.5 py-0.5"
          @click="
            () => {
              disconnectUdp();
              store.room?.disconnect();
            }
          "
        >
          <v-icon name="hi-arrow-left" />
        </button>
        <h1 class="text-lg" v-text="store.room?.name" />
      </div>
      <h2>
        Connected as
        <span
          class="border-b border-slate-400"
          v-text="store.room?.localParticipant.identity"
        />
      </h2>
    </nav>
    <div class="flex flex-row flex-nowrap justify-between mb-8">
      <div class="h-44 w-full relative">
        <ul class="absolute bottom-0 left-0 right-0 max-h-44 overflow-y-auto">
          <li
            v-for="msg in log"
            :class="
              msg.type === 'info'
                ? 'text-info'
                : msg.type === 'error'
                ? 'text-error'
                : msg.type === 'warn'
                ? 'text-warning'
                : ''
            "
          >
            {{ msg.text }}
          </li>
        </ul>
      </div>
      <div class="border-l-2 border-slate-400 px-4 w-[70%]">
        <h3 class="py-2 border-b border-inherit">Connected Participants</h3>
        <ul>
          <li v-for="participant in participants" :key="participant.sid">
            {{ participant.identity }}
          </li>
        </ul>
      </div>
    </div>
    <!-- <Form
      v-if="localConnectionState.status === 'disconnected'"
      class="w-full"
      :validation-schema="connectionSchema"
      :initial-values="localConnectionState.connection"
      @submit="connectUdp"
    >
      <div class="collapse collapse-arrow border border-slate-400 rounded-md">
        <input type="checkbox" class="min-h-0" />
        <div class="collapse-title p-2 min-h-0">Advanced details</div>
        <div class="collapse-content flex flex-row gap-4">
          <label>
            <span>Address</span>
            <Field class="input input-bordered w-full mb-2" name="address" />
          </label>
          <ErrorMessage class="block text-error text-sm" name="address" />
          <label>
            <span>Port</span>
            <Field class="input input-bordered w-full mb-2" name="port" />
          </label>
          <ErrorMessage class="block text-error text-sm" name="port" />
        </div>
      </div>
      <button type="submit" class="btn btn-block btn-primary my-4">
        Connect Axis Studio
      </button>
    </Form> -->
    <button
      v-if="status === 'disconnected'"
      @click="connectUdp"
      class="btn btn-block btn-primary my-4"
    >
      Connect Axis Studio
    </button>
    <div v-else>
      <span v-if="status === 'connected'">Connected</span>
      <span v-else>No response</span>
      <button class="btn btn-block btn-primary my-4" @click="disconnectUdp">
        Disconnect
      </button>
    </div>
  </Modal>
</template>
