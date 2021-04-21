<template>
  <div class="app h-100">
    <!-- <join /> -->
    <Kanvas />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "@vue/composition-api";
import axios from "axios";
import Join from "./components/Join.vue";
import Kanvas from "./components/remote/Kanvas.vue";

export default defineComponent({
  components: {
    Join,
    Kanvas,
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
}
</style>
