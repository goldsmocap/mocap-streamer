<script setup lang="ts">
import { ipcRenderer } from "electron";
import { Room } from "livekit-client";
import { ref } from "vue";

const emit = defineEmits<{ connect: [room: Room] }>();

const roomName = ref("");
const participantName = ref("");
const connecting = ref(false);
const connectError = ref();

const roomConnect = async () => {
  connecting.value = true;

  const token = await ipcRenderer.invoke(
    "create-token",
    roomName.value,
    participantName.value
  );

  const room = new Room();

  await room
    .connect("ws://staging.mocapstreamer.com:7880", token)
    .then(() => emit("connect", room))
    .catch((err) => (connectError.value = err))
    .finally(() => (connecting.value = false));
};
</script>
<template>
  <div class="grid grid-rows-3 grid-cols-2 justify-center items-center p-8">
    <label>Room Name:</label>
    <input class="input input-bordered w-full my-2" v-model="roomName" />
    <label class="col">Participant Name:</label>
    <input class="input input-bordered w-full my-2" v-model="participantName" />
    <div
      v-if="connectError != null"
      class="flex justify-center col-span-2 text-error"
    >
      <pre v-text="JSON.stringify(connectError)" />
    </div>
    <button
      class="btn btn-block btn-primary my-4 col-span-2 disabled:bg-primary/50 disabled:text-inherit"
      :disabled="connecting"
      @click="roomConnect"
    >
      <span v-if="connecting">
        Connecting
        <font-awesome-icon
          class="fill-inherit"
          :icon="['fas', 'spinner']"
          spin
        />
      </span>
      <span v-else>Connect to Room</span>
    </button>
  </div>
</template>
