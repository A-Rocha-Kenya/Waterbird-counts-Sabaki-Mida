<template>
  <section class="panel panel-centered">
    <h3>{{ title }}</h3>
    <p>{{ message }}</p>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "No data for this view"
  },
  message: {
    type: String,
    default: "Adjust the filters to bring records back into view."
  }
});
</script>
