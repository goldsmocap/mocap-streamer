import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import { createHead } from "@vueuse/head";
import App from "./App.vue";
import ConnectPage from "./pages/ConnectPage.vue";
import DashboardPage from "./pages/DashboardPage.vue";

const app = createApp(App);
const head = createHead();

const routes = [
  { path: "/", component: ConnectPage },
  { path: "/dashboard", component: DashboardPage },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

app.use(head);
app.use(router);

app.mount("#app");
