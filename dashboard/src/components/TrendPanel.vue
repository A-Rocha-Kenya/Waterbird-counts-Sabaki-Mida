<template>
  <section class="panel">
    <div class="panel-header">
      <h2>{{ title }}</h2>
    </div>
    <div ref="container" class="chart-surface"></div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  title: { type: String, required: true },
  optionBuilder: { type: Function, required: true },
  rows: { type: Array, required: true }
});

const container = ref(null);
let chart;

function render() {
  if (!container.value) return;
  if (!chart) {
    chart = echarts.init(container.value);
  }
  chart.setOption(props.optionBuilder(props.rows), true);
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
