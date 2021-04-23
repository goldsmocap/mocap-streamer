<template>
  <div class="app h-100">
    <!-- <join /> -->

    <div class="fixed-top d-flex justify-content-center mt-3 w-100">
      <div class="w-25"></div>
      <b-button-group size="sm">
        <b-button
          :variant="route === 'local' ? 'warning' : 'primary'"
          to="local"
        >
          Local
        </b-button>
        <b-button
          :variant="route === 'remote' ? 'warning' : 'primary'"
          to="remote"
        >
          Remote
        </b-button>
      </b-button-group>
    </div>

    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect } from "@vue/composition-api";
import axios from "axios";
import Join from "./components/Join.vue";
import Remote from "./components/remote/Remote.vue";

export default defineComponent({
  components: {
    Join,
    Remote,
  },

  setup(props, { root }) {
    const route = ref(root.$route.name);
    watchEffect(() => {
      route.value = root.$route.name;
    });

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
      route,
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

<style lang="scss" scoped>
.menu {
  position: absolute;
  top: 20px;
}
</style>
