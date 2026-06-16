import { computed } from "vue";
import { matchesFilterSet, isIdentifiedTaxon } from "../utils/filters";

function monthInRange(month, monthMin, monthMax) {
  if (monthMin <= monthMax) {
    return month >= monthMin && month <= monthMax;
  }

  return month >= monthMin || month <= monthMax;
}

export function useDerivedViews(data, filters) {
  const joinedRows = computed(() => {
    if (!data.value) return [];

    const eventMap = new Map(data.value.events.map((event) => [event.eventID, event]));

    return data.value.occurrences.map((occurrence) => {
      const event = eventMap.get(occurrence.eventID);
      return {
        ...occurrence,
        ...event
      };
    });
  });

  const filteredRows = computed(() => {
    return joinedRows.value.filter((row) => {
      const year = Number(row.year);
      const month = Number(row.month);
      const identified = isIdentifiedTaxon(row);

      return matchesFilterSet(row.site, filters.sites) &&
        monthInRange(month, filters.monthMin, filters.monthMax) &&
        matchesFilterSet(row.taxonKey, filters.taxa) &&
        year >= filters.yearMin &&
        year <= filters.yearMax &&
        (filters.includeUnidentified || identified);
    });
  });

  const filteredSummary = computed(() => {
    const uniqueEvents = new Set(filteredRows.value.map((row) => row.eventID));
    const uniqueTaxa = new Set(filteredRows.value.map((row) => row.taxonKey));
    const totalIndividuals = filteredRows.value.reduce(
      (sum, row) => sum + Number(row.individualCount || 0),
      0
    );

    return {
      events: uniqueEvents.size,
      taxa: uniqueTaxa.size,
      observations: filteredRows.value.length,
      individuals: totalIndividuals
    };
  });

  const filteredEventRows = computed(() => {
    const seen = new Map();
    filteredRows.value.forEach((row) => {
      if (!seen.has(row.eventID)) {
        seen.set(row.eventID, row);
      }
    });
    return Array.from(seen.values());
  });

  const filteredSpeciesRankings = computed(() => {
    const grouped = new Map();

    filteredRows.value.forEach((row) => {
      const current = grouped.get(row.taxonKey) || {
        taxonKey: row.taxonKey,
        vernacularName: row.displayVernacularName || row.vernacularName,
        scientificName: row.displayScientificName || row.scientificName,
        taxonRank: row.taxonRank,
        taxonomicOrder: row.avilist_order,
        taxonomicSequence: row.avilist_sequence,
        observations: 0,
        individuals: 0,
        nEvents: new Set()
      };

      current.observations += 1;
      current.individuals += Number(row.individualCount || 0);
      current.nEvents.add(row.eventID);
      grouped.set(row.taxonKey, current);
    });

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        nEvents: item.nEvents.size
      }))
      .sort((a, b) => {
        if (a.taxonomicSequence == null && b.taxonomicSequence == null) {
          return a.vernacularName.localeCompare(b.vernacularName);
        }
        if (a.taxonomicSequence == null) return 1;
        if (b.taxonomicSequence == null) return -1;
        return a.taxonomicSequence - b.taxonomicSequence;
      });
  });

  const filteredYearSeries = computed(() => {
    const grouped = new Map();
    filteredRows.value.forEach((row) => {
      const key = `${row.site}-${row.year}`;
      const current = grouped.get(key) || {
        site: row.site,
        year: row.year,
        observations: 0,
        individuals: 0
      };
      current.observations += 1;
      current.individuals += Number(row.individualCount || 0);
      grouped.set(key, current);
    });
    return Array.from(grouped.values()).sort((a, b) => a.year - b.year);
  });

  const filteredMonthSeries = computed(() => {
    const grouped = new Map();
    filteredRows.value.forEach((row) => {
      const key = `${row.site}-${row.month}`;
      const current = grouped.get(key) || {
        site: row.site,
        month: row.month,
        monthLabel: row.monthLabel,
        observations: 0,
        individuals: 0
      };
      current.observations += 1;
      current.individuals += Number(row.individualCount || 0);
      grouped.set(key, current);
    });
    return Array.from(grouped.values()).sort((a, b) => a.month - b.month);
  });

  const filterOptions = computed(() => {
    if (!data.value) return null;
    return {
      sites: data.value.metadata.filters.sites,
      years: data.value.metadata.filters.years,
      taxa: data.value.speciesLookup
        .map((item) => ({
          value: item.taxonKey,
          label: item.displayVernacularName || item.vernacularName || item.displayScientificName || item.scientificName,
          scientificName: item.displayScientificName || item.scientificName,
          taxonomicSequence: item.avilist_sequence
        }))
        .sort((a, b) => {
          if (a.taxonomicSequence == null && b.taxonomicSequence == null) {
            return a.label.localeCompare(b.label);
          }
          if (a.taxonomicSequence == null) return 1;
          if (b.taxonomicSequence == null) return -1;
          return a.taxonomicSequence - b.taxonomicSequence;
        })
    };
  });

  return {
    joinedRows,
    filteredRows,
    filteredSummary,
    filteredEventRows,
    filteredSpeciesRankings,
    filteredYearSeries,
    filteredMonthSeries,
    filterOptions
  };
}
