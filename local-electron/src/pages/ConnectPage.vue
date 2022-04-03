<script lang="ts" setup>
import type { ClientRole } from "../../../shared/dist/clients";

import { useRouter } from "vue-router";
import { match, P } from "ts-pattern";
import { joinRemote } from "../server";
import { newRemoteWs } from "../remote";
import RegisterServer from "../components/RegisterServer.vue";

const router = useRouter();

function connect(remoteUrl: string) {
  console.log(`⚡ connecting to remote server.`);
  newRemoteWs(remoteUrl, () => router.push("/"))
    .then((errOrWs) => {
      match(errOrWs)
        .with({ _tag: "Right", right: P.any }, () => router.push("/dashboard"))
        .with({ _tag: "Left", left: { _tag: "WebSocketAlreadyConnected" } }, () =>
          console.log("⚡ cannot connect because WS is already connected.")
        )
        .with({ _tag: "Left", left: { _tag: "WebSocketConnecting" } }, () =>
          console.log("⚡ cannot connect because WS already exists and is still connecting.")
        )
        .with({ _tag: "Left", left: { _tag: "WebSocketClosed" } }, () =>
          console.log("⚡ cannot connect because WS immediately closed.")
        )
        .run();
    })
    .catch((err) => console.error("💀 error joining remote", err));
}

function connectAndJoin(remoteUrl: string, nameOnRemote: string, role: ClientRole) {
  console.log(`⚡ connecting to remote server.`);
  newRemoteWs(remoteUrl, () => router.push("/"))
    .then((errOrWs) => {
      match(errOrWs)
        .with({ _tag: "Right", right: P.select() }, (ws) => {
          console.log(`💃 joining remote server with name ${nameOnRemote}`);
          joinRemote(nameOnRemote, role, ws);
          router.push("/dashboard");
        })
        .with({ _tag: "Left", left: { _tag: "WebSocketAlreadyConnected" } }, () =>
          console.log("⚡ cannot connect because WS is already connected.")
        )
        .with({ _tag: "Left", left: { _tag: "WebSocketConnecting" } }, () =>
          console.log("⚡ cannot connect because WS already exists and is still connecting.")
        )
        .with({ _tag: "Left", left: { _tag: "WebSocketClosed" } }, () =>
          console.log("⚡ cannot connect because WS immediately closed.")
        )
        .run();
    })
    .catch((err) => console.error("💀 error joining remote", err));
}
</script>

<template>
  <register-server @connect="connect" @connect-and-join="connectAndJoin" />
</template>
