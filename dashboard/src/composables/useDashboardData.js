import { ref } from "vue";

const dashboardData = ref(null);
const dashboardError = ref(null);
const dashboardLoading = ref(false);

async function fetchJson(file) {
  const response = await fetch(`${import.meta.env.BASE_URL}${file}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${file}`);
  }
  return response.json();
}

export function useDashboardData() {
  const load = async () => {
    dashboardLoading.value = true;
    dashboardError.value = null;

    try {
      const [
        events,
        occurrences,
        speciesLookup,
        summaryCards,
        seriesYearSite,
        seriesMonthSite,
        speciesRankings,
        metadata
      ] = await Promise.all([
        fetchJson("events.json"),
        fetchJson("occurrences.json"),
        fetchJson("species_lookup.json"),
        fetchJson("summary_cards.json"),
        fetchJson("series_year_site.json"),
        fetchJson("series_month_site.json"),
        fetchJson("species_rankings.json"),
        fetchJson("metadata.json")
      ]);

      dashboardData.value = {
        events,
        occurrences,
        speciesLookup,
        summaryCards,
        seriesYearSite,
        seriesMonthSite,
        speciesRankings,
        metadata
      };
    } catch (error) {
      dashboardError.value = error;
    } finally {
      dashboardLoading.value = false;
    }
  };

  return {
    data: dashboardData,
    error: dashboardError,
    loading: dashboardLoading,
    load
  };
}
