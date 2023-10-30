import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import "./samples/node-api";

/* import the fontawesome core */
import { library } from "@fortawesome/fontawesome-svg-core";

/* import font awesome icon component */
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

/* import specific icons */
import { faSpinner, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

/* add icons to the library */
library.add(faSpinner, faArrowLeft);

createApp(App)
  .component("font-awesome-icon", FontAwesomeIcon)
  .mount("#app")
  .$nextTick(() => {
    postMessage({ payload: "removeLoading" }, "*");
  });
