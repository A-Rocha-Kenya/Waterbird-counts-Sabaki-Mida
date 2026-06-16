import { computed, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

export function useFilters(metadataRef) {
  const route = useRoute();
  const router = useRouter();
  const filters = reactive({
    sites: route.query.sites ? String(route.query.sites).split(",").map((item) => item.trim()).filter(Boolean) : [],
    taxa: route.query.taxa ? String(route.query.taxa).split(",").map((item) => item.trim()).filter(Boolean) : [],
    speciesSearch: String(route.query.speciesSearch || ""),
    includeUnidentified: route.query.includeUnidentified === "true",
    monthMin: Number(route.query.monthMin || 1),
    monthMax: Number(route.query.monthMax || 12),
    yearMin: 0,
    yearMax: 0
  });

  watch(
    metadataRef,
    (metadata) => {
      if (!metadata) return;
      const minYear = metadata.filters?.years?.min || 0;
      const maxYear = metadata.filters?.years?.max || 0;

      filters.yearMin = Number(route.query.yearMin || filters.yearMin || minYear);
      filters.yearMax = Number(route.query.yearMax || filters.yearMax || maxYear);
    },
    { immediate: true }
  );

  watch(
    filters,
    () => {
      router.replace({
        query: {
          sites: filters.sites.length ? filters.sites.join(",") : undefined,
          taxa: filters.taxa.length ? filters.taxa.join(",") : undefined,
          speciesSearch: filters.speciesSearch || undefined,
          includeUnidentified: filters.includeUnidentified ? "true" : undefined,
          monthMin: filters.monthMin !== 1 ? filters.monthMin : undefined,
          monthMax: filters.monthMax !== 12 ? filters.monthMax : undefined,
          yearMin: filters.yearMin || undefined,
          yearMax: filters.yearMax || undefined
        }
      });
    },
    { deep: true }
  );

  const activeFilterCount = computed(() => {
    return [
      filters.sites.length,
      filters.monthMin !== 1 || filters.monthMax !== 12 ? 1 : 0,
      filters.taxa.length,
      filters.speciesSearch ? 1 : 0,
      filters.includeUnidentified ? 1 : 0
    ].reduce((sum, value) => sum + value, 0);
  });

  const reset = () => {
    const metadata = metadataRef.value;
    filters.sites = [];
    filters.taxa = [];
    filters.speciesSearch = "";
    filters.includeUnidentified = false;
    filters.monthMin = 1;
    filters.monthMax = 12;
    filters.yearMin = metadata?.filters?.years?.min || 0;
    filters.yearMax = metadata?.filters?.years?.max || 0;
  };

  return { filters, activeFilterCount, reset };
}
