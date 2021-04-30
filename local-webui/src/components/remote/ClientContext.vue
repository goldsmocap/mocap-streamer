<template>
  <div>
    <p class="h3 mb-4">{{ client.name }}</p>

    <div v-if="connections.length > 0">
      <p class="h5">Connected To:</p>
      <div
        class="d-flex"
        v-for="(connection, i) in connections"
        :key="`connection-${i}`"
      >
        <span class="flex-grow-1">{{ connection[1] }}</span>
        <b-button
          class="text-danger"
          variant="link"
          size="sm"
          @click="disconnect(connection[0], connection[1])"
        >
          <b-icon icon="trash" />
        </b-button>
      </div>
    </div>
    <div v-else><p class="h5">No connections...</p></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "@vue/composition-api";
import axios from "axios";
import { INode } from "../graph/GraphLayer.vue";
import { clientMap } from "../../hooks/useRemote";

export default defineComponent({
  props: {
    client: {
      type: Object as PropType<INode>,
      required: true,
    },
  },

  setup(props) {
    const connections = computed(() => {
      return clientMap.value
        .filter(([from, _]) => from.name === props.client.name)
        .map(([from, to]) => [from.name, to.name]);
    });

    function disconnect(from: string, to: string) {
      axios
        .get(`/api/remote/disconnect/${from}/${to}`)
        .then((res) => {})
        .catch((err) => {
          // TODO: Handle error
        });
    }

    return { connections, disconnect };
  },
});
</script>
