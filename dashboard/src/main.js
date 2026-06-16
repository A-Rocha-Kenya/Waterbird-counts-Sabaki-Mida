import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import App from "./App.vue";
import routerOptions from "./router";
import "./styles.css";

const router = createRouter({
  history: createWebHashHistory(),
  routes: routerOptions
});

createApp(App).use(router).mount("#app");
