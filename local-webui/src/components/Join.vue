<template>
  <b-modal
    id="join-modal"
    ref="joinModal"
    size="sm"
    title="💃 Join MocapStreamer 💃"
    header-class="d-flex justify-content-center"
    hide-header-close
    hide-footer
    no-close-on-esc
    no-close-on-backdrop
    centered
    visible
  >
    <h6>Welcome to MocapStreamer</h6>
    <p class="mb-5">Please enter MocapStreamer URL</p>
    <validation-observer v-slot="{ handleSubmit, invalid }">
      <b-form @submit.prevent="handleSubmit(join)">
        <validation-provider
          rules="required|isIpWithPort"
          name="Remote URL"
          v-slot="{ errors }"
        >
          <b-input-group class="my-2">
            <b-input-group-prepend>
              <b-button class="border" disabled>ws://</b-button>
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
        </validation-provider>

        <!-- <ValidationProvider
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
        </ValidationProvider> -->

        <div class="d-flex justify-content-end my-2">
          <b-button type="submit" block :disabled="invalid" variant="primary">
            Join
          </b-button>
        </div>
      </b-form>
    </validation-observer>
  </b-modal>
</template>

<script lang="ts" setup>
import axios from "axios";
import { ref, Ref } from "@vue/composition-api";
import { registerUiWithRemote } from "../hooks/useRemote";

const REMOTE_SERVER_URL =
  process.env.NODE_ENV === "production"
    ? "46.101.24.208:3000"
    : "127.0.0.1:3000";

const joinModal: Ref<any> = ref(undefined);

    const url = ref(REMOTE_SERVER_URL);
    const name = ref("");

    axios
      .get("/api/remote/name")
      .then((res) => (name.value = res.data))
      .catch((err) => {
        console.log(
          "NOTE: Error probably means you are not connected to the remote streamer. Please ignore"
        );
      });

    function join() {
      registerUiWithRemote(`ws://${url.value}`)
        .then((ws) => {
          // handle WS disconnect
          ws.onclose = () => {
            root.$bvToast.toast("You got disconnected!", {
              noCloseButton: true,
              variant: "danger",
              toaster: "b-toaster-bottom-center",
            });

            joinModal.value.show();
          };

          joinModal.value.hide();

          // console.log(`⚡ Asking local streamer to join the remote.`);

          // return axios.post(`api/remote/join/${name.value}`, {
          //   url: url.value,
          // });
        })
        // .then((_res) => {
        //   console.log(`⚡ Local streamer joined.`);
        //   clientName.value = name.value;
        // })
        // .catch((err) => {
        //   console.log(
        //     `⚡Unable to contact local streamer, it may not be running.`
        //   );

        //   root.$bvToast.toast(
        //     `Unable to contact local streamer, it may not be running.\n If you are just running the UI you can ignore this message.`,
        //     {
        //       noCloseButton: true,
        //       solid: true,
        //       variant: "warning",
        //       toaster: "b-toaster-bottom-center",
        //     }
        //   );
        // })
        .catch((err) => {
          console.error(err);
          root.$bvToast.toast("Unable to connect to MocapStreamer", {
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
