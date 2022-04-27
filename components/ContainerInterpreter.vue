<template>
  <table class="table is-hoverable is-fullwidth">
    <thead>
      <tr>
        <th><abbr title="FieldName">Name</abbr></th>
        <th><abbr title="Data">Data</abbr></th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(header, idx) in headers"
        :key="idx"
        @click="$emit(head.begin)"
      >
        <td>{{ header.name }}</td>
        <td>{{ header.value }}</td>
      </tr>
    </tbody>
  </table>
</template>
<script>
export default {
  props: ["container", "dataView"],
  computed: {
    headers() {
      if (!this.container) return [];
      return this.container.header_fields;
    },
    fields() {
      return [];
    },
  },
};
</script>
<style></style>
