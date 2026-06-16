<template>
  <main class="dashboard-main view-stack">
    <EmptyState
      v-if="!summary"
      title="Select a species"
      message="Choose one species from the filter panel to explore annual and seasonal patterns."
    />
    <template v-else>
      <section class="dashboard-section">
        <SpeciesSummaryCards :summary="summary" />
      </section>

      <section class="dashboard-section dashboard-grid-two">
        <TrendPanel title="Annual abundance" :rows="yearAbundanceRows" :option-builder="yearlyTotalsOption" />
        <TrendPanel title="Annual frequency" :rows="yearFrequencyRows" :option-builder="frequencyByYearOption" />
      </section>

      <section class="dashboard-section dashboard-grid-two">
        <TrendPanel title="Seasonal abundance" :rows="monthAbundanceRows" :option-builder="seasonalChartOption" />
        <TrendPanel title="Seasonal frequency" :rows="monthFrequencyRows" :option-builder="frequencyByMonthOption" />
      </section>
    </template>
  </main>
</template>

<script setup>
import EmptyState from "./EmptyState.vue";
import SpeciesSummaryCards from "./SpeciesSummaryCards.vue";
import TrendPanel from "./TrendPanel.vue";
import { yearlyTotalsOption } from "../charts/yearlyTotalsChart";
import { seasonalChartOption } from "../charts/seasonalChart";
import { frequencyByYearOption } from "../charts/frequencyByYearChart";
import { frequencyByMonthOption } from "../charts/frequencyByMonthChart";

defineProps({
  summary: { type: Object, default: null },
  yearAbundanceRows: { type: Array, required: true },
  yearFrequencyRows: { type: Array, required: true },
  monthAbundanceRows: { type: Array, required: true },
  monthFrequencyRows: { type: Array, required: true }
});
</script>
