import { computed, ref, watch } from "vue";
import { annualOption, heatmapOption, seasonalOption, speciesRankingOption } from "../charts/unifiedCharts";
import { formatNumber } from "../utils/formatters";

const overviewMetrics = [
  { key: "events", label: "Events", type: "bar" },
  { key: "richness", label: "Taxa richness" },
  { key: "individuals", label: "Individuals" },
  { key: "observations", label: "Observations" }
];

const speciesMetrics = [
  { key: "occurrences", label: "Occurrences", type: "bar" },
  { key: "individuals", label: "Individuals" },
  { key: "eventsPresent", label: "Events present", type: "bar" },
  { key: "frequency", label: "Frequency", format: "percent" }
];

const rankingMetrics = [
  { key: "individuals", label: "Individuals" },
  { key: "observations", label: "Observations" },
  { key: "eventsPresent", label: "Events present" },
  { key: "yearsPresent", label: "Years present" }
];

export function useDashboardModel(data) {
  const selectedSites = ref([]);
  const speciesQuery = ref("");
  const speciesMenuOpen = ref(false);
  const heatmapMetricKey = ref("individuals");
  const annualMetricKey = ref("events");
  const seasonalMetricKey = ref("occurrences");
  const rankingMetricKey = ref("individuals");

  const siteOptions = computed(() => data.value?.metadata?.filters?.sites || []);

  watch(
    siteOptions,
    (sites) => {
      if (selectedSites.value.length === 0 && sites.length > 0) {
        selectedSites.value = [...sites];
      }
    },
    { immediate: true }
  );

  const speciesIndex = computed(() => {
    if (!data.value) return [];

    const occurrenceCounts = countOccurrencesByTaxon(data.value.occurrences);

    return data.value.speciesLookup
      .filter((item) => item.taxonRank === "Species")
      .map((item) => ({
        value: item.taxonKey,
        scientificName: item.displayScientificName || item.scientificName,
        displayLabel: item.displayVernacularName || item.vernacularName || item.displayScientificName || item.scientificName,
        taxonomicSequence: item.avilist_sequence ?? null,
        occurrenceCount: occurrenceCounts.get(item.taxonKey) || 0
      }))
      .sort(compareSpeciesByOccurrence);
  });

  const normalizedSpeciesQuery = computed(() => speciesQuery.value.trim().toLowerCase());

  const selectedSpecies = computed(() =>
    speciesIndex.value.find((species) =>
      species.displayLabel.toLowerCase() === normalizedSpeciesQuery.value ||
      species.scientificName.toLowerCase() === normalizedSpeciesQuery.value
    ) || null
  );

  const filteredSpeciesOptions = computed(() => {
    if (!normalizedSpeciesQuery.value) return speciesIndex.value.slice(0, 10);

    return speciesIndex.value
      .filter((species) =>
        species.displayLabel.toLowerCase().includes(normalizedSpeciesQuery.value) ||
        species.scientificName.toLowerCase().includes(normalizedSpeciesQuery.value)
      )
      .slice(0, 10);
  });

  const filteredEvents = computed(() => {
    if (!data.value) return [];
    return data.value.events.filter((event) => selectedSites.value.includes(event.site));
  });

  const joinedRows = computed(() => {
    if (!data.value) return [];

    const eventMap = new Map(filteredEvents.value.map((event) => [event.eventID, event]));
    const speciesMap = new Map(data.value.speciesLookup.map((species) => [species.taxonKey, species]));

    return data.value.occurrences.flatMap((occurrence) => {
      const event = eventMap.get(occurrence.eventID);
      if (!event) return [];

      const species = speciesMap.get(occurrence.taxonKey) || {};
      return [{
        ...event,
        ...occurrence,
        displayLabel: species.displayVernacularName || occurrence.vernacularName || occurrence.scientificName,
        scientificName: species.displayScientificName || occurrence.scientificName
      }];
    });
  });

  const selectedRows = computed(() =>
    selectedSpecies.value
      ? joinedRows.value.filter((row) => row.taxonKey === selectedSpecies.value.value)
      : joinedRows.value
  );

  const currentHeatmapMetrics = computed(() => selectedSpecies.value ? speciesMetrics : overviewMetrics);
  const currentAnnualMetrics = computed(() => selectedSpecies.value ? speciesMetrics : overviewMetrics);
  const currentSeasonalMetrics = computed(() => speciesMetrics);
  const selectedHeatmapMetric = computed(() => findMetric(currentHeatmapMetrics.value, heatmapMetricKey.value));
  const selectedAnnualMetric = computed(() => findMetric(currentAnnualMetrics.value, annualMetricKey.value));
  const selectedSeasonalMetric = computed(() => findMetric(currentSeasonalMetrics.value, seasonalMetricKey.value));
  const selectedRankingMetric = computed(() => findMetric(rankingMetrics, rankingMetricKey.value));

  watch(selectedSpecies, (species) => {
    heatmapMetricKey.value = species ? "occurrences" : "individuals";
    annualMetricKey.value = species ? "occurrences" : "events";
    seasonalMetricKey.value = "occurrences";
  });

  const summaryCards = computed(() => {
    const totalEvents = filteredEvents.value.length;

    if (selectedSpecies.value) {
      const eventCount = new Set(selectedRows.value.map((row) => row.eventID)).size;

      return [
        {
          label: "Species",
          value: selectedSpecies.value.displayLabel,
          note: selectedSpecies.value.scientificName,
          small: true
        },
        { label: "Individuals", value: formatNumber(sumField(selectedRows.value, "individualCount")) },
        {
          label: "Occurrences",
          value: formatNumber(selectedRows.value.length),
          note: `${formatNumber(eventCount)} of ${formatNumber(totalEvents)} events`
        },
        { label: "Years present", value: formatNumber(new Set(selectedRows.value.map((row) => row.year)).size) }
      ];
    }

    return [
      { label: "Events", value: formatNumber(totalEvents) },
      { label: "Taxa", value: formatNumber(new Set(joinedRows.value.map((row) => row.taxonKey)).size) },
      { label: "Observations", value: formatNumber(joinedRows.value.length) },
      { label: "Individuals", value: formatNumber(sumField(joinedRows.value, "individualCount")) }
    ];
  });

  const heatmapRows = computed(() =>
    buildPeriodRows(selectedRows.value, filteredEvents.value, selectedHeatmapMetric.value.key, "month")
  );

  const annualRows = computed(() =>
    buildPeriodRows(selectedRows.value, filteredEvents.value, selectedAnnualMetric.value.key, "year")
  );

  const seasonalRows = computed(() =>
    buildPeriodRows(selectedRows.value, filteredEvents.value, selectedSeasonalMetric.value.key, "month", true)
  );

  const rankingRows = computed(() =>
    buildRankingRows(joinedRows.value, selectedRankingMetric.value.key)
  );

  const heatmapNote = computed(() =>
    selectedSpecies.value
      ? `${selectedHeatmapMetric.value.label} for ${selectedSpecies.value.displayLabel}, aggregated across selected sites.`
      : `${selectedHeatmapMetric.value.label} aggregated across selected sites.`
  );

  const annualNote = computed(() =>
    selectedSpecies.value
      ? `${selectedAnnualMetric.value.label} by year for ${selectedSpecies.value.displayLabel}.`
      : `${selectedAnnualMetric.value.label} by year across selected sites.`
  );

  const seasonalNote = computed(() =>
    selectedSpecies.value
      ? `${selectedSeasonalMetric.value.label} by month for ${selectedSpecies.value.displayLabel}.`
      : ""
  );

  function clearSpecies() {
    speciesQuery.value = "";
    speciesMenuOpen.value = false;
  }

  function selectSpecies(species) {
    speciesQuery.value = species.displayLabel;
    speciesMenuOpen.value = false;
  }

  function closeSpeciesMenu() {
    window.setTimeout(() => {
      speciesMenuOpen.value = false;
    }, 100);
  }

  return {
    annualMetricKey,
    annualNote,
    annualOptionBuilder: (rows) => annualOption(rows, selectedAnnualMetric.value),
    annualRows,
    clearSpecies,
    closeSpeciesMenu,
    currentAnnualMetrics,
    currentHeatmapMetrics,
    currentSeasonalMetrics,
    filteredSpeciesOptions,
    heatmapMetricKey,
    heatmapNote,
    heatmapOptionBuilder: (rows) => heatmapOption(rows, selectedHeatmapMetric.value),
    heatmapRows,
    rankingMetricKey,
    rankingMetrics,
    rankingOptionBuilder: (rows) => speciesRankingOption(rows, selectedRankingMetric.value),
    rankingRows,
    selectSpecies,
    selectedSites,
    selectedSpecies,
    seasonalMetricKey,
    seasonalNote,
    seasonalOptionBuilder: (rows) => seasonalOption(rows, selectedSeasonalMetric.value),
    seasonalRows,
    siteOptions,
    speciesMenuOpen,
    speciesQuery,
    summaryCards
  };
}

function compareSpeciesByOccurrence(a, b) {
  const occurrenceDifference = b.occurrenceCount - a.occurrenceCount;
  if (occurrenceDifference !== 0) return occurrenceDifference;

  if (a.taxonomicSequence == null && b.taxonomicSequence == null) {
    return a.displayLabel.localeCompare(b.displayLabel);
  }
  if (a.taxonomicSequence == null) return 1;
  if (b.taxonomicSequence == null) return -1;
  return a.taxonomicSequence - b.taxonomicSequence;
}

function countOccurrencesByTaxon(rows) {
  const counts = new Map();

  rows.forEach((row) => {
    counts.set(row.taxonKey, (counts.get(row.taxonKey) || 0) + 1);
  });

  return counts;
}

function findMetric(metrics, key) {
  return metrics.find((metric) => metric.key === key) || metrics[0];
}

function sumField(rows, field) {
  return rows.reduce((sum, row) => sum + Number(row[field] || 0), 0);
}

function buildRankingRows(rows, metricKey) {
  const grouped = new Map();

  rows.forEach((row) => {
    const current = grouped.get(row.taxonKey) || {
      label: row.displayLabel,
      individuals: 0,
      observations: 0,
      eventIds: new Set(),
      years: new Set()
    };

    current.individuals += Number(row.individualCount || 0);
    current.observations += 1;
    current.eventIds.add(row.eventID);
    current.years.add(row.year);
    grouped.set(row.taxonKey, current);
  });

  return Array.from(grouped.values())
    .map((row) => ({
      label: row.label,
      value: rankingMetricValue(row, metricKey)
    }))
    .sort((a, b) => Number(b.value || 0) - Number(a.value || 0) || a.label.localeCompare(b.label));
}

function rankingMetricValue(row, metricKey) {
  if (metricKey === "eventsPresent") return row.eventIds.size;
  if (metricKey === "yearsPresent") return row.years.size;
  return row[metricKey] || 0;
}

function buildPeriodRows(rows, events, metricKey, period, fillAllMonths = false) {
  const rowGroups = new Map();
  const eventGroups = new Map();

  events.forEach((event) => {
    const key = periodKey(event, period);
    const current = eventGroups.get(key) || {
      year: Number(event.year),
      month: Number(event.month),
      totalEvents: 0
    };
    current.totalEvents += 1;
    eventGroups.set(key, current);
  });

  rows.forEach((row) => {
    const key = periodKey(row, period);
    const current = rowGroups.get(key) || {
      year: Number(row.year),
      month: Number(row.month),
      observations: 0,
      individuals: 0,
      taxa: new Set(),
      eventIds: new Set()
    };

    current.observations += 1;
    current.individuals += Number(row.individualCount || 0);
    current.taxa.add(row.taxonKey);
    current.eventIds.add(row.eventID);
    rowGroups.set(key, current);
  });

  const periodRows = Array.from(eventGroups.entries())
    .map(([key, eventGroup]) => {
      const rowGroup = rowGroups.get(key);
      const eventsPresent = rowGroup?.eventIds.size || 0;

      return {
        year: eventGroup.year,
        month: period === "month" ? eventGroup.month : 1,
        value: periodMetricValue(metricKey, rowGroup, eventGroup.totalEvents, eventsPresent)
      };
    })
    .sort((a, b) => a.year - b.year || a.month - b.month);

  if (!fillAllMonths || period !== "month") return periodRows;

  const byMonth = new Map(periodRows.map((row) => [row.month, row]));
  return Array.from({ length: 12 }, (_, index) => ({
    year: 0,
    month: index + 1,
    value: byMonth.get(index + 1)?.value || 0
  }));
}

function periodKey(row, period) {
  return period === "month" ? `${row.year}-${row.month}` : `${row.year}`;
}

function periodMetricValue(metricKey, rowGroup, totalEvents, eventsPresent) {
  if (metricKey === "events") return totalEvents;
  if (metricKey === "richness") return rowGroup?.taxa.size || 0;
  if (metricKey === "individuals") return rowGroup?.individuals || 0;
  if (metricKey === "observations" || metricKey === "occurrences") return rowGroup?.observations || 0;
  if (metricKey === "eventsPresent") return eventsPresent;
  if (metricKey === "frequency") return totalEvents > 0 ? eventsPresent / totalEvents : 0;
  return 0;
}
