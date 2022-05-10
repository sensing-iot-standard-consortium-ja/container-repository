<template>
  <form @keydown.stop @submit.prevent>
    <input type="text" v-model="schema.name" />
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
            <input
              class="input is-small"
              type="number"
              v-model.number="field.pos"
            />
          </td>
          <td>
            <input
              class="input is-small"
              type="number"
              min="0"
              v-model.number="field.length"
              :disabled="field.type != 'bytes'"
            />
          </td>
          <td>
            <select class="input is-small" v-model="field.type">
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
  props: ["dataView", "container"],
  watch: {
    structured() {
      this.$emit("input", this.structured);
    },
  },
  data() {
    return {
      schema: {
        type: "fields",
        fields: [],
        name: "",
      },
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
    _dataview_mapping() {
      return {
        bytes: {}, // not implemented
        u8: { get: "getUint8" },
        i8: { get: "getInt8" },
        u16le: { get: "getUint16", isLittle: true },
        i16le: { get: "getInt16", isLittle: true },
        u16be: { get: "getUint16" },
        i16be: { get: "getInt16" },
        u32le: { get: "getUint32", isLittle: true },
        i32le: { get: "getInt32", isLittle: true },
        u32be: { get: "getUint32" },
        i32be: { get: "getInt32" },
        f32le: { get: "getFloat32", isLittle: true },
        f32be: { get: "getFloat32" },
        f64le: { get: "getFloat64", isLittle: true },
        f64be: { get: "getFloat64" },
      };
    },
    structured() {
      if (!this.dataView) {
        return {};
      }
      if (!this.container) {
        return {};
      }
      const _payload = this.container.payload;
      const payload = Array.from(
        new Uint8Array(this.dataView.buffer).slice(_payload.begin, _payload.end)
      );

      switch (this.schema.type) {
        case "fields":
          return this.schema.fields.map((field) => {
            const _begin = field.pos;
            const _end = _begin + field.length;
            return {
              name: field.name,
              value: payload.slice(_begin, _end),
              begin: _begin,
              end: _end,
            };
          });
        case "json":
        case "cbor":
          return [{ name: "未実装", value: "", begin: 0, end: -1 }];
        default:
          return [];
      }
    },
  },
  methods: {
    _new_field() {
      return { name: "", pos: 0, length: 0, type: "bytes" };
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
