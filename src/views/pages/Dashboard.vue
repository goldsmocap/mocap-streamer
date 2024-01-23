<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { DataConnection } from "peerjs";
import { useRouter } from "vue-router";
import { store } from "../../store";
import Modal from "../components/Modal.vue";
import { ipcRenderer } from "electron";
import ConnectionDetailsForm, {
  ConnectionDetails,
} from "../components/ConnectionDetailsForm.vue";
import { bufferToBvh, bvhToOsc } from "../../../shared/conversion";

const router = useRouter();

interface LogMessage {
  type?: "info" | "error" | "warn";
  text: string;
}

interface ConnectionStatus {
  status: "connected" | "disconnected" | "no-response";
  lastReceived?: number | null;
  responseTimeoutId?: NodeJS.Timeout | null;
}

const remoteConnection = reactive<ConnectionStatus>({
  status: "disconnected",
  lastReceived: null,
  responseTimeoutId: null,
});

const localConnection = reactive<ConnectionStatus>({
  status: "disconnected",
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
      if (localConnection.status !== "disconnected") {
        ipcRenderer.invoke(
          "udpSendLocal",
          conn.peer,
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
    remoteConnection.status = "no-response";
  }, 10000);
}

function connectUdpRemote({ address, port }: ConnectionDetails) {
  ipcRenderer
    .invoke("udpConnectRemote", address, port)
    .then(() => {
      log.value.push({ type: "info", text: "Started sending data" });
      remoteConnection.status = "connected";
      remoteConnection.lastReceived = Date.now();
      remoteConnection.responseTimeoutId = noResponseTimeout();
    })
    .catch(console.error);
}

function connectUdpLocal({ address, port, useOsc }: ConnectionDetails) {
  ipcRenderer
    .invoke("udpConnectLocal", address, port, useOsc ?? false)
    .then(() => {
      log.value.push({ type: "info", text: "Started receiving data" });
      localConnection.status = "connected";
    });
}

ipcRenderer.on("udpDataReceived", (_evt, buffer: Buffer) => {
  if (remoteConnection.status !== "disconnected") {
    const oscData = bvhToOsc(bufferToBvh(buffer), {
      addressPrefix: store.identity?.id ?? "anonymous",
    });
    store.dataConnections?.forEach((conn) => conn?.send(oscData));
    if (localConnection.status !== "disconnected") {
      ipcRenderer.invoke("udpSendLocal", oscData);
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

const peerInterval = setInterval(() => {
  store.identity?.listAllPeers((peers: string[]) => {
    if (store.dataConnections != null) {
      for (const peer of peers.filter(
        (peer) =>
          store.dataConnections!.find((conn) => peer === conn.peer) == null
      )) {
        setUpConnection(store.identity!.connect(peer, { reliable: false }));
      }

      for (const conn of store.dataConnections.filter(
        (conn) => !peers.includes(conn.peer)
      )) {
        conn.close();
      }
    }
  });
}, 10000);

function disconnectSelf() {
  clearInterval(peerInterval);
  store.dataConnections?.forEach((conn) => conn.close());
  store.identity?.disconnect();
  store.dataConnections = undefined;
}

function disconnectAll() {
  if (store.clientType === "Sender" || store.clientType === "Both") {
    disconnectUdpRemote();
  }
  if (store.clientType === "Receiver" || store.clientType === "Both") {
    disconnectUdpLocal();
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
        <ConnectionDetailsForm
          v-if="remoteConnection.status === 'disconnected'"
          :initial="{ address: '127.0.0.1', port: 7004 }"
          submit-label="Start Sending"
          @submit="connectUdpRemote"
        />
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
        <ConnectionDetailsForm
          v-if="localConnection.status === 'disconnected'"
          :initial="{ address: '127.0.0.1', port: 7000 }"
          submit-label="Start Receiving"
          @submit="connectUdpLocal"
          :can-use-osc="true"
        />
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
