<template lang="">
  <div
    class="drag"
    @drag="handleDrag"
    @dragstart="handleDrag"
    @dragenter="handleDrag"
    @dragexit="handleDrag"
    @dragend="handleDrag"
    @dragleave="handleDrag"
    @dragover="handleDrag"
    @drop="handleDrag"
  >
    <div>
      <div class="open-file">
        <input
          id="file"
          class="open-file-input"
          type="file"
          name="file"
          @change="handleOpenFile"
        />
        <label class="open-file-label" for="file"> Load File </label>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["value"],
  computed: {},
  methods: {
    handleOpenFile(e) {
      const files = e.target.files;
      const [file] = files;
      this.loadFile(file);
    },
    loadFile(file) {
      const fr = new FileReader();
      fr.addEventListener("load", this.handleFile);
      fr.addEventListener("error", this.handleFile);
      fr.readAsArrayBuffer(file);
    },
    handleFile(e) {
      const fr = e.target;
      const arrayBuffer = fr.result;
      fr.removeEventListener("load", this.handleFile);
      fr.removeEventListener("error", this.handleFile);
      this.$emit("input", new DataView(arrayBuffer));
    },
    handleDrag(e) {
      if (e.type === "dragover") {
        e.preventDefault();
      } else if (e.type === "drop") {
        e.preventDefault();
        const [file] = e.dataTransfer.files;
        this.loadFile(file);
      }
    },
    load_example() {
      const arrayBuffer = new ArrayBuffer(0x17);
      const uint8 = new Uint8Array(arrayBuffer);
      uint8.set(
        [
          0xaa, 0xaa, 0x00, 0x17, 0x00, 0xde, 0xad, 0xbe, 0xef, 0x00, 0x01,
          0xaa, 0xaa, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x0e,
          0x42,
        ],
        0
      );
      this.$emit("input", new DataView(arrayBuffer));
    },
  },
};
</script>
<style>
.drag {
  top: 1em;
  right: 1em;
  z-index: 1;
  height: 12px;
  position: fixed;
  background: #333;
  color: #bbb;
  align-items: center;
  justify-content: center;
  bottom: 1em;
}
.drag .open-file {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px dashed #bbb;
  border-radius: 0.5rem;
}
.drag .open-file-input {
  display: none;
}
</style>
