import Vue from "vue";
import VueCompositionAPI from "@vue/composition-api";
import axios from "axios";
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
import validator from "validator";
import { ValidationProvider, ValidationObserver, extend } from "vee-validate";
import * as rules from "vee-validate/dist/rules";
import App from "./App.vue";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import "./assets/custom.scss";

// setup axios
axios.defaults.baseURL = "http://localhost:4000";

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.use(VueCompositionAPI);

Vue.component("ValidationProvider", ValidationProvider);
Vue.component("ValidationObserver", ValidationObserver);

// Add validation rules
for (const [rule, validation] of Object.entries(rules)) {
  extend(rule, {
    ...validation,
  });
}
extend("isFqdnOrIp", (str) => validator.isFQDN(str) || validator.isIP(str));

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount("#app");
