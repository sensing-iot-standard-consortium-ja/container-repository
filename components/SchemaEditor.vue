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
          <th><abbr title="Length">length</abbr></th>
          <th><abbr title="Primitive">type</abbr></th>
          <th><abbr title="Operation">Op</abbr></th>
        </tr>
      </thead>
      <tfoot>
        <tr>
          <td>
            <button @click="addNewField" class="button is-inverted is-small">
              add new field
            </button>
          </td>
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
            <input
              class="input is-small"
              type="number"
              v-model="field.length"
            />
          </td>
          <td>
            <select class="input is-small">
              <option :key="_type" v-for="_type in types">
                {{ _type }}
              </option>
            </select>
          </td>
          <td>
            <button
              @click="removeField(idx)"
              class="button is-inverted is-small is-danger"
            >
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
        fields: [],
      },
      name: "",
    };
  },
  computed: {
    types() {
      return [
        "bytes",
        "u8",
        "i8",
        "u16le",
        "i16le",
        "u16be",
        "i16be",
        "u32le",
        "i32le",
        "u32be",
        "i32be",
        "f32le",
        "f32be",
        "f64le",
        "f64be",
      ];
    },
    structured() {
      if (!this.dataView) {
        return {};
      }
      return {};
    },
  },
  methods: {
    _new_field() {
      return { name: "", pos: 0, type: "bytes" };
    },
    addNewField() {
      this.schema.fields.push(this._new_field());
    },
    removeField(idx) {
      this.schema.fields.splice(idx, 1);
    },
  },
};
</script>
<style lang="scss" scoped>
@import "bulma/bulma.sass";
</style>
