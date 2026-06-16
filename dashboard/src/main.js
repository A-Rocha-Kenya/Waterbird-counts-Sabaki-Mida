import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import routerOptions from "./router";
import "./styles.css";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routerOptions
});

createApp(App).use(router).mount("#app");
