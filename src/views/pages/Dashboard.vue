<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { DataConnection } from "peerjs";
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

const participants = ref<DataConnection[]>([]);

interface Connection {
  status: "connected" | "disconnected" | "no-response";
  lastReceived?: number | null;
  responseTimeoutId?: NodeJS.Timeout | null;
}

const remoteConnection = reactive<Connection>({
  status: "disconnected",
  lastReceived: null,
  responseTimeoutId: null,
});

const localConnection = reactive<Connection>({
  status: "disconnected",
});

function setUpConnection(conn: DataConnection, emitLog: boolean = true) {
  const setUpListeners = (conn: DataConnection) => {
    console.log(conn);
    if (emitLog) {
      log.value.push({ type: "info", text: `${conn.peer} has connected.` });
    }
    participants.value.push(conn);
    conn.on("close", () => {
      if (emitLog) {
        log.value.push({
          type: "info",
          text: `${conn.peer} has disconnected.`,
        });
      }
      participants.value = participants.value.filter(
        (other) => conn.connectionId !== other.connectionId
      );
    });

    conn.on("data", (data) => {
      if (localConnection.status !== "disconnected") {
        const msg = Buffer.from(
          data as ArrayBuffer,
          0,
          (data as ArrayBuffer).byteLength
        );
        ipcRenderer.invoke("udpSendLocal", msg);
      }
    });
  };
  if (conn.open) {
    setUpListeners(conn);
  } else {
    conn.on("open", () => setUpListeners(conn));
  }
}

if (store.dataConn != null) {
  setUpConnection(store.dataConn as DataConnection, false);
}

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

function noResponseTimeout() {
  return setTimeout(() => {
    remoteConnection.status = "no-response";
  }, 10000);
}

function connectUdpRemote(args: any) {
  ipcRenderer
    .invoke("udpConnectRemote", args.address, args.port)
    .then(() => {
      log.value.push({ type: "info", text: "Started sending data" });
      remoteConnection.status = "connected";
      remoteConnection.lastReceived = Date.now();
      remoteConnection.responseTimeoutId = noResponseTimeout();
    })
    .catch(console.error);
}

function connectUdpLocal(args: any) {
  console.log("Local Args", args);
  ipcRenderer.invoke("udpConnectLocal", args.address, args.port).then(() => {
    log.value.push({ type: "info", text: "Started receiving data" });
    localConnection.status = "connected";
  });
}

ipcRenderer.on("udpDataReceived", (_evt, buffer: Buffer) => {
  if (remoteConnection.status !== "disconnected") {
    participants.value.forEach((conn) => conn?.send(buffer));
    if (localConnection.status !== "disconnected") {
      ipcRenderer.invoke("udpSendLocal", buffer);
    }
    remoteConnection.lastReceived = Date.now();
    if (remoteConnection.responseTimeoutId != null) {
      clearTimeout(remoteConnection.responseTimeoutId);
    }
    remoteConnection.responseTimeoutId = noResponseTimeout();
  }
});

function disconnectUdpRemote() {
  if (remoteConnection.status !== "disconnected") {
    remoteConnection.status = "disconnected";
    ipcRenderer.invoke("udpDisconnectRemote").then(() => {
      if (remoteConnection.responseTimeoutId != null) {
        clearTimeout(remoteConnection.responseTimeoutId);
      }
      remoteConnection.lastReceived = null;
      remoteConnection.responseTimeoutId = null;
      log.value.push({ type: "info", text: "Stopped sending data" });
    });
  }
}

function disconnectUdpLocal() {
  if (localConnection.status !== "disconnected") {
    localConnection.status = "disconnected";
    ipcRenderer
      .invoke("udpDisconnectLocal")
      .then(() =>
        log.value.push({ type: "info", text: "Stopped receiving data" })
      );
  }
}

function disconnectPeers() {
  store.dataConn?.close();
  store.dataConn = undefined;
  // participants.value.forEach((conn) => conn.close());
}

function disconnectAll() {
  if (store.clientType === "Sender" || store.clientType === "Both") {
    disconnectUdpRemote();
  }
  if (store.clientType === "Receiver" || store.clientType === "Both") {
    disconnectUdpLocal();
  }
  disconnectPeers();
}

watch(
  () => store.dataConn,
  (room) => {
    if (room == null) {
      router.push("/");
    }
  }
);

store.identity?.on("connection", setUpConnection);
</script>

<template>
  <Modal :open="true">
    <nav
      class="h-12 mb-10 flex flex-row flex-wrap content-center justify-between"
    >
      <div class="flex flex-row gap-2 text-white/50">
        <button
          class="bg-slate-500/75 hover:bg-slate-500 aspect-square rounded px-1.5 py-0.5"
          @click="disconnectAll"
        >
          <v-icon name="hi-arrow-left" />
        </button>
      </div>
      <h2>
        Connected as
        <span class="border-b border-slate-400" v-text="store.identity?.id" />
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
          <li v-for="participant in participants" :key="participant.peer">
            {{ participant.peer }}
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
    <div :class="store.clientType === 'Both' ? 'grid grid-cols-2 gap-2' : ''">
      <div v-if="store.clientType === 'Sender' || store.clientType === 'Both'">
        <Form
          v-if="remoteConnection.status === 'disconnected'"
          class="w-full flex flex-col gap-2"
          :validation-schema="connectionSchema"
          :initial-values="{ address: '127.0.0.1', port: 7004 }"
          @submit="connectUdpRemote"
        >
          <button type="submit" class="btn btn-block btn-primary my-4">
            Start Sending
          </button>
          <div
            tabindex="0"
            class="collapse collapse-arrow border border-slate-400"
          >
            <input type="checkbox" />
            <div class="collapse-title text-md font-medium">
              Connection Details
            </div>
            <div class="collapse-content">
              <label>
                <span>Address</span>
                <Field
                  class="input input-bordered w-full mb-2"
                  name="address"
                />
              </label>
              <ErrorMessage class="block text-error text-sm" name="address" />

              <label>
                <span>Port</span>
                <Field class="input input-bordered w-full mb-2" name="port" />
              </label>
              <ErrorMessage class="block text-error text-sm" name="port" />
            </div>
          </div>
        </Form>
        <div v-else>
          <button
            class="btn btn-block btn-primary my-4"
            @click="disconnectUdpRemote"
          >
            Stop Sending
          </button>
          <span v-if="remoteConnection.status === 'connected'">Connected</span>
          <span v-else>No response</span>
        </div>
      </div>
      <div
        v-if="store.clientType === 'Receiver' || store.clientType === 'Both'"
      >
        <Form
          v-if="localConnection.status === 'disconnected'"
          class="w-full flex flex-col gap-2"
          :validation-schema="connectionSchema"
          :initial-values="{ address: '127.0.0.1', port: 7000 }"
          @submit="connectUdpLocal"
        >
          <button class="btn btn-block btn-primary my-4">
            Start Receiving
          </button>
          <div
            tabindex="0"
            class="collapse collapse-arrow border border-slate-400"
          >
            <input type="checkbox" />
            <div class="collapse-title text-md font-medium">
              Connection Details
            </div>
            <div class="collapse-content">
              <label>
                <span>Address</span>
                <Field
                  class="input input-bordered w-full mb-2"
                  name="address"
                />
              </label>
              <ErrorMessage class="block text-error text-sm" name="address" />

              <label>
                <span>Port</span>
                <Field class="input input-bordered w-full mb-2" name="port" />
              </label>
              <ErrorMessage class="block text-error text-sm" name="port" />
            </div>
          </div>
        </Form>
        <div v-else>
          <button
            class="btn btn-block btn-primary my-4"
            @click="disconnectUdpLocal"
          >
            Stop Receiving
          </button>
          <span>Connected</span>
        </div>
      </div>
    </div>
  </Modal>
</template>
