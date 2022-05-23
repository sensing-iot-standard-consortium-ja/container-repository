<template>
  <div class="dropdown" :class="{ 'is-active': show }">
    <div class="dropdown-trigger">
      <button
        class="button"
        aria-haspopup="true"
        aria-controls="dropdown-menu-id"
        @click.prevent="show = !show"
      >
        <span>Content</span>
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
            <div class="control">
              <input class="input" type="text" placeholder="Text input" />
            </div>
          </div>
        </div>
        <hr class="dropdown-divider" />
        <div class="dropdown-item">
          <div class="field">
            <label class="label">Username</label>
            <div class="control has-icons-left has-icons-right">
              <input
                class="input is-success"
                type="text"
                placeholder="Text input"
                value="bulma"
              />
              <span class="icon is-small is-left">
                <font-awesome-icon :icon="['fas', 'adjust']" />
              </span>
              <span class="icon is-small is-right">
                <i class="fas fa-check"></i>
              </span>
            </div>
            <p class="help is-success">This username is available</p>
          </div>
        </div>
        <hr class="dropdown-divider" />
        <a href="#" class="dropdown-item"> This is a link </a>
      </div>
    </div>
  </div>
</template>
<script>
import { fas } from "@fortawesome/free-solid-svg-icons";
export default {
  data() {
    return {
      show: false,
    };
  },
};
</script>
<style lang="sass">
@import "bulma/bulma.sass"
</style>
