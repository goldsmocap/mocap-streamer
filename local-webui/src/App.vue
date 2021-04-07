<template>
  <div id="app">
    <join />

    <b-sidebar bg-variant="primary" no-header-close visible> </b-sidebar>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "@vue/composition-api";
import axios from "axios";
import Join from "./components/Join.vue";

export default defineComponent({
  components: {
    Join,
  },

  setup(props, { root }) {
    const connectTo = ref("");
    function connect() {
      axios
        .get(`api/remote/connect/to/${connectTo.value}`)
        .then((res) => {})
        .catch((err) => {});
    }

    return {
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
