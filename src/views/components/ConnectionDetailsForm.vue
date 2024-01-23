<script setup lang="ts">
import { computed } from "vue";
import * as yup from "yup";
import { ErrorMessage, Field, Form } from "vee-validate";

export interface ConnectionDetails {
  address: string;
  port: number;
  useOsc?: boolean;
}

const connectionDetailsSchema = computed(() =>
  yup.object({
    address: yup.string().trim().required(),
    port: yup
      .number()
      .integer()
      .positive()
      .lessThan(2 ** 16),
    useOsc: yup.bool(),
  })
);

const {
  initial,
  submitLabel,
  onSubmit,
  canUseOsc = false,
} = defineProps<{
  initial?: Partial<ConnectionDetails>;
  submitLabel: string;
  onSubmit: (connection: ConnectionDetails) => void;
  canUseOsc?: boolean;
}>();
</script>
<template>
  <Form
    class="w-full flex flex-col gap-2"
    :validation-schema="connectionDetailsSchema"
    :initial-values="initial"
    @submit="args => onSubmit(args as ConnectionDetails)"
  >
    <button type="submit" class="btn btn-block btn-primary my-4">
      {{ submitLabel }}
    </button>
    <div tabindex="0" class="collapse collapse-arrow border border-slate-400">
      <input type="checkbox" />
      <div class="collapse-title text-md font-medium">Connection Details</div>
      <div class="collapse-content">
        <label>
          <span>Address</span>
          <Field class="input input-bordered w-full mb-2" name="address" />
        </label>
        <ErrorMessage class="block text-error text-sm" name="address" />

        <label>
          <span>Port</span>
          <Field class="input input-bordered w-full mb-2" name="port" />
        </label>
        <ErrorMessage class="block text-error text-sm" name="port" />

        <label v-if="canUseOsc" class="flex flex-row gap-4">
          <Field
            name="useOsc"
            type="checkbox"
            class="self-center w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            :value="true"
            :unchecked-value="false"
          />
          Use Osc
        </label>
      </div>
    </div>
  </Form>
</template>
