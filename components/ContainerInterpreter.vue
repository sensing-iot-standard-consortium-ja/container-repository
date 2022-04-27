<template>
  <div>
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
          @click="$emit('position', header.begin)"
        >
          <td>{{ header.name }}</td>
          <td>{{ header.value }}</td>
        </tr>
      </tbody>
    </table>
    <table class="table is-hoverable is-fullwidth">
      <thead>
        <tr>
          <th><abbr title="FieldName">Name</abbr></th>
          <th><abbr title="Data">Data</abbr></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(field, idx) in structured"
          :key="idx"
          @click="$emit('position', field.begin)"
        >
          <td>{{ field.name }}</td>
          <td>{{ field.value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  props: ["container", "dataView", "structured"],
  computed: {
    headers() {
      return this?.container?.header_fields || [];
    },
    fields() {
      return [];
    },
    payload_offset() {
      return this.container?.header?.end;
    },
  },
};
</script>
<style></style>
