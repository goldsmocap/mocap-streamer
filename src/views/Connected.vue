<script setup lang="ts">
import { Room, RoomEvent } from "livekit-client";
import { ref } from "vue";
import Modal from "./components/Modal.vue";

const { room } = defineProps<{ room: Room }>();
const emit = defineEmits<{ disconnect: [] }>();

room.on(RoomEvent.DataReceived, (payload, participant, kind, topic) => {
  console.log("data received!");
});
room.on(RoomEvent.ParticipantConnected, (participant) => {
  console.log("Connecting", participant.identity);
  room.participants.set(participant.sid, participant);
});
room.on(RoomEvent.ParticipantDisconnected, (participant) => {
  console.log("Disconnecting", participant.identity);
  room.participants.delete(participant.sid);
});

const isReconnecting = ref(false);
const isOpen = ref(false);

room.on(RoomEvent.Reconnecting, () => {
  console.log("Reconnecting");
  isReconnecting.value = isOpen.value = true;
});
room.on(RoomEvent.Reconnected, () => {
  console.log("Reconnected");
  isReconnecting.value = false;
});

room.on(RoomEvent.Disconnected, () => {
  emit("disconnect");
});
</script>
<template>
  <nav
    class="h-12 px-4 bg-slate-600 flex flex-row flex-wrap content-center justify-between"
  >
    <div class="flex flex-row gap-2 text-white/50">
      <button
        class="bg-slate-500/75 hover:bg-slate-500 aspect-square rounded px-1.5 py-0.5"
        @click="room.disconnect"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
      </button>
      <h1 class="text-lg" v-text="room.name" />
    </div>
    <h2>
      Connected as
      <span
        class="border-b border-slate-400"
        v-text="room.localParticipant.identity"
      />
    </h2>
  </nav>
  <div class="flex flex-row flex-nowrap">
    <canvas class="grow aspect-video" />
    <div class="shrink bg-slate-700/70 border-2 border-slate-400 px-4">
      <h3 class="py-2 border-b border-inherit">Connected Participants</h3>
      <ul>
        <li v-for="[_sid, participant] in room.participants">
          {{ participant.identity }}
        </li>
      </ul>
    </div>
  </div>
  <Modal :is-open="isOpen" @on-close="isOpen = false">
    <template #header>
      <h1 class="ml-2 py-1 text-lg text-error">Connection Error</h1>
    </template>
    <template #body>
      <div class="flex flex-col flex-wrap ml-2 my-3 w-56">
        <span>Connection dropped.</span>
        <span v-if="isReconnecting" class="w-fit">
          Reconnecting
          <font-awesome-icon
            class="fill-inherit"
            :icon="['fas', 'spinner']"
            spin
          />
        </span>
        <span v-else>Reconnected!</span>
      </div>
    </template>
    <template #footer>
      <div class="flex flex-row justify-between">
        <button class="bg-slate-500 rounded m-2 px-2" @click="room.disconnect">
          Disconnect
        </button>
        <button
          v-if="!isReconnecting"
          class="btn-primary rounded m-2 px-2"
          @click="isOpen = false"
        >
          Dismiss
        </button>
      </div>
    </template>
  </Modal>
</template>
