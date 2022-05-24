<template>
  <div class="dropdown" :class="{ 'is-active': show }">
    <div class="dropdown-trigger">
      <button
        class="button is-small"
        aria-haspopup="true"
        aria-controls="dropdown-menu-id"
        @click.prevent="show = !show"
      >
        <span>Configure</span>
        <span class="icon is-small">
          <font-awesome-icon
            :icon="['fas', 'fa-angle-down']"
            aria-hidden="true"
          />
        </span>
      </button>
    </div>
    <div class="dropdown-menu" id="dropdown-menu-id" role="menu">
      <div class="dropdown-content">
        <div class="dropdown-item">
          <div class="field">
            <label class="label">Name</label>
            <div class="control has-icons-left">
              <input
                class="input is-small"
                type="text"
                v-model="name"
                required
              />
              <span class="icon is-small is-left">
                <font-awesome-icon :icon="['fas', 'font']" />
              </span>
            </div>
          </div>
        </div>
        <div class="dropdown-item">
          <div class="field">
            <label class="label">Position</label>
            <div class="control has-icons-left has-icons-right">
              <input
                class="input is-small"
                type="number"
                placeholder="position"
                v-model.number="pos"
              />
              <span class="icon is-small is-left">
                <font-awesome-icon :icon="['fas', 'hashtag']" />
              </span>
            </div>
          </div>
        </div>
        <div class="dropdown-item">
          <div class="field">
            <label class="label">Type/Length</label>
            <div class="control has-icons-left">
              <div class="select is-small is-fullwidth">
                <select v-model="type">
                  <option
                    :key="idx"
                    v-for="(_type, idx) in types"
                    :value="_type.name"
                  >
                    {{ _type.name }}
                  </option>
                </select>
              </div>
              <span class="icon is-small is-left">
                <font-awesome-icon :icon="['fas', 'hashtag']" />
              </span>
            </div>
            <div class="control has-icons-left" :disabled="type !== 'bytes'">
              <input
                class="input is-small"
                type="number"
                placeholder="length"
                v-model.number="length"
              />
              <span class="icon is-small is-left">
                <font-awesome-icon :icon="['fas', 'hashtag']" />
              </span>
            </div>
          </div>
        </div>
        <hr class="dropdown-divider" />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      show: false,
      name: "",
      length: 0,
      pos: 0,
      type: "bytes",
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
  },
  watch: {
    type() {
      const type_name = this.type;
      const _type = this.types.find((e) => e.name == type_name);
      this.length = _type.length;
    },
  },
};
</script>
<style lang="sass">
@import "bulma/bulma.sass"
</style>
