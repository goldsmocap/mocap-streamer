import Remote from "../components/remote/Remote.vue";
import Local from "../components/local/Local.vue";

export const routes = [
  { name: "remote", path: "/remote", component: Remote },
  { name: "local", path: "/local", component: Local },
];
