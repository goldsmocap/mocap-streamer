<script lang="ts" setup>
import { MinusIcon, PlusIcon } from "@heroicons/vue/solid";

const props = defineProps({
  sender: {
    required: true,
    type: String,
  },
  receiver: {
    required: true,
    type: String,
  },
  connected: {
    default: false,
    type: Boolean,
  },
});

const emit = defineEmits<{
  (e: "map", sender: string, receiver: string): void;
  (e: "unmap", sender: string, receiver: string): void;
}>();

function handleClick() {
  if (props.connected) emit("unmap", props.sender, props.receiver);
  else emit("map", props.sender, props.receiver);
}
</script>

<template>
  <td class="p-1" :class="[connected ? 'connected' : 'not-connected']">
    <div class="cell" @click="handleClick">
      <minus-icon v-if="connected" class="icon" />
      <plus-icon v-else class="icon" />
    </div>
  </td>
</template>

<style lang="postcss" scoped>
.cell {
  @apply link rounded-lg;
}

.cell:hover > .icon {
  @apply opacity-100;
}

.icon {
  @apply opacity-0 w-8 m-auto;
}

.connected > .cell {
  @apply bg-accent;
}
</style>
