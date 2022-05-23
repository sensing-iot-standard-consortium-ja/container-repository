<template>
  <form @keydown.stop @submit.prevent>
    <h2>Schema Interpreter</h2>
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
        { name: "u8", length: 1, get: "getUint8", set: "setUint8" },
        { name: "u16", length: 2, get: "getUint16", set: "setUint16" },
        { name: "u32", length: 4, get: "getUint32", set: "setUint32" },
        { name: "u64", length: 8, get: "getBigUint64", set: "setBigUint64" },
        { name: "i8", length: 1, get: "getInt8", set: "setInt8" },
        { name: "i16", length: 2, get: "getInt16", set: "setInt16" },
        { name: "i32", length: 4, get: "getInt32", set: "setInt32" },
        { name: "i64", length: 8, get: "getBigInt64", set: "setBigInt64" },
        { name: "f32", length: 4, get: "getFloat32", set: "setFloat32" },
        { name: "f64", length: 8, get: "getFloat64", set: "setFloat64" },
        { name: "bytes", length: 1 },
      ];
    },
    structured() {
      if (!this.dataView) {
        return {};
      }
      if (!this.container) {
        return {};
      }
      const buffer = this.dataView.buffer;
      const _payload = this.container.payload;
      const payloadDataView = new DataView(
        buffer,
        _payload.begin,
        _payload.end - _payload.begin
      );
      switch (this.schema.type) {
        case "fields":
          return this.schema.fields.map((field) => {
            const _begin = field.pos;
            // const _end = _begin + field.length;
            // const _buf = payload_buf.slice(_begin, _end); // これは理解不足による不適切なslice
            const mapping = this.types.find((t) => t.name == field.type)?.[
              "get"
            ];
            const isLittleEndian = field.tags.isLittleEndian | false;
            let _val;
            if (mapping) {
              try {
                _val = payloadDataView[mapping](_begin, isLittleEndian);
              } catch (err) {
                _val = "error";
              }
            }
            const buffer = payloadDataView.buffer;
            const offset = payloadDataView.byteOffset + field.pos;
            const length = field.length;
            const _hex = this.buf2hex(buffer, offset, length);
            return {
              name: field.name,
              buffer: _hex,
              value: _val | _hex,
              begin: _begin,
              end: _begin + field.length,
            };
          });
        default:
          return [];
      }
    },
  },
  methods: {
    _new_field() {
      return { name: "", type: "bytes", pos: 0, length: 0, tags: {} };
      // 本来適切にTypeScriptで定義するようなところ
      /*
        tags: key and default value
          "isLittleEndian": false, // endian
          "json:map": "${name}", //
          "mapping": "",
          "skip": ""
      */
    },
    async register() {
      const { value: data_index } = this.container.header_fields.find(
        (e) => e.name === "data_index"
      );
      const { value: data_id } = this.container.header_fields.find(
        (e) => e.name === "data_id"
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
        (e) => e.name === "data_index"
      );
      const { value: data_id } = this.container.header_fields.find(
        (e) => e.name === "data_id"
      );

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
    buf2hex(buffer, byteOffset, length) {
      try {
        // buffer is an ArrayBuffer
        return [...new Uint8Array(buffer, byteOffset, length)]
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("");
      } catch (e) {
        return "error";
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import "bulma/bulma.sass";
</style>
