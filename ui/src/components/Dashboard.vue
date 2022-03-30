<script lang="ts" setup>
import type { PropType } from "vue";
import { UserCircleIcon, EyeIcon, LogoutIcon } from "@heroicons/vue/solid";
import type { ConnectedAs } from "./dashboard";

const props = defineProps({
  open: {
    required: true,
    type: Boolean,
  },
  connectedAs: {
    required: true,
    type: Object as PropType<ConnectedAs>,
  },
});

const emit = defineEmits<{
  (e: "leave"): void;
}>();
</script>

<template>
  <div v-show="open" class="w-screen h-screen p-1 sm:p-2 md:p-4 lg:p-8">
    <div class="flex flex-col rounded-xl bg-white shadow-xl border h-full p-4">
      <!-- Header -->
      <div class="flex mb-4">
        <div class="grow">
          <div v-if="connectedAs._tag === 'User'" class="flex items-center">
            <user-circle-icon class="w-8 mr-2" /> {{ connectedAs.name }}
          </div>
          <div v-else><eye-icon class="w-8" /></div>
        </div>
        <div class="shrink flex">
          <button class="btn" @click="emit('leave')">
            <div class="flex items-center">
              <div><logout-icon class="w-6 mr-2" /></div>
              <div>Leave</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Table -->
    </div>
  </div>
</template>
