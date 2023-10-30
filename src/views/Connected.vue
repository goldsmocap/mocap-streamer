<script setup lang="ts">
import { Room, RoomEvent } from "livekit-client";

const emit = defineEmits<{ disconnect: [] }>();

const { room } = defineProps<{ room: Room }>();
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

const handleDisconnect = () => {
  room.disconnect();
  emit("disconnect");
};
</script>
<template>
  <nav
    class="h-12 px-4 bg-slate-600 flex flex-row flex-wrap content-center justify-between"
  >
    <div class="flex flex-row gap-2 text-white/50">
      <button
        class="bg-slate-500/75 hover:bg-slate-500 aspect-square rounded px-1.5 py-0.5"
        @click="handleDisconnect"
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
</template>
