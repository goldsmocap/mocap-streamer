<script setup lang="ts">
import { computed } from "vue";
import * as yup from "yup";
import { ErrorMessage, Field, Form } from "vee-validate";

export interface ConsumerConnectionDetails {
  address: string;
  port: number;
}

const consumerConnectionDetailsSchema = computed(() =>
  yup.object({
    address: yup.string().trim().required(),
    port: yup
      .number()
      .integer()
      .positive()
      .lessThan(2 ** 16),
  })
);

const { initial, onSubmit } = defineProps<{
  initial?: Partial<ConsumerConnectionDetails>;
  onSubmit: (connection: ConsumerConnectionDetails) => void;
}>();
</script>
<template>
  <Form
    class="w-full flex flex-col gap-2"
    :validation-schema="consumerConnectionDetailsSchema"
    :initial-values="initial"
    @submit="args => onSubmit(args as ConsumerConnectionDetails)"
  >
    <button type="submit" class="btn btn-block btn-primary my-4">
      Start Receiving
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
      </div>
    </div>
  </Form>
</template>
