import "./plugins/composition-api"; // MUST BE FIRST IMPORT

import Vue from "vue";
import VueRouter from "vue-router";
import axios from "axios";
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
import VueKonva from "vue-konva";
import { ValidationProvider, ValidationObserver, extend } from "vee-validate";
import * as rules from "vee-validate/dist/rules";
import { routes } from "./routes";
import App from "./App.vue";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import "./assets/custom.scss";

// setup axios
///////////////////////////////////////////////////////////////////////////////
axios.defaults.baseURL = "http://localhost:4000";

// setup router
///////////////////////////////////////////////////////////////////////////////
Vue.use(VueRouter);

const router = new VueRouter({
  mode: "hash",
  routes,
});

// setup bootstrap
///////////////////////////////////////////////////////////////////////////////
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

// setup konva
Vue.use(VueKonva);

// setup vee validate
///////////////////////////////////////////////////////////////////////////////
Vue.component("ValidationProvider", ValidationProvider);
Vue.component("ValidationObserver", ValidationObserver);

// Add validation rules
for (const [rule, validation] of Object.entries(rules)) {
  extend(rule, {
    ...validation,
  });
}
extend("isIpWithPort", (str) => {
  const urlRegex = /^((0|[1-9][0-9]{0,2})\.){3}(0|[1-9][0-9]{0,2})(:(0|[1-9][0-9]{0,4}))?$/;
  const matches = str.match(urlRegex);
  return matches !== null;
});

// setup Vue
///////////////////////////////////////////////////////////////////////////////
Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
  router,
}).$mount("#app");
