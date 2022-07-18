<script lang="ts" setup>
import type { PropType } from "vue";

import { ExclamationCircleIcon, XCircleIcon, InformationCircleIcon } from "@heroicons/vue/solid";

defineProps({
  open: Boolean,
  type: {
    default: "INFO",
    type: String as PropType<"INFO" | "WARN" | "ERROR">,
  },
});

const emit = defineEmits<{
  (e: "update:open", isOpen: boolean): void;
}>();
</script>

<template>
  <div class="modal" :class="{ 'modal-open': open }">
    <div class="modal-box">
      <div class="flex justify-end">
        <x-circle-icon class="btn btn-xs btn-circle" @click="emit('update:open', false)" />
      </div>

      <information-circle-icon
        v-if="type === 'INFO'"
        class="w-16 text-neutral border-none rounded-none mx-auto"
      />
      <exclamation-circle-icon
        v-else-if="type === 'WARN'"
        class="w-16 text-warning border rounded-none mx-auto"
      />
      <exclamation-circle-icon
        v-else-if="type === 'ERROR'"
        class="w-16 text-error border rounded-none mx-auto"
      />

      <div class="mt-4 mb-2 w-none">
     
        <slot />
      </div>
    </div>
  </div>
</template>
