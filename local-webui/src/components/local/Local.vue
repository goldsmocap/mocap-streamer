<template>
  <div class="d-flex w-100 h-100">
    <div class="bg-dark text-white p-3 w-25">
      <!-- <p class="h2">Local</p>
      <hr /> -->
      <!-- context sidebar -->
    </div>

    <div class="w-75 bg-white" ref="stage">
      <v-stage
        :config="configKonva"
        @mousemove="handleMouseMove"
        @click="handleStageClick"
      >
      </v-stage>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref } from "@vue/composition-api";

export default defineComponent({
  setup() {
    const stage: Ref<HTMLElement | undefined> = ref(undefined);

    const configKonva = computed(() => {
      return {
        width: stage.value?.offsetWidth ?? 0,
        height: stage.value?.offsetHeight ?? 0,
      };
    });

    return {
      stage,
      configKonva,
    };
  },
});
</script>
