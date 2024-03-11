<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { DataConnection } from "peerjs";
import { useRouter } from "vue-router";
import { connectionServerBaseUrl, store } from "../../store";
import Modal from "../components/Modal.vue";
import { ipcRenderer } from "electron";
import ConsumerConnectionDetailsForm, {
  ConsumerConnectionDetails,
} from "../components/ConsumerConnectionDetailsForm.vue";
import ProducerConnectionDetailsForm, {
  ProducerConnectionDetails,
} from "../components/ProducerConnectionDetailsForm.vue";
import { bufferToBvh, bvhToOsc } from "../../conversion";

const router = useRouter();

interface LogMessage {
  type?: "info" | "error" | "warn";
  text: string;
}

interface ConnectionStatus<I> {
  status: "connected" | "disconnected" | "no-response";
  lastReceived?: number | null;
  responseTimeoutId?: NodeJS.Timeout | null;
  initial: I;
}

const producerConnection = reactive<
  ConnectionStatus<ProducerConnectionDetails>
>({
  status: "disconnected",
  lastReceived: null,
  responseTimeoutId: null,
  // initial: { address: "127.0.0.1", port: 801, type: "Vicon" },
  initial: { address: "127.0.0.1", port: 7004, type: "AxisStudio" },
});

const consumerConnection = reactive<
  ConnectionStatus<ConsumerConnectionDetails>
>({
  status: "disconnected",
  initial: { address: "127.0.0.1", port: 7000, useOsc: true },
});

function setUpConnection(conn: DataConnection, alreadyAdded: boolean = false) {
  const setUpListeners = (conn: DataConnection) => {
    console.log(conn);
    if (!alreadyAdded && store.dataConnections != null) {
      store.dataConnections.push(conn);
      log.value.push({ type: "info", text: `${conn.peer} has connected.` });
    }
    conn.on("close", () => {
      if (!alreadyAdded && store.dataConnections != null) {
        log.value.push({
          type: "info",
          text: `${conn.peer} has disconnected.`,
        });
        store.dataConnections = store.dataConnections.filter(
          (other) => other.peer !== conn.peer
        );
      }
    });

    conn.on("data", (oscBuffer): void => {
      if (consumerConnection.status !== "disconnected") {
        ipcRenderer.invoke(
          "sendConsumer",
          new Uint8Array(oscBuffer as ArrayBuffer)
        );
      }
    });
  };
  if (conn.open) {
    setUpListeners(conn);
  } else {
    conn.on("open", () => setUpListeners(conn));
  }
}

store.dataConnections?.forEach((connection) =>
  setUpConnection(connection as DataConnection, true)
);

const log = ref<LogMessage[]>([]);

function noResponseTimeout() {
  return setTimeout(() => {
    producerConnection.status = "no-response";
  }, 10000);
}

function connectProducer(details: ProducerConnectionDetails) {
  const { type, address, port } = (producerConnection.initial = details);
  ipcRenderer
    .invoke("connectProducer", type, address, port)
    .then(() => {
      log.value.push({ type: "info", text: "Started sending data" });
      producerConnection.status = "connected";
      producerConnection.lastReceived = Date.now();
      producerConnection.responseTimeoutId = noResponseTimeout();
    })
    .catch(console.error);
}

function connectConsumer(details: ConsumerConnectionDetails) {
  const { address, port, useOsc } = (consumerConnection.initial = details);
  ipcRenderer.invoke("connectConsumer", address, port, useOsc).then(() => {
    log.value.push({ type: "info", text: "Started receiving data" });
    consumerConnection.status = "connected";
  });
}

ipcRenderer.on("producerDataReceived", (_evt, buffer: Buffer) => {
  if (producerConnection.status !== "disconnected") {
    const oscData = bvhToOsc(bufferToBvh(buffer), {
      addressPrefix: store.identity?.id ?? "anonymous",
    });
    store.dataConnections?.forEach((conn) => conn?.send(oscData));
    if (consumerConnection.status !== "disconnected") {
      ipcRenderer.invoke("sendConsumer", oscData);
    }
    producerConnection.lastReceived = Date.now();
    if (producerConnection.responseTimeoutId != null) {
      clearTimeout(producerConnection.responseTimeoutId);
    }
    producerConnection.responseTimeoutId = noResponseTimeout();
  }
});

function disconnectProducer() {
  if (producerConnection.status !== "disconnected") {
    producerConnection.status = "disconnected";
    ipcRenderer.invoke("disconnectProducer").then(() => {
      if (producerConnection.responseTimeoutId != null) {
        clearTimeout(producerConnection.responseTimeoutId);
      }
      producerConnection.lastReceived = null;
      producerConnection.responseTimeoutId = null;
      log.value.push({ type: "info", text: "Stopped sending data" });
    });
  }
}

function disconnectConsumer() {
  if (consumerConnection.status !== "disconnected") {
    consumerConnection.status = "disconnected";
    ipcRenderer
      .invoke("disconnectConsumer")
      .then(() =>
        log.value.push({ type: "info", text: "Stopped receiving data" })
      );
  }
}

function syncConnections() {
  fetch(`${connectionServerBaseUrl()}/room/connections/${store.roomName}`)
    .then((res) => res.json())
    .then((connections) => {
      if (store.dataConnections != null && Array.isArray(connections)) {
        for (const connection of connections.filter(
          (connection: string) =>
            store.dataConnections!.find((conn) => connection === conn.peer) ==
            null
        )) {
          setUpConnection(
            store.identity!.connect(connection, { reliable: false })
          );
        }

        for (const conn of store.dataConnections.filter(
          (conn) => !connections.includes(conn.peer)
        )) {
          conn.close();
        }
      }
    });
}

let peerInterval: NodeJS.Timeout;

setTimeout(() => {
  syncConnections();
  peerInterval = setInterval(syncConnections, 10000);
}, 1000);

function disconnectSelf() {
  clearInterval(peerInterval);
  store.dataConnections?.forEach((conn) => conn.close());
  store.identity?.disconnect();
  store.dataConnections = undefined;
}

function disconnectAll() {
  if (store.clientType === "Sender" || store.clientType === "Both") {
    disconnectProducer();
  }
  if (store.clientType === "Receiver" || store.clientType === "Both") {
    disconnectConsumer();
  }
  disconnectSelf();
}

watch(
  () => store.dataConnections,
  (dataConnections) => {
    if (dataConnections == null) {
      router.push("/");
    }
  }
);

store.identity?.on("connection", setUpConnection);
</script>
<template>
  <Modal :open="true">
    <nav class="mb-8 flex flex-row flex-wrap content-center justify-between">
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
        To room
        <span class="border-b border-slate-400" v-text="store.roomName" />
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
          <li v-for="conn in store.dataConnections" :key="conn.peer">
            {{ conn.peer }}
          </li>
        </ul>
      </div>
    </div>
    <div :class="store.clientType === 'Both' ? 'grid grid-cols-2 gap-2' : ''">
      <div v-if="store.clientType === 'Sender' || store.clientType === 'Both'">
        <ProducerConnectionDetailsForm
          v-if="producerConnection.status === 'disconnected'"
          :initial="producerConnection.initial"
          @submit="connectProducer"
        />
        <div v-else>
          <button
            class="btn btn-block btn-primary my-4"
            @click="disconnectProducer"
          >
            Stop Sending
          </button>
          <span v-if="producerConnection.status === 'connected'"
            >Connected</span
          >
          <span v-else>No response</span>
        </div>
      </div>
      <div
        v-if="store.clientType === 'Receiver' || store.clientType === 'Both'"
      >
        <ConsumerConnectionDetailsForm
          v-if="consumerConnection.status === 'disconnected'"
          :initial="consumerConnection.initial"
          @submit="connectConsumer"
        />
        <div v-else>
          <button
            class="btn btn-block btn-primary my-4"
            @click="disconnectConsumer"
          >
            Stop Receiving
          </button>
          <span>Connected</span>
        </div>
      </div>
    </div>
  </Modal>
</template>
