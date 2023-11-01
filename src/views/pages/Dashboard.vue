<script setup lang="ts">
import { RoomEvent } from "livekit-client";
import { reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { store } from "../../store";
import Modal from "../components/Modal.vue";

const router = useRouter();

interface LogMessage {
  type?: "info" | "error" | "warn";
  text: string;
}

const log: Array<LogMessage> = [];

watch(
  () => store.room,
  (room) => {
    if (room == null) {
      router.push("/");
    }
  }
);

store.room?.on(RoomEvent.DataReceived, (payload, participant, kind, topic) => {
  console.log("data received!");
});
store.room?.on(RoomEvent.ParticipantConnected, (participant) => {
  console.log("Connecting", participant.identity);
  // store.room?.participants.set(participant.sid, participant);
});
store.room?.on(RoomEvent.ParticipantDisconnected, (participant) => {
  console.log("Disconnecting", participant.identity);
  // store.room?.participants.delete(participant.sid);
});

const participants = reactive([...(store.room?.participants.entries() ?? [])]);

watch(() => participants, console.log);

store.room?.on(RoomEvent.Reconnecting, () => {
  log.push({ type: "error", text: "Connection dropped. Reconnecting …" });
});
store.room?.on(RoomEvent.Reconnected, () => {
  log.push({ type: "info", text: "Reconnected" });
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
          @click="store.room?.disconnect"
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
    <div class="flex flex-row flex-nowrap justify-between">
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
          <li v-for="[sid, participant] in participants" :key="sid">
            {{ participant.identity }}
          </li>
        </ul>
      </div>
    </div>
  </Modal>
</template>
