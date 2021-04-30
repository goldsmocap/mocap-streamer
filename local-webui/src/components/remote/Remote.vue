<template>
  <div class="d-flex w-100 h-100">
    <div class="bg-dark text-white p-3 w-25">
      <div v-if="selectedClient">
        <component :is="selectedClient.context" :client="selectedClient" />
      </div>
      <div
        v-else
        class="d-flex align-items-center justify-content-center w-100 h-100"
      >
        <div class="h4">Please select a client</div>
      </div>
    </div>

    <graph-layer
      :nodes="nodes"
      :edges="edges"
      :selectedNode.sync="selectedClient"
      @new-edge="handleNewEdge"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, Ref, ref } from "@vue/composition-api";
import axios from "axios";
import { clients, clientMap } from "../../hooks/useRemote";
import GraphLayer, { INode, IEdge } from "../graph/GraphLayer.vue";
import ClientContext from "./ClientContext.vue";

export default defineComponent({
  components: {
    GraphLayer,
    ClientContext,
  },

  setup() {
    const nodes: Ref<INode[]> = computed(() => {
      return clients.value.map((c) => {
        return {
          type: "CLIENT",
          name: c.name,
          label: c.name,
          context: "ClientContext",
        };
      });
    });
    const edges: Ref<IEdge[]> = computed(() => {
      return clientMap.value.map(([from, to]) => {
        return { from: from.name, to: to.name };
      });
    });
    const selectedClient: Ref<INode | undefined> = ref(undefined);

    function handleNewEdge(from: string, to: string) {
      axios
        .get(`/api/remote/connect/${from}/${to}`)
        .then(() => {
          // TODO: Display message
        })
        .catch((err) => {
          // TODO: Handle error
        });
    }

    return {
      nodes,
      edges,
      selectedClient,
      handleNewEdge,
    };
  },
});
</script>

<style lang="scss" scoped>
.client {
  cursor: pointer !important;
}
</style>
