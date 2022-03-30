<script setup lang="ts">
import { ref, watch, type Ref } from "vue";
import { useFetch, watchDebounced, useWebSocket } from "@vueuse/core";
import { useHead } from "@vueuse/head";
import type { WsMessage } from "shared";
import type { WsClose, WsSend } from "./types";
import {
  connectError,
  searchFail,
  searching,
  searchSuccessNoName,
  searchSuccessHasName,
  type ConnectError,
  type Search,
} from "./components/connect";
import { user } from "./components/dashboard";
import Connect from "./components/Connect.vue";
import Dashboard from "./components/Dashboard.vue";
import { match, P } from "ts-pattern";

let remoteSend: WsSend | undefined = undefined;
let remoteClose: WsClose | undefined = undefined;
let remoteBaseUrl: string | undefined = undefined;
let remoteName: string | undefined = undefined;

useHead({
  title: "MocapStreamer",
});

const search: Ref<Search> = ref(searching);

const connectOpen = ref(true);
const connectErr: Ref<ConnectError | undefined> = ref(undefined);

const joinRemote = (remoteUrl: string) => {
  const { status, data, send, close } = useWebSocket(remoteUrl, {
    autoReconnect: {
      retries: 3,
      onFailed: () => {
        connectErr.value = connectError("Oops! Unable to connect.", true);
        remoteClose = undefined;
        remoteSend = undefined;
        stopWatchingData();
        stopWatchingStatus();
      },
    },
  });

  remoteSend = send;
  remoteClose = close;

  remoteSend(JSON.stringify({ type: "register_ui" }));

  const stopWatchingData = watch(data, (data) => {
    const msg: WsMessage = JSON.parse(data);
    switch (msg.type) {
      case "remote_state":
        console.log(msg.payload);
        break;
    }
  });
  const stopWatchingStatus = watch(status, (status) => {
    switch (status) {
      case "OPEN":
        connectOpen.value = false;
        break;
    }
  });
};

const { error, data } = useFetch<string>("http://localhost:4000/api/ping");
watchDebounced(error, (err) => (search.value = searchFail(err)), { debounce: 3000 });
watchDebounced(
  data,
  (name) => {
    if (name) search.value = searchSuccessHasName(name);
    else search.value = searchSuccessNoName;
  },
  { debounce: 3000 }
);

function join(url: string, name: string) {
  remoteBaseUrl = url.replace("ws://", "");
  remoteName = name;

  joinRemote(`ws://${remoteBaseUrl}`);

  // if the local server has a name then ask remote to rename it
  match(search.value)
    .with({ _tag: "SearchSuccessHasName", name: P.select() }, (oldName) => {
      fetch(`http://${remoteBaseUrl}/api/rename/${oldName}`, { method: "PUT", body: name });
    })
    .with({ _tag: "SearchSuccessNoName" }, () => {
      fetch(`http://localhost:4000/api/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, name }),
      });
    })
    .otherwise(() => (connectErr.value = connectError("Oops! Something went wrong.", true)));
}

function joinAsObserver(url: string) {
  joinRemote(url);
}

function leave() {
  console.log("What the hell?");
  fetch(`http://${remoteBaseUrl}/api/leave/${remoteName}`).then(() => {
    if (remoteClose) remoteClose();
    connectOpen.value = true;
    remoteName = undefined;
  });
}
</script>

<template>
  <router-view></router-view>
  <!-- <connect
    :open="connectOpen"
    :search="search"
    v-model:err="connectErr"
    @join="join"
    @join-as-observer="joinAsObserver"
  />
  <dashboard :open="!connectOpen" :connected-as="user('Oliver')" @leave="leave" /> -->
</template>

<style>
@import "./assets/custom.css";
</style>
