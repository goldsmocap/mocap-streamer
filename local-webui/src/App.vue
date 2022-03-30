<template>
  <div class="app h-100">
    <Join />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";
import axios from "axios";
import { registerUiWithRemote } from "./hooks/useRemote";
import Join from "./components/Join.vue";
import Remote from "./components/remote/Remote.vue";

export default defineComponent({
  components: {
    Join,
    Remote,
  },

  setup(props, { root }) {
    // const route = ref(root.$route.name);
    // watchEffect(() => {
    //   route.value = root.$route.name;
    // });
    // const connectTo = ref("");
    // function connect() {
    //   axios.get(`api/remote/connect/to/${connectTo.value}`);
    // }
    // return {
    //   connectTo,
    //   connect,
    //   route,
    // };
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
