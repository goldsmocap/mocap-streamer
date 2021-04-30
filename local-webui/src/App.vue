<template>
  <div class="app h-100">
    <!-- <join /> -->

    <b-navbar variant="dark">
      <div class="d-flex justify-content-center w-100">
        <b-button-group size="sm">
          <b-button
            :variant="route === 'local' ? 'warning' : 'primary'"
            to="local"
            squared
          >
            Local
          </b-button>
          <b-button
            :variant="
              route === 'remote' || route === 'home' ? 'warning' : 'primary'
            "
            to="remote"
            squared
          >
            Remote
          </b-button>
        </b-button-group>
      </div>
    </b-navbar>

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
