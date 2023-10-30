<script setup lang="ts">
import { Room } from "livekit-client";
import MainMenu from "./views/MainMenu.vue";
import Connected from "./views/Connected.vue";
import { ref } from "vue";

const connectedRoom = ref<Room | null>(null);

const handleConnect = (room: Room) => {
  connectedRoom.value = room;
};
</script>

<template>
  <MainMenu v-if="connectedRoom == null" @connect="handleConnect" />
  <Connected
    v-else
    :room="(connectedRoom as Room)"
    @disconnect="connectedRoom = null"
  />
</template>
