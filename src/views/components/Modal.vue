<script setup lang="ts">
const { type, open, closeable } = defineProps<{
  closeable?: boolean;
  open: boolean;
  type?: "info" | "warn" | "error" | null;
}>();

const emit = defineEmits<{
  "update:open": [isOpen: boolean];
}>();
</script>

<template>
  <div class="modal" :class="{ 'modal-open': open }">
    <div class="modal-box">
      <div
        class="flex"
        :class="type == null ? 'justify-end' : 'justify-between'"
      >
        <v-icon
          v-if="type === 'info'"
          name="hi-information-circle"
          class="w-16 text-gray-800 border border-gray-900 rounded-full"
        />
        <v-icon
          v-else-if="type === 'warn'"
          name="hi-exclamation-circle"
          class="w-16 text-yellow-500 border border-yellow-600 rounded-full"
        />
        <v-icon
          v-else-if="type === 'error'"
          name="hi-exclamation-circle"
          class="w-16 text-red-500 border border-red-600 rounded-full"
        />

        <v-icon
          v-if="closeable"
          name="hi-x-circle"
          class="btn btn-xs btn-circle justify-self-end"
          @click="emit('update:open', false)"
        />
      </div>

      <div class="mb-2 w-full">
        <slot />
      </div>
    </div>
  </div>
</template>
