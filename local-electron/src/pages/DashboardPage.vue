<script lang="ts" setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { UserCircleIcon, EyeIcon, LogoutIcon } from "@heroicons/vue/solid";
import { remoteBaseUrl } from "../remote";
import { managingLocalServer, nameOnRemote, postJoin } from "../server";
import Modal from "../components/Modal.vue";
import ClientTable from "../components/ClientTable.vue";

const router = useRouter();

// join
const joinOpen = ref(false);
const joinName = ref("");
const join = () => {
  postJoin(`ws://${remoteBaseUrl.value}`, joinName.value, () => router.push("/"))
    .then(() => {
      joinOpen.value = false;
      joinName.value = "";
    })
    .catch((err) => {});
};
watch(managingLocalServer, (newValue) => (joinOpen.value = !newValue));

// local server
function manageLocalServer() {
  joinOpen.value = true;
}

// leave
function leave() {
  fetch(`http://${remoteBaseUrl.value}/api/leave/${nameOnRemote.value}`)
    .then(() => (joinOpen.value = false))
    .catch((err) => console.error(err));
}
</script>

<template>
  <div class="w-screen h-screen p-1 sm:p-2 md:p-4 lg:p-8">
    <div class="rounded-lg w-full h-full bg-white border shadow-xl text-black p-4">
      <!-- Header -->
      <div class="mb-8">
        <div v-if="managingLocalServer" class="flex items-center">
          <div class="grow">
            <div class="flex items-center">
              <user-circle-icon class="w-8 mr-2" /> {{ nameOnRemote }}
            </div>
          </div>
          <div class="shrink">
            <button class="btn" @click="leave">
              <div class="flex items-center">
                <div><logout-icon class="w-6 mr-2" /></div>
                <div>Leave</div>
              </div>
            </button>
          </div>
        </div>
        <div v-else class="flex">
          <div class="grow flex items-center">
            <eye-icon class="w-8 mr-2" /> Anonymous observer.
          </div>
          <div class="shrink">
            <button class="btn" @click="manageLocalServer">Local Server</button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <client-table />
    </div>
  </div>

  <modal v-if="joinOpen" v-model:open="joinOpen">
    <p class="w-full text-center">Searching for a local server.</p>
    <div class="divider py-4" />
    <div class="form-control">
      <input
        class="input input-bordered w-full mb-2"
        type="text"
        placeholder="name on remote"
        v-model="nameOnRemote"
      />
    </div>
    <button class="btn btn-sm float-right" @click="join">Join</button>
  </modal>
</template>
