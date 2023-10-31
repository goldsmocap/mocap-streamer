<script setup lang="ts">
import { onMounted, ref, useSlots, watch } from "vue";
const dialog = ref<HTMLDialogElement | null>(null);

const slots = useSlots();

const props = defineProps<{
  isOpen: boolean;
  onClose?: () => void;
}>();

onMounted(() => {
  if (dialog.value != null) {
    dialog.value.onclose = props.onClose ?? null;
  }
});

watch(
  () => props.isOpen,
  (isOpen, previousIsOpen) => {
    if (dialog.value != null && previousIsOpen != isOpen) {
      if (isOpen) {
        dialog.value.showModal();
      } else {
        dialog.value.close();
        props.onClose?.();
      }
    }
  }
);
</script>

<template>
  <dialog
    ref="dialog"
    class="backdrop:bg-slate-900/50 w-lg h-lg flex content-center justify-center"
  >
    <form
      v-if="dialog?.open"
      class="bg-slate-700 rounded max-h-[calc(100vh-16rem)] max-w-[clamp(26rem,50vw,35rem)] flex flex-col content-stretch"
    >
      <div
        v-if="slots.header"
        class="bg-slate-700 border-b-2 border-b-slate-500 rounded-t px-3"
      >
        <slot name="header" />
      </div>
      <div v-if="slots.body" class="overflow-y-auto max-h-full w-fit px-3">
        <slot name="body" />
      </div>
      <div
        v-if="slots.footer"
        class="bg-slate-700 border-t-2 border-t-slate-500 rounded-b px-3"
      >
        <slot name="footer" />
      </div>
    </form>
  </dialog>
</template>
