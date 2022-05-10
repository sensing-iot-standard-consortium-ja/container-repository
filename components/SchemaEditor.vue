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
            />
            <!--  :disabled="field.type != 'bytes'" -->
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
import { Buffer } from "buffer";
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

      // Array.from(
      //   new Uint8Array(buffer.slice(_payload.begin, _payload.end)
      // );

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
