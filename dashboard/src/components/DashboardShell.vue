<template>
  <div class="dashboard-shell">
    <header class="site-header">
      <nav class="site-navbar" aria-label="Primary">
        <div class="site-navbar-brand">
          <a class="site-brand-link" href="../index.html">Waterbird Counts at Sabaki River Mouth and Mida Creek</a>
        </div>

        <div class="site-navbar-links">
          <div class="site-navbar-main">
            <a class="site-nav-link" href="../index.html">Overview</a>
            <a class="site-nav-link" href="../script/01_data_checks.html">Data Checks</a>
            <a class="site-nav-link" href="../script/02_export_outputs.html">Exports</a>
            <a class="site-nav-link site-nav-link-active" href="./index.html">Dashboard</a>
          </div>

          <div class="site-navbar-tools">
            <a class="site-nav-link" href="../assets/Notebook_Instruction.pdf">Field Notebook</a>
            <a
              class="site-icon-link"
              href="https://github.com/A-Rocha-Kenya/Waterbird-counts-Sabaki-Mida"
              aria-label="GitHub repository"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38
                  0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52
                  -.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2
                  -3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65
                  7.65 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15
                  0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01
                  8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
                />
              </svg>
            </a>
          </div>
        </div>
      </nav>
    </header>

    <LoadingState v-if="loading" />
    <EmptyState v-else-if="error" title="Dashboard data could not be loaded" :message="error.message" />
    <main v-else-if="data" class="dashboard-main view-stack">
      <section class="filter-strip panel">
        <div class="filter-group-inline">
          <span class="filter-inline-label">Sites</span>
          <div class="site-filter">
            <label v-for="site in siteOptions" :key="site" class="inline-checkbox">
              <input v-model="selectedSites" type="checkbox" :value="site" />
              <span>{{ site }}</span>
            </label>
          </div>
        </div>

        <div class="filter-group-inline species-picker-shell">
          <span class="filter-inline-label">Species</span>
          <div class="species-picker">
            <input
              v-model="speciesQuery"
              class="species-search-input"
              placeholder="All species"
              @focus="speciesMenuOpen = true"
              @blur="closeSpeciesMenu"
            />
            <div v-if="speciesMenuOpen && filteredSpeciesOptions.length" class="species-menu">
              <button
                v-for="species in filteredSpeciesOptions"
                :key="species.value"
                class="species-menu-option"
                type="button"
                @mousedown.prevent="selectSpecies(species)"
              >
                <span>{{ species.displayLabel }}</span>
                <small>{{ species.scientificName }}</small>
              </button>
            </div>
          </div>
        </div>

        <button v-if="selectedSpecies" class="secondary-button" type="button" @click="clearSpecies">
          Clear species
        </button>
      </section>

      <section class="card-grid">
        <article v-for="card in summaryCards" :key="card.label" class="metric-card">
          <p class="metric-label">{{ card.label }}</p>
          <p class="metric-value" :class="{ 'metric-value-small': card.small }">{{ card.value }}</p>
          <p v-if="card.note" class="metric-note">{{ card.note }}</p>
        </article>
      </section>

      <section class="dashboard-section">
        <ChartPanel
          v-model="heatmapMetricKey"
          title="Monthly heatmap"
          :note="heatmapNote"
          :rows="heatmapRows"
          :metrics="currentHeatmapMetrics"
          :option-builder="heatmapOptionBuilder"
        />

        <ChartPanel
          v-model="annualMetricKey"
          title="Annual trend"
          :note="annualNote"
          :rows="annualRows"
          :metrics="currentAnnualMetrics"
          :option-builder="annualOptionBuilder"
        />

        <ChartPanel
          v-if="selectedSpecies"
          v-model="seasonalMetricKey"
          title="Seasonal trend"
          :note="seasonalNote"
          :rows="seasonalRows"
          :metrics="currentSeasonalMetrics"
          :option-builder="seasonalOptionBuilder"
        />
      </section>

      <ChartPanel
        v-if="!selectedSpecies"
        v-model="rankingMetricKey"
        title="Species ranking"
        note="Top species within the selected sites."
        :rows="rankingRows"
        :metrics="rankingMetrics"
        :option-builder="rankingOptionBuilder"
        tall
      />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import LoadingState from "./LoadingState.vue";
import EmptyState from "./EmptyState.vue";
import ChartPanel from "./ChartPanel.vue";
import { useDashboardData } from "../composables/useDashboardData";
import { useDashboardModel } from "../composables/useDashboardModel";

const { data, error, loading, load } = useDashboardData();

const {
  annualMetricKey,
  annualNote,
  annualOptionBuilder,
  annualRows,
  clearSpecies,
  closeSpeciesMenu,
  currentAnnualMetrics,
  currentHeatmapMetrics,
  currentSeasonalMetrics,
  filteredSpeciesOptions,
  heatmapMetricKey,
  heatmapNote,
  heatmapOptionBuilder,
  heatmapRows,
  rankingMetricKey,
  rankingMetrics,
  rankingOptionBuilder,
  rankingRows,
  selectSpecies,
  selectedSites,
  selectedSpecies,
  seasonalMetricKey,
  seasonalNote,
  seasonalOptionBuilder,
  seasonalRows,
  siteOptions,
  speciesMenuOpen,
  speciesQuery,
  summaryCards
} = useDashboardModel(data);

onMounted(load);
</script>
