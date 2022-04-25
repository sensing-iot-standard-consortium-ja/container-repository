<script>
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
      const data_id = Array.from(
        new Uint8Array(this.dataView.buffer).slice(5, _ptr)
      );
      if ([0x6666, 0x0f0f, 0x9999, 0xf0f0].includes(type)) {
        const attr_count = this.dataView.getUint8(_ptr);
        _ptr++;
        for (let i; i < attr_count; i++) {
          // const attr_id = this.dataView.getUint8(_ptr)
          const attr_len = this.dataView.getUint8(_ptr + 1);
          // const attr_val = this.dataView.getXXXXX(_ptr + 2, attr_len)
          _ptr = _ptr + 1 + 1 + attr_len;
        }
      }
      return {
        header: { begin: 0, end: _ptr },
        header_fields: {
          type,
          length,
          data_index,
          data_id,
        },
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
