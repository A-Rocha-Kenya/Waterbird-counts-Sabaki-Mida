<template>
  <section class="card-grid">
    <article class="metric-card species-hero-card">
      <p class="metric-label">Species</p>
      <p class="metric-value metric-value-species">{{ summary.vernacularName }}</p>
      <p class="metric-note"><em>{{ summary.scientificName }}</em></p>
      <p v-if="summary.taxonomicOrder" class="metric-note">Order: {{ summary.taxonomicOrder }}</p>
    </article>
    <article class="metric-card">
      <p class="metric-label">Individuals</p>
      <p class="metric-value">{{ formatNumber(summary.individuals) }}</p>
    </article>
    <article class="metric-card">
      <p class="metric-label">Observations</p>
      <p class="metric-value">{{ formatNumber(summary.observations) }}</p>
    </article>
    <article class="metric-card">
      <p class="metric-label">Occupied events</p>
      <p class="metric-value">{{ formatNumber(summary.occupiedEvents) }}</p>
      <p class="metric-note">{{ summary.sites }}</p>
    </article>
    <article class="metric-card">
      <p class="metric-label">Date range</p>
      <p class="metric-value metric-value-small">{{ summary.firstDate }} to {{ summary.lastDate }}</p>
    </article>
  </section>
</template>

<script setup>
import { formatNumber } from "../utils/formatters";

defineProps({
  summary: { type: Object, required: true }
});
</script>
