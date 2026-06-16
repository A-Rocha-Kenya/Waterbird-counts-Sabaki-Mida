<template>
  <section class="panel">
    <div class="panel-header">
      <h2>Species rankings</h2>
      <label class="panel-control">
        <span>Show</span>
        <select v-model="selectedMetricKey">
          <option v-for="option in metricOptions" :key="option.key" :value="option.key">
            {{ option.label }}
          </option>
        </select>
      </label>
    </div>
    <div ref="container" class="chart-surface tall-chart"></div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";
import { speciesRankOption } from "../charts/speciesRankChart";

const props = defineProps({
  rows: { type: Array, required: true }
});

const metricOptions = [
  { key: "individuals", label: "Total abundance" },
  { key: "observations", label: "Total observations" },
  { key: "occupiedEvents", label: "Occupied events" },
  { key: "yearsPresent", label: "Years present" }
];

const container = ref(null);
const selectedMetricKey = ref("individuals");
const selectedMetric = computed(() =>
  metricOptions.find((option) => option.key === selectedMetricKey.value) || metricOptions[0]
);
const sortedRows = computed(() =>
  [...props.rows].sort((a, b) => {
    const difference = Number(b[selectedMetric.value.key] || 0) - Number(a[selectedMetric.value.key] || 0);
    if (difference !== 0) return difference;
    return (a.vernacularName || a.scientificName || "").localeCompare(b.vernacularName || b.scientificName || "");
  })
);

let chart;

function render() {
  if (!container.value) return;
  if (!chart) chart = echarts.init(container.value);
  chart.setOption(speciesRankOption(sortedRows.value, selectedMetric.value), true);
}

onMounted(() => {
  render();
  window.addEventListener("resize", render);
});

watch([() => props.rows, selectedMetricKey], render, { deep: true });

onBeforeUnmount(() => {
  window.removeEventListener("resize", render);
  if (chart) chart.dispose();
});
</script>
