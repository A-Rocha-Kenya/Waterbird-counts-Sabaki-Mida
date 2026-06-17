import { ref } from "vue";

const dashboardData = ref(null);
const dashboardError = ref(null);
const dashboardLoading = ref(false);
const dashboardFiles = ["events.json", "occurrences.json", "species_lookup.json", "metadata.json"];

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
      const [events, occurrences, speciesLookup, metadata] = await Promise.all(
        dashboardFiles.map(fetchJson)
      );

      dashboardData.value = {
        events,
        occurrences,
        speciesLookup,
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
