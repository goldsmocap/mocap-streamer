<script setup lang="ts">
import { ref } from "vue";
import { ipcRenderer } from "electron";
import {
  Participant,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  LocalTrackPublication,
  LocalParticipant,
  createLocalTracks,
  DataPacket_Kind,
} from "livekit-client";

const roomName = ref("");
const participantName = ref("");

const roomConnect = async () => {
  console.log(roomName.value);
  console.log(participantName.value);

  const token = await ipcRenderer.invoke(
    "create-token",
    roomName.value,
    participantName.value
  );
  console.log(token);

  // creates a new room with options
  const room = new Room();

  // set up event listeners
  room.on(RoomEvent.DataReceived, (payload, participant, kind, topic) => {
    console.log("data received!");
  });

  // connect
  await room
    .connect("ws://staging.mocapstreamer.com:7880", token)
    .catch((err) => {
      console.log("Shit");
      console.error(err);
    });

  const arr = new Uint8Array([0, 1, 2, 3, 4]);
  room.localParticipant.publishData(arr, DataPacket_Kind.LOSSY, {
    topic: "dancer",
  });
};
</script>

<template>
  <div class="grid grid-rows-3 grid-cols-2 justify-center items-center p-8">
    <label>Room Name:</label>
    <input class="input input-bordered w-full my-2" v-model="roomName" />
    <label class="col">Participant Name:</label>
    <input class="input input-bordered w-full my-2" v-model="participantName" />
    <button
      class="btn btn-block btn-primary my-4 col-span-2"
      @click="roomConnect"
    >
      Connect to Room
    </button>
  </div>
</template>

<style></style>
