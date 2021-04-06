<template>
  <div id="app">
    <div>
      <input type="text" v-model="clientName" />
      <button @click="join">Join</button>
    </div>
    <div>
      <input type="text" v-model="connectTo" />
      <button @click="connect">Connect</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "@vue/composition-api";
import axios from "axios";

export default defineComponent({
  setup() {
    const clientName = ref("");
    function join() {
      axios
        .get(`api/remote/join/${clientName.value}`)
        .then((res) => {})
        .catch((err) => {});
    }

    const connectTo = ref("");
    function connect() {
      axios
        .get(`api/remote/connect/to/${connectTo.value}`)
        .then((res) => {})
        .catch((err) => {});
    }

    return {
      clientName,
      join,

      connectTo,
      connect,
    };
  },
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
