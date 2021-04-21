<template>
  <div class="d-flex w-100 h-100">
    <div class="bg-dark text-white p-3 w-25">
      <div v-if="selectedClient">
        <p class="h3 mb-4">{{ selectedClient.name }}</p>

        <div v-if="selectedClient.connectedTo.length > 0">
          <p class="h5">Connected To:</p>
          <div class="d-flex" v-for="connection in selectedClient.connectedTo">
            <span class="flex-grow-1">{{ getClient(connection).name }}</span>
            <b-button class="text-danger" variant="link" size="sm">
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
            @dragstart="handleDragStart(client.id)"
            @dragmove="handleDragMove"
            @dragend="handleDragEnd"
            @mouseover="handleMouseOver(client)"
            @mouseout="handleMouseOut"
            @dblclick="(evt) => handleDoubleClick(evt, client.id)"
            @click="(evt) => handleClick(evt, client.id)"
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
import { computed, defineComponent, Ref, ref } from "@vue/composition-api";

type Vec2 = [number, number];
type Vec4 = [number, number, number, number];

interface KonvaClient {
  id: number;
  name: string;
  connectedTo: number[];
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
    const clients = ref([
      { id: 0, name: "Oli", connectedTo: [1], x: rad, y: rad },
      { id: 1, name: "Wayne", connectedTo: [], x: rad, y: rad },
      { id: 2, name: "Adam", connectedTo: [], x: rad, y: rad },
    ]);

    function getClient(id: number): KonvaClient | undefined {
      return clients.value.find((client) => client.id === id);
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
          .flatMap((toId) => {
            const to = getClient(toId);
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

    function handleDragStart(clientId: number) {
      dragClient = getClient(clientId);
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

        if (connectFrom.value?.id === connectTo.value?.id) {
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

    function handleDoubleClick(evt: any, clientId: number) {
      connectFrom.value = getClient(clientId);
      evt.cancelBubble = true;
    }

    function handleClick(evt: any, clientId: number) {
      if (connectFrom.value) {
        const connectTo = getClient(clientId);
        if (connectTo) {
          // add connection
          connectFrom.value?.connectedTo.push(connectTo.id);
          console.log(connectFrom.value?.connectedTo);
          connectFrom.value = undefined;
        }
      } else {
        selectedClient.value = getClient(clientId);
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
    };
  },
});
</script>

<style lang="scss" scoped>
.client {
  cursor: pointer !important;
}
</style>
