<template>
  <div class="d-flex w-100 h-100" v-on:keyup.esc="() => selectFromPalette('')">
    <!-- new node modals -->
    <component v-if="paletteSelection" :is="paletteSelection.wizard" />

    <div class="bg-primary text-white w-25">
      <b-tabs content-class="mt-3" small>
        <b-tab title="Wizard" active><p>I'm the first tab</p></b-tab>
        <b-tab title="Palette">
          <b-button
            v-for="flow in palette"
            :key="flow.name"
            class="my-1"
            size="sm"
            squared
            block
            @click="() => selectFromPalette(flow.name)"
          >
            <b-icon class="float-left" icon="plus" />
            {{ flow.label }}
          </b-button>
        </b-tab>
        <b-tab title="Context">
          <div v-if="selectedNode"></div>
          <div v-else class="d-flex align-items-center justify-content-center">
            <div class="h4">Please select a node</div>
          </div>
        </b-tab>
      </b-tabs>
    </div>

    <div class="w-75 bg-white">
      <graph-layer :nodes="[]" :edges="[]" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref } from "@vue/composition-api";
import GraphLayer from "../graph/GraphLayer.vue";
import WsSourceWizard from "./WsSourceWizard.vue";
import WsSinkWizard from "./WsSinkWizard.vue";

interface Flow {
  name: string;
  description?: string;
  label: string;
  wizard: string;
}

export default defineComponent({
  components: { GraphLayer, WsSourceWizard, WsSinkWizard },

  setup() {
    const stage: Ref<HTMLElement | undefined> = ref(undefined);

    const configKonva = computed(() => {
      return {
        width: stage.value?.offsetWidth ?? 0,
        height: stage.value?.offsetHeight ?? 0,
      };
    });

    const palette: Ref<Flow[]> = ref([
      { name: "WS_SRC", label: "WebSocket Source", wizard: "WsSourceWizard" },
      { name: "UDP_SRC", label: "UDP Source", wizard: "" },
      { name: "WS_SINK", label: "WebSocket Sink", wizard: "WsSinkWizard" },
      { name: "UDP_SINK", label: "UDP Sink", wizard: "" },
    ]);
    const paletteSelection: Ref<Flow | undefined> = ref(undefined);
    const selectFromPalette = (name: string) => {
      paletteSelection.value = palette.value.find((p) => p.name === name);
    };

    return {
      stage,
      configKonva,

      palette,
      paletteSelection,
      selectFromPalette,
    };
  },
});
</script>
