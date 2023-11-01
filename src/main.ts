import { createHead } from "@vueuse/head";
import { createApp } from "vue";
import App from "./App.vue";
import "./samples/node-api";
import "./style.css";
import ConnectPage from "./views/pages/ConnectPage.vue";
import Dashboard from "./views/pages/Dashboard.vue";
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { OhVueIcon, addIcons } from "oh-vue-icons";
import {
  FaSpinner,
  HiArrowLeft,
  HiXCircle,
  HiInformationCircle,
  HiExclamationCircle,
} from "oh-vue-icons/icons";

addIcons(
  FaSpinner,
  HiArrowLeft,
  HiXCircle,
  HiInformationCircle,
  HiExclamationCircle
);

const app = createApp(App);
const head = createHead();

app.component("v-icon", OhVueIcon);

const routes: ReadonlyArray<RouteRecordRaw> = [
  { path: "/", component: ConnectPage },
  { path: "/dashboard", component: Dashboard },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

app.use(head);
app.use(router);

app.mount("#app").$nextTick(() => {
  postMessage({ payload: "removeLoading" }, "*");
});
