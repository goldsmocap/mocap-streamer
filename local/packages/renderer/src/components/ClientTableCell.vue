<script lang="ts" setup>
import { ref, Ref } from "vue";
import { MinusIcon, PlusIcon } from "@heroicons/vue/solid";
import { remoteState } from "../remote";

const props = defineProps({
  sender: {
    required: true,
    type: String,
  },
  receiver: {
    required: true,
    type: String,
  },
  portNumber: Number,
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
  <td :class="[connected ? 'connected' : 'not-connected']">
    <div class="cell m-0" @click="handleClick">
      <span v-if="portNumber" class="badge badge-xs absolute -m-1">{{ portNumber }}</span>
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
