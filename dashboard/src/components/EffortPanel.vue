<template>
  <section class="panel">
    <div class="panel-header">
      <h2>Survey effort heatmap</h2>
      <p>Number of taxon observations per month and year under the current filters.</p>
    </div>
    <div ref="container" class="chart-surface tall-chart"></div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";
import { effortHeatmapOption } from "../charts/effortHeatmapChart";

const props = defineProps({
  rows: { type: Array, required: true }
});

const container = ref(null);
let chart;

function render() {
  if (!container.value) return;
  if (!chart) chart = echarts.init(container.value);
  chart.setOption(effortHeatmapOption(props.rows), true);
}

onMounted(() => {
  render();
  window.addEventListener("resize", render);
});

watch(() => props.rows, render, { deep: true });

onBeforeUnmount(() => {
  window.removeEventListener("resize", render);
  if (chart) chart.dispose();
});
</script>
