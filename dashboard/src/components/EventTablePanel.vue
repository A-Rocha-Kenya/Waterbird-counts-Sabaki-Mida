<template>
  <section class="panel">
    <div class="panel-header">
      <h2>Filtered event explorer</h2>
      <p>{{ rows.length }} events in the current subset.</p>
    </div>
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Site</th>
            <th>Locality</th>
            <th>Latitude</th>
            <th>Longitude</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.eventID">
            <td>{{ row.eventDate }}</td>
            <td>{{ row.site }}</td>
            <td>{{ row.locality }}</td>
            <td>{{ row.decimalLatitude }}</td>
            <td>{{ row.decimalLongitude }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
defineProps({
  rows: { type: Array, required: true }
});
</script>
