import Vue from "vue";
import VueCompositionAPI from "@vue/composition-api";
import axios from "axios";
import App from "./App.vue";

// setup axios
axios.defaults.baseURL = "http://localhost:4000";

Vue.use(VueCompositionAPI);

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount("#app");
