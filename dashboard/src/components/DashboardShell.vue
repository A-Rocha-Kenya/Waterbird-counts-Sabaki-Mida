<template>
  <div class="dashboard-shell">
    <header class="dashboard-header">
      <div>
        <p class="eyebrow">Interactive explorer</p>
        <h1>Waterbird Counts Dashboard</h1>
      </div>
      <nav class="quick-links">
        <button class="secondary-button mobile-filter-button" type="button" @click="filtersOpen = !filtersOpen">
          {{ filtersOpen ? "Hide filters" : "Show filters" }}
        </button>
        <a href="../index.html">Overview</a>
        <a href="../script/01_data_checks.html">Data checks</a>
        <a href="../script/02_export_outputs.html">Exports</a>
      </nav>
    </header>

    <nav class="view-tabs">
      <RouterLink class="view-tab" :class="{ 'view-tab-active': activeView === 'overview' }" to="/overview">
        Site overview
      </RouterLink>
      <RouterLink class="view-tab" :class="{ 'view-tab-active': activeView === 'species' }" to="/species">
        Species explorer
      </RouterLink>
    </nav>

    <LoadingState v-if="loading" />
    <EmptyState v-else-if="error" title="Dashboard data could not be loaded" :message="error.message" />
    <template v-else-if="data && metadata">
      <div class="dashboard-layout">
        <div
          v-if="activeView === 'species'"
          class="filter-drawer"
          :class="{ 'filter-drawer-open': filtersOpen }"
        >
          <FilterPanel
            :filters="filters"
            :options="sharedOptions"
            :all-species-options="speciesIndex"
            :species-options="speciesSearchResults"
            @reset="reset"
          />
        </div>

        <OverviewView
          v-if="activeView === 'overview'"
          :summary="overviewSummary"
          :event-rows="overviewEventRows"
          :year-rows="overviewYearRows"
          :richness-rows="overviewRichnessRows"
          :species-rows="overviewSpeciesRows"
        />

        <SpeciesView
          v-else
          :summary="speciesSummary"
          :year-abundance-rows="speciesYearAbundance"
          :year-frequency-rows="speciesYearFrequency"
          :month-abundance-rows="speciesMonthAbundance"
          :month-frequency-rows="speciesMonthFrequency"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import LoadingState from "./LoadingState.vue";
import EmptyState from "./EmptyState.vue";
import FilterPanel from "./FilterPanel.vue";
import OverviewView from "./OverviewView.vue";
import SpeciesView from "./SpeciesView.vue";
import { useDashboardData } from "../composables/useDashboardData";
import { useDashboardViews } from "../composables/useDashboardViews";

const route = useRoute();
const { data, error, loading, load } = useDashboardData();
const filtersOpen = ref(false);

const filters = reactive({
  sites: [],
  speciesSearch: "",
  selectedTaxon: ""
});

onMounted(load);

const metadata = computed(() => data.value?.metadata ?? null);
const activeView = computed(() => route.name === "species" ? "species" : "overview");

const {
  speciesIndex,
  speciesSearchResults,
  overviewEventRows,
  overviewSummary,
  overviewYearRows,
  overviewRichnessRows,
  overviewSpeciesRows,
  speciesSummary,
  speciesYearAbundance,
  speciesMonthAbundance,
  speciesYearFrequency,
  speciesMonthFrequency
} = useDashboardViews(data, filters);

watch(
  speciesIndex,
  (rows) => {
    if (!rows.length) return;
    if (!filters.selectedTaxon || !rows.some((row) => row.value === filters.selectedTaxon)) {
      filters.selectedTaxon = rows[0].value;
    }
  },
  { immediate: true }
);

const sharedOptions = computed(() => ({
  sites: metadata.value?.filters?.sites || []
}));

function reset() {
  filters.sites = [];
  filters.speciesSearch = "";
  filters.selectedTaxon = speciesIndex.value[0]?.value || "";
}
</script>
