<template>
  <div>
    <p>{{ i }}</p>
    <p class="h3 mb-5">{{ client.name }}</p>

    <div v-if="connections.length > 0">
      <p class="h5">Sending Data To:</p>
      <small>Ensure Axis Neuron is broadcasting on port 7002</small>
      <div
        class="d-flex mt-3"
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
    <div v-else><p class="h5">Not sending data!</p></div>

    <div v-if="sinks.length > 0" class="my-5">
      <p class="h5 mb-3">Receiving Data From:</p>
      <div class="d-flex" v-for="(sink, i) in sinks" :key="`sink-${i}`">
        <span class="flex-grow-1">
          {{ sink.sender.name }} on port {{ sink.toPort }}
        </span>
        <b-button
          class="text-danger"
          variant="link"
          size="sm"
          @click="disconnect(sink.sender.name, client.name)"
        >
          <b-icon icon="trash" />
        </b-button>
      </div>
    </div>
    <div v-else><p class="h5">Not receiving data!</p></div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  Ref,
  ref,
} from "@vue/composition-api";
import axios from "axios";
import { INode } from "../graph/GraphLayer.vue";
import { clientMap } from "../../hooks/useRemote";

export default defineComponent({
  props: {
    client: {
      type: Object as PropType<INode>,
      required: true,
    },
    i: {
      type: Number,
      required: true,
    },
  },

  setup(props) {
    const connections = computed(() => {
      if (props.i >= 0)
        return clientMap.value
          .filter(([from, _]) => from.name === props.client.name)
          .map(([from, to]) => [from.name, to.name]);
    });

    const sinks: Ref<any[]> = ref([]);
    axios.get("api/flow/sink/udp").then(
      (res) =>
        (sinks.value = res.data.map((datum: any) => {
          return { sender: datum.sender, toPort: datum.toPort };
        }))
    );

    function disconnect(from: string, to: string) {
      axios
        .get(`/api/remote/disconnect/${from}/${to}`)
        .then((res) => {})
        .catch((err) => {
          // TODO: Handle error
        });
    }

    return { connections, sinks, disconnect };
  },
});
</script>
