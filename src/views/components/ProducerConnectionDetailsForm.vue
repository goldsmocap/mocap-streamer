<script setup lang="ts">
import { ErrorMessage, Field, Form } from "vee-validate";
import { computed, ref } from "vue";
import * as yup from "yup";
import {
  OptitrackConnectionDetails,
  ProducerConnectionDetails,
  SimpleConnectionDetails,
} from "../../types";

const { initial, onSubmit } = defineProps<{
  initial?: ProducerConnectionDetails;
  onSubmit: (connection: ProducerConnectionDetails) => void;
}>();

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
const producerOptionTypes: Option<ProducerConnectionDetails["type"]>[] = [
  option("AxisStudio", "Axis Studio"),
  option("Vicon"),
  option("Optitrack"),
  option("Xsens"),
  option("Development"),
];

const producerType = ref<ProducerConnectionDetails["type"]>(
  initial?.type ?? "AxisStudio"
);

const producerTypeSchema = yup
  .string()
  .oneOf(producerOptionTypes.map(({ value }) => value))
  .required();

const isSimpleProducerType = computed(() =>
  new Set<ProducerConnectionDetails["type"]>([
    "AxisStudio",
    "Vicon",
    "Xsens",
  ]).has(producerType.value)
);

const developmentDetailsSchema = computed(() =>
  yup.object({
    type: producerTypeSchema,
  })
);

const simpleConnectionDetailsSchema = (
  defaultValues: SimpleConnectionDetails<string>
) =>
  yup.object({
    type: producerTypeSchema,
    address: yup.string().trim().required().default(defaultValues.address),
    port: yup
      .number()
      .required()
      .integer()
      .positive()
      .lessThan(2 ** 16)
      .default(defaultValues.port),
  });

const optitrackConnectionDetailsSchema = (
  defaultValues: Omit<OptitrackConnectionDetails, "type">
) =>
  yup.object({
    type: producerTypeSchema,
    connectionType: yup
      .string()
      .oneOf(["Multicast", "Unicast"])
      .required()
      .default(defaultValues.connectionType),
    serverCommandPort: yup
      .number()
      .required()
      .integer()
      .positive()
      .lessThan(2 ** 16)
      .default(defaultValues.serverCommandPort),
    serverDataPort: yup
      .number()
      .required()
      .integer()
      .positive()
      .lessThan(2 ** 16)
      .default(defaultValues.serverDataPort),
    serverAddress: yup
      .string()
      .trim()
      .required()
      .default(defaultValues.serverAddress),
    localAddress: yup
      .string()
      .trim()
      .required()
      .default(defaultValues.localAddress),
    multicastAddress: yup
      .string()
      .trim()
      .when("connectionType", ([connectionType], schema) => {
        return connectionType === "Multicast" ? schema.required() : schema;
      })
      .default(defaultValues.multicastAddress),
  });

const producerConnectionDetailsSchemas: Record<
  ProducerConnectionDetails["type"],
  yup.Schema
> = {
  AxisStudio: simpleConnectionDetailsSchema({
    type: "AxisStudio",
    address: "127.0.0.1",
    port: 7004,
  }),
  Vicon: simpleConnectionDetailsSchema({
    type: "Vicon",
    address: "127.0.0.1",
    port: 801,
  }),
  Xsens: simpleConnectionDetailsSchema({
    type: "Xsens",
    address: "127.0.0.1",
    port: 9763,
  }),
  Development: developmentDetailsSchema.value,
  Optitrack: optitrackConnectionDetailsSchema({
    connectionType: "Multicast",
    serverCommandPort: 1510,
    serverDataPort: 1511,
    serverAddress: "127.0.0.1",
    localAddress: "127.0.0.1",
    multicastAddress: "239.255.42.99",
  }),
};

const onProducerTypeChange = (
  evt: Event,
  setValues: (...args: any) => void
) => {
  producerType.value = (evt.target as HTMLSelectElement)
    .value as ProducerConnectionDetails["type"];
  setValues({
    ...producerConnectionDetailsSchemas[producerType.value].getDefault(),
    type: producerType.value,
  });
};
</script>
<template>
  <Form
    class="w-full flex flex-col gap-2"
    v-slot="{ setValues }"
    :initial-values="
      initial ?? {
        type: 'AxisStudio',
        address: '127.0.0.1',
        port: 7004,
      }
    "
    :validation-schema="producerConnectionDetailsSchemas[producerType]"
    @submit="args => onSubmit(args as ProducerConnectionDetails)"
  >
    <button type="submit" class="btn btn-block btn-primary my-4">
      Start Sending
    </button>
    <div tabindex="0" class="collapse collapse-arrow border border-slate-400">
      <input type="checkbox" />
      <div class="collapse-title text-md font-medium">Connection Details</div>
      <div class="collapse-content">
        <label class="flex flex-col">
          <span>What are you sending from?</span>
          <Field
            class="select w-full input-bordered"
            name="type"
            as="select"
            @change="(evt) => onProducerTypeChange(evt, setValues)"
          >
            <option v-for="option in producerOptionTypes" :value="option.value">
              {{ option.label }}
            </option>
          </Field>
        </label>
        <ErrorMessage class="block text-error text-sm" name="type" />

        <fieldset v-if="isSimpleProducerType">
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
        </fieldset>

        <fieldset v-if="producerType === 'Optitrack'">
          <label>
            <span>Connection Type</span>
            <Field
              class="select w-full input-bordered"
              name="connectionType"
              as="select"
            >
              <option :value="'Multicast'">Multicast</option>
              <option :value="'Unicast'">Unicast</option>
            </Field>
          </label>
          <ErrorMessage
            class="block text-error text-sm"
            name="connectionType"
          />

          <label>
            <span>Server Command Port</span>
            <Field
              class="input input-bordered w-full mb-2"
              name="serverCommandPort"
            />
          </label>
          <ErrorMessage
            class="block text-error text-sm"
            name="serverCommandPort"
          />

          <label>
            <span>Server Data Port</span>
            <Field
              class="input input-bordered w-full mb-2"
              name="serverDataPort"
            />
          </label>
          <ErrorMessage
            class="block text-error text-sm"
            name="serverDataPort"
          />

          <label>
            <span>Server Address</span>
            <Field
              class="input input-bordered w-full mb-2"
              name="serverAddress"
            />
          </label>
          <ErrorMessage class="block text-error text-sm" name="serverAddress" />

          <label>
            <span>Local Address</span>
            <Field
              class="input input-bordered w-full mb-2"
              name="localAddress"
            />
          </label>
          <ErrorMessage class="block text-error text-sm" name="localAddress" />

          <label>
            <span>Multicast Address</span>
            <Field
              class="input input-bordered w-full mb-2"
              name="multicastAddress"
            />
          </label>
          <ErrorMessage
            class="block text-error text-sm"
            name="multicastAddress"
          />
        </fieldset>
      </div>
    </div>
  </Form>
</template>
