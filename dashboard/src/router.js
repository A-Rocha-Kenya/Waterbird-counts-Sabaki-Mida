import DashboardShell from "./components/DashboardShell.vue";

export default [
  {
    path: "/",
    redirect: "/overview"
  },
  {
    path: "/overview",
    name: "overview",
    component: DashboardShell
  },
  {
    path: "/species",
    name: "species",
    component: DashboardShell
  }
];
