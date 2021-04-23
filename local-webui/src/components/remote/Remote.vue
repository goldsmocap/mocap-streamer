<template>
  <div class="d-flex w-100 h-100">
    <div class="bg-dark text-white p-3 w-25">
      <!-- <p class="h2">Remote</p>
      <hr /> -->
      <div v-if="selectedClient">
        <p class="h3 mb-4">{{ selectedClient.name }}</p>

        <div v-if="selectedClient.connectedTo.length > 0">
          <p class="h5">Connected To:</p>
          <div class="d-flex" v-for="connection in selectedClient.connectedTo">
            <span class="flex-grow-1">{{ connection }}</span>
            <b-button
              class="text-danger"
              variant="link"
              size="sm"
              @click="disconnect(selectedClient.name, connection)"
            >
              <b-icon icon="trash" />
            </b-button>
          </div>
        </div>
        <div v-else><p class="h5">No connections...</p></div>
      </div>
      <div
        v-else
        class="d-flex align-items-center justify-content-center w-100 h-100"
      >
        <div class="h3">Please select a client</div>
      </div>
    </div>

    <div class="w-75 bg-white" ref="stage">
      <v-stage
        :config="configKonva"
        @mousemove="handleMouseMove"
        @click="handleStageClick"
      >
        <v-layer class="client">
          <v-arrow
            v-if="newConnection"
            :config="{ ...configArrow, points: newConnection }"
            @click="handleArrowClick"
          />

          <v-group
            v-for="client in clients"
            :config="{ draggable: true, x: client.x, y: client.y }"
            @dragstart="handleDragStart(client.name)"
            @dragmove="handleDragMove"
            @dragend="handleDragEnd"
            @mouseover="handleMouseOver(client)"
            @mouseout="handleMouseOut"
            @dblclick="(evt) => handleDoubleClick(evt, client.name)"
            @click="(evt) => handleClick(evt, client.name)"
          >
            <v-circle :config="configClientCircle" />
            <v-text :config="{ ...configClientText, text: client.name }" />
          </v-group>

          <v-arrow
            v-for="connection in connections"
            :config="{ ...configArrow, points: connection }"
          />
        </v-layer>
      </v-stage>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  Ref,
  ref,
  watch,
} from "@vue/composition-api";
import axios from "axios";
import {
  clients as remoteClients,
  clientMap as remoteClientMap,
} from "../../hooks/useRemote";

type Vec2 = [number, number];
type Vec4 = [number, number, number, number];

interface KonvaClient {
  name: string;
  connectedTo: string[];
  x: number;
  y: number;
}

export default defineComponent({
  setup() {
    const stage: Ref<HTMLElement | undefined> = ref(undefined);

    // Configuration
    ///////////////////////////////////////////////////////////////////////////
    const rad = 40;

    const configKonva = computed(() => {
      return {
        width: stage.value?.offsetWidth ?? 0,
        height: stage.value?.offsetHeight ?? 0,
      };
    });

    const configClientCircle = {
      radius: rad,
      fill: "#3295a8",
      stroke: "white",
      strokeWidth: 1,
    };

    const configClientText = {
      fill: "#fefefe",
      align: "center",
      width: rad,
      height: rad,
      x: -rad / 2,
      y: -rad / 2,
    };

    const configArrow = {
      fill: "black",
      stroke: "black",
      strokeWidth: 2,
    };

    // Entities
    ///////////////////////////////////////////////////////////////////////////
    const clients: Ref<KonvaClient[]> = ref([]);

    watch(remoteClients, (remoteClients) => {
      const updatedClients = remoteClients.map(({ name }, i) => {
        const connectedTo = remoteClientMap.value
          .filter(([from, _]) => from.name === name)
          .map(([_, to]) => to.name);

        // check if this is a new client or not, if it's not then copy over
        // it's previous location.
        const client = clients.value.find((client) => client.name === name);
        const [x, y] = client ? [client.x, client.y] : [2 * rad + (i + 1), rad];

        return { name, connectedTo, x, y };
      });

      clients.value = updatedClients;
    });

    function getClient(name: string): KonvaClient | undefined {
      return clients.value.find((client) => client.name === name);
    }

    function point(from: Vec2, to: Vec2, r: number): Vec2 {
      const A = to[1] - from[1];
      const O = to[0] - from[0];
      const H = Math.sqrt(A * A + O * O);

      const sin = O / H;
      const cos = A / H;

      return [sin * r + from[0], cos * r + from[1]];
    }

    const connections = computed(() => {
      return clients.value.flatMap((from) => {
        return from.connectedTo
          .flatMap((toName) => {
            const to = getClient(toName);
            return to ? [to] : [];
          })
          .map((to) => {
            const fromP: Vec2 =
              from === to
                ? [from.x + rad * 2, from.y + rad * 2]
                : [from.x, from.y];
            const toP: Vec2 = [to.x, to.y];
            const points = [
              ...point(fromP, toP, rad + 2),
              ...point(toP, fromP, rad + 4),
            ];
            return points;
          });
      });
    });

    // Dragging functionality
    ///////////////////////////////////////////////////////////////////////////
    let dragClient: KonvaClient | undefined = undefined;

    function handleDragStart(clientName: string) {
      dragClient = getClient(clientName);
    }

    function handleDragMove(evt: any) {
      if (dragClient) {
        dragClient.x = evt.currentTarget.attrs.x;
        dragClient.y = evt.currentTarget.attrs.y;
      }
    }

    function handleDragEnd() {
      dragClient = undefined;
    }

    // New connection functionality
    ///////////////////////////////////////////////////////////////////////////
    const selectedClient: Ref<KonvaClient | undefined> = ref(undefined);
    const mousepos: Ref<Vec2> = ref([0, 0] as Vec2);
    const connectFrom: Ref<KonvaClient | undefined> = ref(undefined);
    const connectTo: Ref<KonvaClient | undefined> = ref(undefined);
    const newConnection: Ref<Vec4 | undefined> = computed(() => {
      if (connectFrom.value) {
        const from: Vec2 =
          connectTo.value === connectFrom.value
            ? [connectFrom.value.x + rad * 2, connectFrom.value.y + rad * 2]
            : [connectFrom.value.x, connectFrom.value.y];

        const to: Vec2 = connectTo.value
          ? [connectTo.value.x, connectTo.value.y]
          : mousepos.value;

        const fromRad = rad + 2;
        const toRad = connectTo.value ? rad + 2 : 2;

        if (connectFrom.value?.name === connectTo.value?.name) {
        }
        const fromP = point(from, to, fromRad);
        const toP = point(to, from, toRad);

        return connectFrom.value ? [...fromP, ...toP] : undefined;
      }

      return undefined;
    });

    function handleMouseOver(client: KonvaClient) {
      connectTo.value = client;

      if (stage.value) stage.value.style.cursor = "pointer";
    }

    function handleMouseOut(_evt: any) {
      connectTo.value = undefined;
      if (stage.value) stage.value.style.cursor = "default";
    }

    function handleDoubleClick(evt: any, clientName: string) {
      connectFrom.value = getClient(clientName);
      evt.cancelBubble = true;
    }

    function handleClick(evt: any, clientName: string) {
      if (connectFrom.value) {
        const connectTo = getClient(clientName);
        if (connectTo) {
          // add connection using the local streamer
          const fromName = connectFrom.value.name;
          const toName = connectTo.name;
          axios
            .get(`/api/remote/connect/${fromName}/${toName}`)
            .then(() => {
              // connectFrom.value?.connectedTo.push(connectTo.name);
              console.log(connectFrom.value?.connectedTo);
              connectFrom.value = undefined;
            })
            .catch((err) => {
              // TODO: Handle error
            });
        }
      } else {
        selectedClient.value = getClient(clientName);
      }

      evt.cancelBubble = true;
    }

    function handleStageClick() {
      connectFrom.value = undefined;
      selectedClient.value = undefined;
    }

    function handleArrowClick() {
      console.log("asdfdsf");
    }

    function handleMouseMove(evt: any) {
      mousepos.value = [evt.evt.layerX, evt.evt.layerY];
    }

    // Disconnection
    ///////////////////////////////////////////////////////////////////////////
    function disconnect(fromName: string, toName: string) {
      axios
        .get(`/api/remote/disconnect/${fromName}/${toName}`)
        .then((res) => {})
        .catch((err) => {
          // TODO: Handle error
        });
    }

    // Websockets

    return {
      stage,
      clients,
      connections,

      configKonva,
      configClientText,
      configClientCircle,
      configArrow,

      handleDragStart,
      handleDragMove,
      handleDragEnd,

      newConnection,
      handleDoubleClick,
      handleClick,
      handleStageClick,
      handleArrowClick,
      handleMouseMove,
      handleMouseOver,
      handleMouseOut,

      selectedClient,
      getClient,

      disconnect,
    };
  },
});
</script>

<style lang="scss" scoped>
.client {
  cursor: pointer !important;
}
</style>
