<template>
  <form @keydown.stop @submit.prevent>
    <h2>Schema Interpreter</h2>
    <input type="text" v-model="schema.name" />
    <select v-model="schema.type">
      <option>fields</option>
    </select>
    <button @click="register">save</button>
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
            <select
              class="input is-small"
              v-model="field.type"
              @change="updateLength(field)"
            >
              <option
                :key="idx"
                v-for="(_type, idx) in types"
                :value="_type.name"
              >
                {{ _type.name }}
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
import { Buffer } from "buffer";
export default {
  props: ["dataView", "container"],
  watch: {
    structured() {
      this.$emit("input", this.structured);
    },
    container() {
      this.fetch_schema_file();
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
        { name: "bytes", length: 1 },
        { name: "u8", length: 1 },
        { name: "i8", length: 1 },
        { name: "u16le", length: 2 },
        { name: "i16le", length: 2 },
        { name: "u16be", length: 2 },
        { name: "i16be", length: 2 },
        { name: "u32le", length: 4 },
        { name: "i32le", length: 4 },
        { name: "u32be", length: 4 },
        { name: "i32be", length: 4 },
        { name: "f32le", length: 4 },
        { name: "f32be", length: 4 },
        { name: "f64le", length: 8 },
        { name: "f64be", length: 8 },
      ];
    },
    _dataview_mapping() {
      return {
        bytes: {}, // not implemented
        u8: (buf) => {
          return new DataView(buf).getUint8(0);
        },
        i8: (buf) => {
          return new DataView(buf).getInt8(0);
        },
        u16le: (buf) => {
          return new DataView(buf).getUint16(0, true);
        },
        i16le: (buf) => {
          return new DataView(buf).getInt16(0, true);
        },
        u16be: (buf) => {
          return new DataView(buf).getUint16(0);
        },
        i16be: (buf) => {
          return new DataView(buf).getInt16(0);
        },
        u32be: (buf) => {
          return new DataView(buf).getUint32(0);
        },
        u32le: (buf) => {
          return new DataView(buf).getUint32(0, true);
        },
        i32be: (buf) => {
          return new DataView(buf).getInt32(0);
        },
        i32le: (buf) => {
          return new DataView(buf).getInt32(0, true);
        },
        f32be: (buf) => {
          return new DataView(buf).getFloat32(0);
        },
        f32le: (buf) => {
          return new DataView(buf).getFloat32(0, true);
        },
        f64be: (buf) => {
          return new DataView(buf).getFloat64(0);
        },
        f64le: (buf) => {
          return new DataView(buf).getFloat64(0, true);
        },
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
      const payload_buf = this.dataView.buffer.slice(
        _payload.begin,
        _payload.end
      );

      switch (this.schema.type) {
        case "fields":
          return this.schema.fields.map((field) => {
            const _begin = field.pos;
            const _end = _begin + field.length;
            const _buf = payload_buf.slice(_begin, _end);
            const exec = this._dataview_mapping[field.type];
            let _val;
            if (typeof exec === "function") {
              try {
                _val = exec(_buf);
              } catch (err) {
                _val = "error";
              }
            } else {
              _val = Array.from(new Uint8Array(_buf));
            }
            return {
              name: field.name,
              buffer: Buffer.from(_buf).toString("HEX"),
              value: _val,
              begin: _begin,
              end: _end,
            };
          });
        default:
          return [];
      }
    },
  },
  methods: {
    _new_field() {
      return { name: "", pos: 0, length: 0, type: "bytes" };
    },
    async register() {
      const { value: data_index } = this.container.header_fields.find(
        (e) => e.name == "data_index"
      );
      const { value: data_id } = this.container.header_fields.find(
        (e) => e.name == "data_id"
      );
      const schema_json = JSON.stringify(this.schema);
      const res = await fetch(`/registry/repo/${data_index}/${data_id}`, {
        method: "PUT",
        body: schema_json,
      });
      const body = await res.blob();
      console.log(body);
    },
    async fetch_schema_file() {
      const { value: data_index } = this.container.header_fields.find(
        (e) => e.name == "data_index"
      );
      const { value: data_id } =
        this.container.header_fields.find((e) => e.name == "data_id") | "_";
      try {
        const res = await fetch(`/registry/repo/${data_index}/${data_id}`);
        this.schema = await res.json();
      } catch {
        this.schema = {
          type: "fields",
          fields: [],
          name: "",
        };
        console.log("load default");
      }
    },
    addNewField() {
      this.schema.fields.push(this._new_field());
    },
    removeField(idx) {
      this.schema.fields.splice(idx, 1);
    },
    updateLength(field) {
      const type_name = field.type;
      const _type = this.types.find((e) => e.name == type_name);
      field.length = _type.length;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "bulma/bulma.sass";
</style>
