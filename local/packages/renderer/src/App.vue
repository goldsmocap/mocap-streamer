<script setup lang="ts">
import { ipcRenderer } from "electron";

function poop() {
  ipcRenderer.send("click");
}
</script>

<template>
  <router-view></router-view>
</template>

<style>
@import "./assets/custom.css";
</style>
