<template>
  <section class="card-grid">
    <article v-for="card in cards" :key="card.label" class="metric-card">
      <p class="metric-label">{{ card.label }}</p>
      <p class="metric-value">{{ card.value }}</p>
      <p v-if="card.note" class="metric-note">{{ card.note }}</p>
    </article>
  </section>
</template>

<script setup>
import { computed } from "vue";
import { formatNumber } from "../utils/formatters";

const props = defineProps({
  summary: { type: Object, required: true }
});

const cards = computed(() => [
  { label: "Events", value: formatNumber(props.summary.events) },
  { label: "Taxa", value: formatNumber(props.summary.taxa) },
  { label: "Observations", value: formatNumber(props.summary.observations) },
  { label: "Individuals", value: formatNumber(props.summary.individuals) }
]);
</script>
