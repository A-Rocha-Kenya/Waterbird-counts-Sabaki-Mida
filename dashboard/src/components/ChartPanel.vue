<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h2>{{ title }}</h2>
        <p v-if="note">{{ note }}</p>
      </div>
      <label v-if="metrics.length" class="panel-control">
        <span>Show</span>
        <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
          <option v-for="metric in metrics" :key="metric.key" :value="metric.key">
            {{ metric.label }}
          </option>
        </select>
      </label>
    </div>
    <div ref="container" class="chart-surface" :class="{ 'tall-chart': tall }"></div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  title: { type: String, required: true },
  note: { type: String, default: "" },
  rows: { type: Array, required: true },
  metrics: { type: Array, default: () => [] },
  modelValue: { type: String, default: "" },
  optionBuilder: { type: Function, required: true },
  tall: { type: Boolean, default: false }
});

defineEmits(["update:modelValue"]);

const container = ref(null);
let chart;

function render() {
  if (!container.value) return;
  if (!chart) chart = echarts.init(container.value);
  chart.setOption(props.optionBuilder(props.rows), true);
}

onMounted(() => {
  render();
  window.addEventListener("resize", render);
});

watch(() => [props.rows, props.modelValue], render, { deep: true });

onBeforeUnmount(() => {
  window.removeEventListener("resize", render);
  if (chart) chart.dispose();
});
</script>
