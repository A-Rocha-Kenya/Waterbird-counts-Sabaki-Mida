<template>
  <section class="panel">
    <div class="panel-header">
      <h2>Survey site map</h2>
      <p>Event points for the filtered subset.</p>
    </div>
    <div ref="mapContainer" class="map-surface"></div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import L from "leaflet";

const props = defineProps({
  rows: { type: Array, required: true }
});

const mapContainer = ref(null);
let map;
let layerGroup;

function renderMap() {
  if (!mapContainer.value) return;

  if (!map) {
    map = L.map(mapContainer.value, {
      scrollWheelZoom: false
    }).setView([-3.25, 40.05], 10);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    layerGroup = L.layerGroup().addTo(map);
  }

  layerGroup.clearLayers();

  props.rows.forEach((row) => {
    if (!row.decimalLatitude || !row.decimalLongitude) return;
    L.circleMarker([row.decimalLatitude, row.decimalLongitude], {
      radius: 6,
      weight: 1,
      color: "#204e33",
      fillColor: "#8aa05b",
      fillOpacity: 0.8
    })
      .bindPopup(`<strong>${row.site}</strong><br>${row.eventDate}`)
      .addTo(layerGroup);
  });
}

onMounted(renderMap);
watch(() => props.rows, renderMap, { deep: true });

onBeforeUnmount(() => {
  if (map) map.remove();
});
</script>
