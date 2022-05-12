<template>
  <span style="visibility: hidden"></span>
</template>
<script>
import { Buffer } from "buffer";
export default {
  props: ["dataView"],
  watch: {
    container() {
      this.$emit("input", this.container);
    },
  },
  computed: {
    container() {
      if (!this.dataView) {
        return {};
      }
      const type = this.dataView.getUint16(0);
      const length = this.dataView.getUint16(2);
      const data_index = this.dataView.getUint8(4);
      const _data_id_length = this.data_id_length(data_index);

      let _ptr = 5 + _data_id_length;
      // const data_id = Array.from(
      //   new Uint8Array(this.dataView.buffer).slice(5, _ptr)
      // );
      const data_id = Buffer.from(this.dataView.buffer.slice(5, _ptr)).toString(
        "hex"
      );
      const attrs = [];
      if ([0x6666, 0x0f0f, 0x9999, 0xf0f0].includes(type)) {
        const attr_count = this.dataView.getUint8(_ptr);
        _ptr++;
        for (let i; i < attr_count; i++) {
          const attr_id = this.dataView.getUint8(_ptr);
          const attr_len = this.dataView.getUint8(_ptr + 1);
          const attr_val = Array.from(
            new Uint8Array(this.dataView.buffer).slice(
              _ptr + 2,
              _ptr + 2 + attr_len
            )
          );
          attrs.push([
            { name: "id", value: attr_id, begin: _ptr, end: _ptr + 1 },
            { name: "len", value: attr_len, begin: _ptr + 1, end: _ptr + 2 },
            {
              name: "value",
              value: attr_val,
              begin: _ptr + 2,
              end: _ptr + 2 + attr_len,
            },
          ]);
          _ptr = _ptr + 1 + 1 + attr_len;
        }
      }
      return {
        header: { begin: 0, end: _ptr },
        header_fields: [
          { name: "type", value: type, begin: 0, end: 2 },
          { name: "length", value: length, begin: 2, end: 4 },
          { name: "data_index", value: data_index, begin: 4, end: 5 },
          {
            name: "data_id",
            value: data_id,
            begin: 5,
            end: 5 + _data_id_length,
          },
          {
            name: "attributes",
            value: [...attrs],
            begin: 5 + _data_id_length,
            end: _ptr,
          },
        ],
        payload: { begin: _ptr, end: length },
      };
    },
  },
  methods: {
    data_id_length(idx) {
      const s_idx = idx.toString();
      const length_tbl = {
        0: 16,
      };

      return length_tbl[s_idx];
    },
  },
};
</script>
<style lang=""></style>
