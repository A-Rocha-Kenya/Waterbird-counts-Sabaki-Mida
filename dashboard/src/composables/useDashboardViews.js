import { computed } from "vue";

function sortByTaxonomy(a, b) {
  if (a.taxonomicSequence == null && b.taxonomicSequence == null) {
    return (a.displayLabel || "").localeCompare(b.displayLabel || "");
  }
  if (a.taxonomicSequence == null) return 1;
  if (b.taxonomicSequence == null) return -1;
  return a.taxonomicSequence - b.taxonomicSequence;
}

export function useDashboardViews(data, filters) {
  const speciesIndex = computed(() => {
    if (!data.value) return [];

    return data.value.speciesLookup
      .filter((item) => (item.taxonRank || "") === "Species")
      .map((item) => ({
        value: item.taxonKey,
        scientificName: item.displayScientificName || item.scientificName,
        vernacularName: item.displayVernacularName || item.vernacularName || item.displayScientificName || item.scientificName,
        displayLabel: item.displayVernacularName || item.vernacularName || item.displayScientificName || item.scientificName,
        taxonomicSequence: item.avilist_sequence ?? null,
        taxonomicOrder: item.avilist_order ?? null
      }))
      .sort(sortByTaxonomy);
  });

  const speciesSearchResults = computed(() => {
    const query = filters.speciesSearch.trim().toLowerCase();
    if (!query) return speciesIndex.value.slice(0, 12);

    return speciesIndex.value.filter((item) =>
      item.vernacularName.toLowerCase().includes(query) ||
      item.scientificName.toLowerCase().includes(query)
    ).slice(0, 12);
  });

  const overviewEventRows = computed(() => {
    if (!data.value) return [];

    return data.value.events;
  });

  const eventRows = computed(() => {
    if (!data.value) return [];

    return data.value.events.filter((row) =>
      filters.sites.length === 0 || filters.sites.includes(row.site)
    );
  });

  const joinedRows = computed(() => {
    if (!data.value) return [];

    const eventMap = new Map(eventRows.value.map((event) => [event.eventID, event]));
    const speciesMap = new Map(data.value.speciesLookup.map((item) => [item.taxonKey, item]));

    return data.value.occurrences
      .map((occurrence) => {
        const event = eventMap.get(occurrence.eventID);
        if (!event) return null;
        const species = speciesMap.get(occurrence.taxonKey) || {};

        return {
          ...occurrence,
          ...event,
          ...species,
          displayScientificName: species.displayScientificName || occurrence.scientificName,
          displayVernacularName: species.displayVernacularName || occurrence.vernacularName || species.displayScientificName || occurrence.scientificName,
          taxonomicSequence: species.avilist_sequence ?? null,
          taxonomicOrder: species.avilist_order ?? null
        };
      })
      .filter(Boolean);
  });

  const overviewJoinedRows = computed(() => {
    if (!data.value) return [];

    const eventMap = new Map(overviewEventRows.value.map((event) => [event.eventID, event]));
    const speciesMap = new Map(data.value.speciesLookup.map((item) => [item.taxonKey, item]));

    return data.value.occurrences
      .map((occurrence) => {
        const event = eventMap.get(occurrence.eventID);
        if (!event) return null;
        const species = speciesMap.get(occurrence.taxonKey) || {};

        return {
          ...occurrence,
          ...event,
          ...species,
          displayScientificName: species.displayScientificName || occurrence.scientificName,
          displayVernacularName: species.displayVernacularName || occurrence.vernacularName || species.displayScientificName || occurrence.scientificName,
          taxonomicSequence: species.avilist_sequence ?? null,
          taxonomicOrder: species.avilist_order ?? null
        };
      })
      .filter(Boolean);
  });

  const overviewSummary = computed(() => {
    const uniqueEvents = new Set(overviewJoinedRows.value.map((row) => row.eventID));
    const uniqueTaxa = new Set(overviewJoinedRows.value.map((row) => row.taxonKey));
    const totalIndividuals = overviewJoinedRows.value.reduce(
      (sum, row) => sum + Number(row.individualCount || 0),
      0
    );

    return {
      events: uniqueEvents.size,
      taxa: uniqueTaxa.size,
      observations: overviewJoinedRows.value.length,
      individuals: totalIndividuals
    };
  });

  const overviewYearRows = computed(() => {
    const grouped = new Map();

    overviewEventRows.value.forEach((row) => {
      const key = `${row.site}-${row.year}`;
      const current = grouped.get(key) || {
        site: row.site,
        year: Number(row.year),
        surveys: 0
      };
      current.surveys += 1;
      grouped.set(key, current);
    });

    return Array.from(grouped.values()).sort((a, b) => a.year - b.year);
  });

  const overviewRichnessRows = computed(() => {
    const grouped = new Map();

    overviewJoinedRows.value.forEach((row) => {
      const key = `${row.site}-${row.year}`;
      const current = grouped.get(key) || {
        site: row.site,
        year: Number(row.year),
        taxa: new Set(),
        individuals: 0
      };
      current.taxa.add(row.taxonKey);
      current.individuals += Number(row.individualCount || 0);
      grouped.set(key, current);
    });

    return Array.from(grouped.values())
      .map((row) => ({
        site: row.site,
        year: row.year,
        taxa: row.taxa.size,
        individuals: row.individuals
      }))
      .sort((a, b) => a.year - b.year);
  });

  const overviewSpeciesRows = computed(() => {
    const grouped = new Map();

    overviewJoinedRows.value.forEach((row) => {
      const current = grouped.get(row.taxonKey) || {
        taxonKey: row.taxonKey,
        vernacularName: row.displayVernacularName,
        scientificName: row.displayScientificName,
        taxonRank: row.taxonRank,
        taxonomicSequence: row.taxonomicSequence,
        taxonomicOrder: row.taxonomicOrder,
        eventIds: new Set(),
        years: new Set(),
        observations: 0,
        individuals: 0
      };

      current.observations += 1;
      current.individuals += Number(row.individualCount || 0);
      current.eventIds.add(row.eventID);
      current.years.add(row.year);
      grouped.set(row.taxonKey, current);
    });

    return Array.from(grouped.values())
      .map((row) => ({
        taxonKey: row.taxonKey,
        vernacularName: row.vernacularName,
        scientificName: row.scientificName,
        taxonRank: row.taxonRank,
        taxonomicSequence: row.taxonomicSequence,
        taxonomicOrder: row.taxonomicOrder,
        observations: row.observations,
        individuals: row.individuals,
        occupiedEvents: row.eventIds.size,
        yearsPresent: row.years.size
      }))
      .sort(sortByTaxonomy);
  });

  const selectedSpecies = computed(() =>
    speciesIndex.value.find((item) => item.value === filters.selectedTaxon) || null
  );

  const speciesRows = computed(() =>
    filters.selectedTaxon
      ? joinedRows.value.filter((row) => row.taxonKey === filters.selectedTaxon)
      : []
  );

  const speciesSummary = computed(() => {
    if (speciesRows.value.length === 0) return null;

    return {
      vernacularName: selectedSpecies.value?.vernacularName || speciesRows.value[0].displayVernacularName,
      scientificName: selectedSpecies.value?.scientificName || speciesRows.value[0].displayScientificName,
      taxonomicOrder: selectedSpecies.value?.taxonomicOrder || speciesRows.value[0].taxonomicOrder,
      individuals: speciesRows.value.reduce((sum, row) => sum + Number(row.individualCount || 0), 0),
      observations: speciesRows.value.length,
      occupiedEvents: new Set(speciesRows.value.map((row) => row.eventID)).size,
      firstDate: speciesRows.value.map((row) => row.eventDate).sort()[0],
      lastDate: speciesRows.value.map((row) => row.eventDate).sort().at(-1),
      sites: [...new Set(speciesRows.value.map((row) => row.site))].sort().join(", ")
    };
  });

  const speciesYearAbundance = computed(() => {
    const grouped = new Map();

    speciesRows.value.forEach((row) => {
      const key = `${row.site}-${row.year}`;
      const current = grouped.get(key) || {
        site: row.site,
        year: Number(row.year),
        individuals: 0,
        observations: 0
      };
      current.individuals += Number(row.individualCount || 0);
      current.observations += 1;
      grouped.set(key, current);
    });

    return Array.from(grouped.values()).sort((a, b) => a.year - b.year);
  });

  const speciesMonthAbundance = computed(() => {
    const grouped = new Map();

    speciesRows.value.forEach((row) => {
      const key = `${row.site}-${row.month}`;
      const current = grouped.get(key) || {
        site: row.site,
        month: Number(row.month),
        monthLabel: row.monthLabel,
        individuals: 0,
        observations: 0
      };
      current.individuals += Number(row.individualCount || 0);
      current.observations += 1;
      grouped.set(key, current);
    });

    return Array.from(grouped.values()).sort((a, b) => a.month - b.month);
  });

  const speciesYearFrequency = computed(() => {
    const surveyed = new Map();
    const occupied = new Map();

    eventRows.value.forEach((row) => {
      const key = `${row.site}-${row.year}`;
      surveyed.set(key, (surveyed.get(key) || 0) + 1);
    });

    speciesRows.value.forEach((row) => {
      const key = `${row.site}-${row.year}`;
      occupied.set(key, (occupied.get(key) || 0) + 1);
    });

    return Array.from(surveyed.entries())
      .map(([key, totalEvents]) => {
        const [site, year] = key.split("-");
        const occupiedEvents = occupied.get(key) || 0;
        return {
          site,
          year: Number(year),
          totalEvents,
          occupiedEvents,
          frequency: totalEvents > 0 ? occupiedEvents / totalEvents : 0
        };
      })
      .sort((a, b) => a.year - b.year);
  });

  const speciesMonthFrequency = computed(() => {
    const surveyed = new Map();
    const occupied = new Map();

    eventRows.value.forEach((row) => {
      const key = `${row.site}-${row.month}`;
      surveyed.set(key, {
        totalEvents: (surveyed.get(key)?.totalEvents || 0) + 1,
        month: Number(row.month),
        monthLabel: row.monthLabel,
        site: row.site
      });
    });

    speciesRows.value.forEach((row) => {
      const key = `${row.site}-${row.month}`;
      occupied.set(key, (occupied.get(key) || 0) + 1);
    });

    return Array.from(surveyed.entries())
      .map(([key, value]) => ({
        site: value.site,
        month: value.month,
        monthLabel: value.monthLabel,
        totalEvents: value.totalEvents,
        occupiedEvents: occupied.get(key) || 0,
        frequency: value.totalEvents > 0 ? (occupied.get(key) || 0) / value.totalEvents : 0
      }))
      .sort((a, b) => a.month - b.month);
  });

  return {
    speciesIndex,
    speciesSearchResults,
    overviewEventRows,
    eventRows,
    overviewSummary,
    overviewYearRows,
    overviewRichnessRows,
    overviewSpeciesRows,
    selectedSpecies,
    speciesSummary,
    speciesYearAbundance,
    speciesMonthAbundance,
    speciesYearFrequency,
    speciesMonthFrequency
  };
}
