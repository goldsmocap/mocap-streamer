<script lang="ts" setup>
import { useRouter } from "vue-router";
import { registerUiWithRemote } from "../remote";
import { localJoin, nameOnRemote } from "../local";
import RegisterAndManage from "../components/RegisterAndManage.vue";

const router = useRouter();

function register(remoteUrl: string) {
  console.log("🎨 registering ui");
  registerUiWithRemote(remoteUrl, () => router.push("/"))
    .then(() => router.push("/dashboard"))
    .catch(() => console.error("💀 error registering ui"));
}

function registerAndJoin(remoteUrl: string, nameOnRemote: string) {
  console.log("🎨 registering ui and asking local server to join remote");
  registerUiWithRemote(remoteUrl, () => router.push("/"))
    .then(() => localJoin(remoteUrl, nameOnRemote))
    .then(() => router.push("/dashboard"))
    .catch((err) =>
      console.error("💀 error registering ui and/or asking local server to join remote", err)
    );
}

function registerAndTakeover(remoteUrl: string, name: string) {
  console.log("🎨 registering ui and takingover local server");
  registerUiWithRemote(remoteUrl, () => router.push("/"))
    .then(() => (nameOnRemote.value = name))
    .then(() => router.push("/dashboard"))
    .catch((err) => console.error("💀 error registering ui and/or takingover local server", err));
}

// stuff to do
// 1. what happens if I try to register multiple times?
// 2. UI's need to handle local streamer loss
//  2.1 if the ui is managing the local streamer that died then show a modal explaining that it died and show the SearchForLocal widget somewhere
//  2.2 if not then just update state
</script>

<template>
  <register-and-manage
    @register="register"
    @register-and-join="registerAndJoin"
    @register-and-takeover="registerAndTakeover"
  />
</template>
