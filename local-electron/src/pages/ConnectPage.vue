<script lang="ts" setup>
import { useRouter } from "vue-router";
import { postJoin } from "../server";
import RegisterServer from "../components/RegisterServer.vue";

const router = useRouter();

function register(remoteUrl: string, nameOnRemote: string) {
  console.log(`💃 joining remote server with name ${nameOnRemote}`);
  postJoin(remoteUrl, nameOnRemote, () => router.push("/"))
    .then(() => router.push("/dashboard"))
    .catch((err) => console.error("💀 error joining remote", err));
}
</script>

<template>
  <register-server @register="register" />
</template>
