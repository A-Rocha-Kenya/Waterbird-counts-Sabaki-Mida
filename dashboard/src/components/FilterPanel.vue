<template>
  <aside class="panel filter-panel">
    <div class="filter-header">
      <h2>Species explorer</h2>
      <button class="secondary-button" type="button" @click="$emit('reset')">Reset</button>
    </div>

    <fieldset class="filter-group">
      <legend>Site</legend>
      <div class="site-list">
        <label v-for="site in options.sites" :key="site" class="site-option">
          <input :checked="filters.sites.includes(site)" type="checkbox" @change="toggleSite(site)" />
          <span>{{ site }}</span>
        </label>
      </div>
    </fieldset>

    <div class="filter-group">
      <span>Species</span>
      <div v-if="selectedSpecies" class="species-selected-card">
        <strong>{{ selectedSpecies.vernacularName }}</strong>
        <small>{{ selectedSpecies.scientificName }}</small>
      </div>
      <label class="species-search-shell">
        <span class="species-search-label">Search</span>
        <input
          v-model.trim="filters.speciesSearch"
          class="species-search-input"
          type="search"
          placeholder="English or Latin name"
        />
      </label>
      <div class="species-search-results">
        <button
          v-for="taxon in speciesOptions"
          :key="taxon.value"
          class="species-result"
          :class="{ 'species-result-active': filters.selectedTaxon === taxon.value }"
          type="button"
          @click="filters.selectedTaxon = taxon.value"
        >
          <strong>{{ taxon.vernacularName }}</strong>
          <small>{{ taxon.scientificName }}</small>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from "vue";

defineEmits(["reset"]);

const props = defineProps({
  filters: { type: Object, required: true },
  options: { type: Object, required: true },
  allSpeciesOptions: { type: Array, default: () => [] },
  speciesOptions: { type: Array, default: () => [] }
});

const selectedSpecies = computed(() =>
  props.allSpeciesOptions.find((taxon) => taxon.value === props.filters.selectedTaxon) || null
);

function toggleSite(site) {
  const index = props.filters.sites.indexOf(site);
  if (index >= 0) {
    props.filters.sites.splice(index, 1);
  } else {
    props.filters.sites.push(site);
  }
}
</script>
