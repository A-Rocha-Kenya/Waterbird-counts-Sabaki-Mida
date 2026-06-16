<template>
  <main class="dashboard-main view-stack">
    <section class="dashboard-section">
      <SummaryCards :summary="summary" />
    </section>

    <section class="dashboard-section dashboard-grid-two">
      <TrendPanel title="Survey effort by year" :rows="yearRows" :option-builder="surveysByYearOption" />
      <TrendPanel title="Taxonomic richness by year" :rows="richnessRows" :option-builder="richnessByYearOption" />
    </section>

    <section class="dashboard-section">
      <EffortPanel :rows="eventRows" />
    </section>

    <section class="dashboard-section">
      <SpeciesPanel :rows="speciesRows" />
    </section>
  </main>
</template>

<script setup>
import SummaryCards from "./SummaryCards.vue";
import TrendPanel from "./TrendPanel.vue";
import EffortPanel from "./EffortPanel.vue";
import SpeciesPanel from "./SpeciesPanel.vue";
import { surveysByYearOption } from "../charts/surveysByYearChart";
import { richnessByYearOption } from "../charts/richnessByYearChart";

defineProps({
  summary: { type: Object, required: true },
  eventRows: { type: Array, required: true },
  yearRows: { type: Array, required: true },
  richnessRows: { type: Array, required: true },
  speciesRows: { type: Array, required: true }
});
</script>
