<template lang="">
  <div class="tabs">
    <ul>
      <li
        @click="mode_change(0)"
        class="info-light"
        :class="{ 'is-active': value == 0 }"
      >
        <a>Data Interpreter</a>
      </li>
      <li
        @click="mode_change(1)"
        class="info-dark"
        :class="{ 'is-active': value == 1 }"
      >
        <a>Container Interpreter</a>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  props: ["value"],
  watch: {},
  methods: {
    mode_change(idx) {
      this.$emit("input", idx);
    },
  },
};
</script>
<style lang="scss" scoped>
@import "bulma/bulma.sass";
</style>
