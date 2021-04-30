<template>
  <div class="w-100 h-100 bg-white border" ref="stage">
    <v-stage :config="configKonva" @mousemove="handleMouseMove" @click="cancel">
      <v-layer>
        <v-arrow v-if="newEdge" :config="{ ...arrowConfig, points: newEdge }" />

        <node
          v-for="(node, i) in kNodes"
          :key="`node-${i}`"
          :label="node.label"
          :center.sync="node.center"
          :selected="selectedNode && selectedNode.name === node.name"
          @dblclick="(evt) => handleDblClick(evt, node)"
          @click="(evt) => handleClick(evt, node)"
          @mouseover="(evt) => handleMouseOver(evt, node)"
          @mouseout="(evt) => handleMouseOut(evt, node)"
        />

        <v-arrow
          v-for="(edge, i) in kEdges"
          :key="`edge-${i}`"
          :config="{ ...arrowConfig, points: edge }"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  Ref,
  ref,
  watch,
} from "@vue/composition-api";
import Node from "./Node.vue";

type Vec2 = [number, number];
type Vec4 = [number, number, number, number];

export interface INode {
  type: string;
  name: string;
  label: string;
}

export interface IEdge {
  from: string;
  to: string;
}

interface IKNode extends INode {
  center: Vec2;
}

export default defineComponent({
  components: {
    Node,
  },

  props: {
    nodes: {
      type: Array as PropType<Array<INode>>,
      required: true,
      default: [],
    },
    edges: {
      type: Array as PropType<Array<IEdge>>,
      required: true,
      default: [],
    },
    ghost: Object as PropType<INode>,
  },

  setup(props, { emit }) {
    // Stage
    ///////////////////////////////////////////////////////////////////////////
    const stage: Ref<HTMLElement | undefined> = ref(undefined);
    const configKonva = computed(() => {
      return {
        width: stage.value?.offsetWidth ?? 0,
        height: stage.value?.offsetHeight ?? 0,
      };
    });

    function cancel() {
      if (newEdgeFrom.value) newEdgeFrom.value = undefined;
      else selectedNode.value = undefined;
    }

    // Mouse position
    ///////////////////////////////////////////////////////////////////////////
    const mousepos: Ref<Vec2> = ref([0, 0] as Vec2);
    function handleMouseMove(evt: any) {
      mousepos.value = [evt.evt.layerX, evt.evt.layerY];
    }

    // Ghost
    ///////////////////////////////////////////////////////////////////////////

    // Nodes
    ///////////////////////////////////////////////////////////////////////////
    const rad = 40;
    const kNodes: Ref<IKNode[]> = ref(
      props.nodes.map((n) => {
        const center: Vec2 = [0, 0];
        return { ...n, center };
      })
    );
    watch(
      () => props.nodes,
      (nodes) => {
        const updatedNodes = nodes.map((n) => {
          const node = kNodes.value.find((k) => k.name === n.name);

          // check if this is a new client or not, if it's not then copy over
          // it's previous location.
          const center: Vec2 = node ? node.center : [0, 0];

          return { ...n, center };
        });

        kNodes.value = updatedNodes;
      }
    );
    const selectedNode: Ref<IKNode | undefined> = ref(undefined);
    watch(selectedNode, (node) => {
      emit(
        "update:selectedNode",
        props.nodes.find((n) => n.name === node?.name)
      );
    });

    // Edges
    ///////////////////////////////////////////////////////////////////////////
    const arrowConfig = {
      fill: "black",
      stroke: "black",
      strokeWidth: 2,
    };
    const kEdges = computed(() => {
      return props.edges.map((e) => {
        const from = kNodes.value.find((n) => n.name === e.from);
        const to = kNodes.value.find((n) => n.name === e.to);

        if (from && to) {
          const fromP: Vec2 =
            from.name === to.name
              ? addPoint(from.center, [rad * 2, rad * 2])
              : from.center;
          const toP: Vec2 = to.center;
          const points = [...point(fromP, toP), ...point(toP, fromP)];
          return points;
        }

        return [0, 0, 0, 0];
      });
    });

    // New edge
    ///////////////////////////////////////////////////////////////////////////
    const newEdgeFrom: Ref<IKNode | undefined> = ref(undefined);
    const newEdgeTo: Ref<IKNode | undefined> = ref(undefined);
    const newEdge = computed(() => {
      if (newEdgeFrom.value) {
        const from: Vec2 =
          newEdgeTo.value === newEdgeFrom.value
            ? addPoint(newEdgeFrom.value.center, [rad * 2, rad * 2])
            : newEdgeFrom.value.center;

        const to: Vec2 = newEdgeTo.value
          ? newEdgeTo.value.center
          : mousepos.value;

        const fromRad = rad + 2;
        const toRad = newEdgeTo.value ? rad + 2 : 4;

        const fromP = point(from, to, fromRad);
        const toP = point(to, from, toRad);

        return newEdgeFrom.value ? [...fromP, ...toP] : undefined;
      }

      return undefined;
    });

    function handleDblClick(_evt: any, node: IKNode) {
      newEdgeFrom.value = node;
    }

    function handleClick(evt: any, node: IKNode) {
      if (newEdgeFrom.value) {
        const connectTo = kNodes.value.find((k) => k.name === node.name);
        if (connectTo) {
          const from = newEdgeFrom.value.name;
          const to = connectTo.name;
          emit("new-edge", from, to);

          newEdgeFrom.value = undefined;
          newEdgeTo.value = undefined;
        }
      } else {
        selectedNode.value = node;
      }

      evt.cancelBubble = true;
    }

    function handleMouseOver(_evt: any, node: IKNode) {
      newEdgeTo.value = node;
      if (stage.value) stage.value.style.cursor = "pointer";
    }

    function handleMouseOut(_evt: any) {
      newEdgeTo.value = undefined;
      if (stage.value) stage.value.style.cursor = "default";
    }

    // Helper functions
    ///////////////////////////////////////////////////////////////////////////
    function point(from: Vec2, to: Vec2, r: number = rad + 4): Vec2 {
      const A = to[1] - from[1];
      const O = to[0] - from[0];
      const H = Math.sqrt(A * A + O * O);

      const sin = O / H;
      const cos = A / H;

      return [sin * r + from[0], cos * r + from[1]];
    }

    function addPoint(a: Vec2, b: Vec2): Vec2 {
      return [a[0] + b[0], a[1] + b[1]];
    }

    return {
      stage,
      configKonva,
      handleMouseMove,
      cancel,
      kNodes,
      arrowConfig,
      kEdges,
      newEdge,
      handleDblClick,
      handleClick,
      handleMouseOver,
      handleMouseOut,
      selectedNode,
    };
  },
});
</script>
