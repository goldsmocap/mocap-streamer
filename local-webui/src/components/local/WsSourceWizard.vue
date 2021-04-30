<template>
  <b-modal visible @ok="handleOk">
    <p class="my-4">Hello from modal!</p>
  </b-modal>
</template>

<script lang="ts">
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  setup() {
    function handleOk() {
      console.log("okay");
    }

    return { handleOk };
  },
});
</script>
