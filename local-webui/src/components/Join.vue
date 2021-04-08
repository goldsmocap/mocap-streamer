<template>
  <b-modal
    id="join-modal"
    ref="joinModal"
    size="sm"
    title="💃 Join Remote Streamer 💃"
    header-class="d-flex justify-content-center"
    hide-header-close
    hide-footer
    no-close-on-esc
    no-close-on-backdrop
    centered
    visible
  >
    <h6>Welcome to Axis-Streamer</h6>
    <p class="mb-5">
      Please provide a name for yourself and join the remote streamer.
    </p>
    <ValidationObserver v-slot="{ handleSubmit, invalid }">
      <b-form @submit.prevent="handleSubmit(join)">
        <ValidationProvider
          rules="required|isIpWithPort"
          name="Remote URL"
          v-slot="{ errors }"
        >
          <b-input-group class="my-2">
            <b-input-group-prepend>
              <b-button class="border" disabled>
                <b-icon icon="globe" />
              </b-button>
            </b-input-group-prepend>
            <b-input type="text" v-model="url" />
          </b-input-group>
          <small
            v-for="(err, i) in errors"
            class="d-block text-danger"
            :key="`name-err-${i}`"
          >
            {{ err }}
          </small>
        </ValidationProvider>

        <ValidationProvider
          rules="required"
          name="Client name"
          v-slot="{ errors }"
        >
          <b-input-group class="my-2">
            <b-input-group-prepend>
              <b-button class="border" disabled>
                <b-icon class="text-white" icon="person" />
              </b-button>
            </b-input-group-prepend>
            <b-input type="text" v-model="name" />
          </b-input-group>
          <small
            v-for="(err, i) in errors"
            class="d-block text-danger"
            :key="`name-err-${i}`"
          >
            {{ err }}
          </small>
        </ValidationProvider>

        <div class="d-flex justify-content-end my-2">
          <b-button type="submit" :disabled="invalid" variant="primary">
            Join
          </b-button>
        </div>
      </b-form>
    </ValidationObserver>
  </b-modal>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from "@vue/composition-api";
import axios from "axios";
import { registerUiWithRemote } from "../hooks/useRemote";

const REMOTE_SERVER_URL =
  process.env.NODE_ENV === "production"
    ? "http://46.101.24.208"
    : "http://127.0.0.1:3000";

export default defineComponent({
  setup(props, { root }) {
    const joinModal: Ref<any> = ref(undefined);

    const url = ref(REMOTE_SERVER_URL);
    const name = ref("");

    function join() {
      registerUiWithRemote(REMOTE_SERVER_URL)
        .then((_) => {
          console.log(`⚡ Asking local streamer to join the remote.`);
          return axios.post(`api/remote/join/${name.value}`, {
            url: url.value,
          });
        })
        .then((_res) => {
          console.log(`⚡ Local streamer joined.`);
          joinModal.value.hide();
        })
        .catch((err) => {
          root.$bvToast.toast(`${err.response.data}`, {
            noCloseButton: true,
            solid: true,
            variant: "danger",
            toaster: "b-toaster-bottom-center",
          });
        });
    }

    return {
      joinModal,
      url,
      name,
      join,
    };
  },
});
</script>
