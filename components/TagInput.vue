<template>
  <div class="dropdown" :class="{ 'is-hoverable': show }">
    <div class="dropdown-trigger">
      <button
        class="button is-small"
        aria-haspopup="true"
        aria-controls="dropdown-menu-id"
        @click.stop="show = !show"
      >
        <span>tags</span>
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
            <label class="label">New Tag</label>
            <div class="control has-icons-left has-icons-right">
              <input
                class="input is-small"
                type="text"
                placeholder="TagName"
                v-model="fieldname"
                list="fieldnames"
              />
              <datalist
                id="fieldnames"
                :key="idx"
                v-for="(n, idx) in defined_field_names"
              >
                <option :value="n">{{ n }}</option>
              </datalist>
              <span class="icon is-small is-left">
                <font-awesome-icon :icon="['fas', 'font']" />
              </span>
            </div>
            <div class="control has-icons-left has-icons-right">
              <input
                class="input is-small"
                type="text"
                placeholder="TagValue"
                v-model="fieldvalue"
              />
              <span class="icon is-small is-left">
                <font-awesome-icon :icon="['fas', 'hashtag']" />
              </span>
            </div>
            <div class="control is-right">
              <button class="button is-small" @click="addField">Add</button>
            </div>
          </div>
        </div>
        <div class="dropdown-item">
          <div class="field" v-for="(value, key, idx) in tags" :key="idx">
            <label class="label">
              <button
                class="button is-danger is-outlined is-small"
                @click="removeField(key)"
              >
                <span>{{ key }}</span>
                <span> : </span>
                <span>{{ value }}</span>
                <span class="icon is-small">
                  <font-awesome-icon
                    :icon="['fas', 'fa-times']"
                  ></font-awesome-icon>
                </span></button
            ></label>
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
      showNew: true,
      fieldname: "",
      fieldvalue: "",
    };
  },
  props: {
    tags: Object,
  },
  emits: ["update:tags"],
  methods: {
    addField() {
      const tags = Object.assign(this.tags, {
        [this.fieldname]: this.fieldvalue,
      });
      this.$emit("update:tags", tags);

      this.fieldname = "";
      this.fieldvalue = "";
    },
    removeField(key) {
      let _copy = Object.assign({}, this.tags);
      delete _copy[key];
      this.$emit("update:tags", _copy);
    },
  },
  computed: {
    defined_field_names() {
      return ["isLittleEndian"];
    },
  },
};
</script>
<style lang="sass">
@import "bulma/bulma.sass"
</style>
