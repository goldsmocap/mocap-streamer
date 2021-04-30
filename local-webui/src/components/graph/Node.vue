<template>
  <v-group
    :config="{ draggable: true }"
    v-on="listeners"
    @dragmove="handleDrag"
  >
    <v-circle
      :config="{
        radius: rad,
        fill: color,
        stroke: selected ? 'black' : 'white',
        strokeWidth: 1,
      }"
    />
    <v-text
      :config="{
        fill: textColor,
        align: 'center',
        width: rad,
        height: rad,
        x: -rad / 2,
        y: -rad / 2,
        text: label,
      }"
    />
  </v-group>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@vue/composition-api";

export default defineComponent({
  props: {
    rad: {
      type: Number,
      default: 40,
    },
    color: {
      type: String,
      default: "#fd7e14",
    },
    textColor: {
      type: String,
      default: "#fefefe",
    },
    label: {
      type: String,
      required: true,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },

  setup(_props, { attrs, listeners, emit }) {
    const handleDrag = (evt: any) => {
      const attrs = evt.target.attrs;
      emit("update:center", [attrs.x, attrs.y]);
    };

    return {
      attrs,
      listeners,
      handleDrag,
    };
  },
});
</script>
