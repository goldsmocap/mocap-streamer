<script setup lang="ts">
import { computed } from "vue";
import * as yup from "yup";
import { ErrorMessage, Field, Form } from "vee-validate";

interface Option<S extends string> {
  label: string;
  value: S;
}
function option<const S extends string>(
  value: S,
  label: string = value
): Option<S> {
  return { label, value };
}
const producerOptionTypes = [
  option("AxisStudio", "Axis Studio"),
  option("Vicon"),
  option("Optitrack"),
  option("Xsens"),
  option("Development"),
];

export interface ProducerConnectionDetails {
  type: typeof producerOptionTypes extends Option<infer S>[] ? S : never;
  address: string;
  port: number;
}

const producerConnectionDetailsSchema = computed(() =>
  yup.object({
    type: yup
      .string()
      .oneOf(producerOptionTypes.map(({ value }) => value))
      .required()
      .default("AxisStudio"),
    address: yup.string().trim().required(),
    port: yup
      .number()
      .required()
      .integer()
      .positive()
      .lessThan(2 ** 16),
  })
);

const { initial, onSubmit } = defineProps<{
  initial?: Partial<ProducerConnectionDetails>;
  onSubmit: (connection: ProducerConnectionDetails) => void;
}>();
</script>
<template>
  <Form
    class="w-full flex flex-col gap-2"
    :validation-schema="producerConnectionDetailsSchema"
    :initial-values="initial"
    @submit="args => onSubmit(args as ProducerConnectionDetails)"
  >
    <button type="submit" class="btn btn-block btn-primary my-4">
      Start Sending
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

        <label class="flex flex-col">
          <span>What are you sending from?</span>
          <Field class="select w-full input-bordered" name="type" as="select">
            <option v-for="option in producerOptionTypes" :value="option.value">
              {{ option.label }}
            </option>
          </Field>
        </label>
        <ErrorMessage class="block text-error text-sm" name="type" />
      </div>
    </div>
  </Form>
</template>
