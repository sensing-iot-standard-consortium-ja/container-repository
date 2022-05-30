<template>
  <form @keydown.stop @submit.prevent>
    <h2>Schema Interpreter</h2>
    <select v-model="type">
      <option>fields</option>
    </select>
    <button @click="register">save</button>
    <table class="table" v-if="type == 'fields'">
      <thead>
        <tr>
          <th><abbr>Name</abbr></th>
          <th>Configuration</th>
          <th>Tags</th>
          <th>Ope</th>
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
        <tr :key="idx" v-for="(field, idx) in fields">
          <td>{{ field.name }}</td>
          <td>
            <RichInput
              :pos="field.pos"
              :name="field.name"
              :type="field.type"
              :length="field.length"
              @update:pos="(val) => (field.pos = val)"
              @update:name="(val) => (field.name = val)"
              @update:type="(val) => (field.type = val)"
              @update:length="(val) => (field.length = val)"
            ></RichInput>
          </td>
          <td>
            <TagInput
              :tags="field.tags"
              @update:tags="(val) => (field.tags = val)"
            >
            </TagInput>
          </td>
          <td>
            <button
              class="button is-danger is-outlined is-small"
              @click="removeField(idx)"
            >
              <span>Delete</span>
              <span class="icon is-small">
                <font-awesome-icon
                  :icon="['fas', 'fa-times']"
                ></font-awesome-icon>
              </span>
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
      name: "",
      type: "fields",
      fields: [],
    };
  },
  computed: {
    schema() {
      return {
        name: this.name,
        type: this.type,
        fields: this.fields,
      };
    },
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
      switch (this.type) {
        case "fields":
          return this.fields.map((field) => {
            const _begin = field.pos;
            const mapping = this.types.find((t) => t.name == field.type)?.[
              "get"
            ];
            const isLittleEndian = field?.tags?.isLittleEndian | false;
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
        const _res = { ...(await res.json()) };
        this.name = _res?.name;
        this.fields = _res?.fields;
        this.type = _res?.type;
      } catch {
        this.type = "fields";
        this.fields = [];
        this.name = "";
        console.log("load default");
      }
    },
    addNewField() {
      this.fields.push(this._new_field());
    },
    removeField(idx) {
      this.fields.splice(idx, 1);
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
