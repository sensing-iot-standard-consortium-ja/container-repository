<template>
  <span></span>
</template>
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
      const c_type = this.dataView.getUint16(0);
      const c_length = this.dataView.getUint16(2);
      const c_data_index = this.dataView.getUint8(4);
      const c_data_id_length = this.data_id_length(c_data_index);
      // const c_data_id = this.dataView.getXXXXX(5, c_data_id_length);
      let ptr = 5 + c_data_id_length;
      if ([0x6666, 0x0f0f, 0x9999, 0xf0f0].includes(c_type)) {
        const attr_count = this.dataView.getUint8(ptr);
        ptr++;
        for (let i; i < attr_count; i++) {
          // const attr_id = this.dataView.getUint8(ptr)
          const attr_len = this.dataView.getUint8(ptr + 1);
          // const attr_val = this.dataView.getXXXXX(ptr + 2, attr_len)
          ptr = ptr + 1 + 1 + attr_len;
        }
      }
      return {
        header: { begin: 0, end: ptr },
        payload: { begin: ptr, end: c_length },
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
