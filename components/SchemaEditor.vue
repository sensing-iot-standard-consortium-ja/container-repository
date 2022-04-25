<template>
  <form @keydown.stop @submit.prevent>
    <input type="text" v-model="name" />
    <select v-model="schema.type">
      <option>fields</option>
      <option>json</option>
      <option>cbor</option>
    </select>
    <table class="table" v-if="schema.type == 'fields'">
      <thead>
        <tr>
          <th><abbr title="FieldName">Name</abbr></th>
          <th>Pos</th>
          <th><abbr title="Primitive">Primitive</abbr></th>
          <th><abbr title="Operation">Op</abbr></th>
        </tr>
      </thead>
      <tfoot>
        <tr>
          <button class="button is-inverted is-small">add new field</button>
        </tr>
      </tfoot>
      <tbody>
        <tr :key="idx" v-for="(field, idx) in schema.fields">
          <td>
            <input class="input is-small" type="text" v-model="field.name" />
          </td>
          <td>
            <input class="input is-small" type="number" v-model="field.pos" />
          </td>
          <td>
            <select class="input is-small">
              <option>u8</option>
              <option>i8</option>
              <option>u16le</option>
              <option>i16le</option>
              <option>u16be</option>
              <option>i16be</option>
              <option>u32le</option>
              <option>i32le</option>
              <option>u32be</option>
              <option>i32be</option>
              <option>f32le</option>
              <option>f32be</option>
              <option>f64le</option>
              <option>f64be</option>
            </select>
          </td>
          <td>
            <button class="button is-inverted is-small is-danger">
              remove
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </form>
</template>
<script>
export default {
  watch: {
    dataView() {
      this.$emit("input", this.structured);
    },
  },
  data() {
    return {
      schema: {
        type: "fields",
        fields: [{}],
      },
      name: "",
    };
  },
  computed: {
    structured() {
      if (!this.dataView) {
        return {};
      }
      return {};
    },
  },
};
</script>
<style lang="scss" scoped>
@import "bulma/bulma.sass";
</style>
