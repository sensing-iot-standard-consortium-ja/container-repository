<template>
  <div id="app" tabIndex="1" @keydown="handleKey">
    <div class="file">
      <div class="offsets" title="Offset">
        <div
          v-for="(offset, lineIndex) of offsets"
          :key="lineIndex"
          class="offset"
          :class="{ active: isLineActive(lineIndex) }"
          @click.prevent="handleLineClick(lineIndex, $event)"
        >
          {{ offset }}
        </div>
      </div>
      <div class="lines hex" title="Hex value">
        <div
          v-for="(line, lineIndex) of hex"
          :key="lineIndex"
          class="line"
          :class="{ active: isLineActive(lineIndex) }"
          @click.prevent="handleLineClick(lineIndex, $event)"
        >
          <div
            v-for="(value, valueIndex) of line"
            :key="lineIndex * 16 + valueIndex"
            class="value"
            :class="{ active: isValueActive(lineIndex, valueIndex) }"
            @click="handleValueClick(valueIndex, $event)"
          >
            {{ value }}
          </div>
        </div>
      </div>
      <div class="lines ascii" title="Ascii value">
        <div
          v-for="(line, lineIndex) of ascii"
          :key="lineIndex"
          class="line"
          :class="{ active: isLineActive(lineIndex) }"
          @click.prevent="handleLineClick(lineIndex, $event)"
        >
          <div
            v-for="(value, valueIndex) of line"
            :key="lineIndex * 16 + valueIndex"
            class="value"
            :class="{
              active: isValueActive(lineIndex, valueIndex),
            }"
            @click="handleValueClick(valueIndex, $event)"
          >
            {{ value }}
          </div>
        </div>
      </div>
      <div class="interpreter">
        <SchemaEditor
          v-model="structured"
          :dataView="dataView"
          :container="container"
        />
        <ContainerInterpreter
          :container="container"
          :dataView="dataView"
          :structured="structured"
          v-show="mode == 1"
        />
      </div>
    </div>
  </div>
</template>
<!--https://codepen.io/AzazelN28/pen/mQMapb -->
<script>
export default {
  props: ["dataView", "container"],
  data() {
    return {
      rowLength: 16,
      row: {
        start: 0,
        current: 0,
      },
      column: 0,
      mode: 1,
      structured: [],
    };
  },
  watch: {
    dataView() {
      this.row.start = 0;
      this.row.current = 0;
      this.column = 0;
    },
  },
  computed: {
    size() {
      if (!this.dataView) {
        return 0;
      }
      return this.dataView.byteLength;
    },
    offset() {
      return this.row.current * this.rowLength + this.column;
    },
    maxStartRow() {
      return this.maxRows - (this.rows - 1);
    },
    maxRows() {
      if (!this.dataView) {
        return 0;
      }
      return Math.floor(this.dataView.byteLength / this.rowLength);
    },
    rows() {
      // return Math.ceil(this.$el.clientHeight / 16); // NOTE: This is not the row length (it's the pixel height of each line)
      return 0x20; // 32行分画面に表示する
    },
    offsets() {
      if (!this.dataView) {
        return [];
      }
      const rows = [];
      for (let row = this.row.start; row < this.row.start + this.rows; row++) {
        rows.push((row * this.rowLength).toString(16).padStart(8, "0"));
      }
      return rows;
    },
    hex() {
      return this.getRows((value) =>
        value.toString(16).padStart(2, "0").toUpperCase()
      );
    },
    ascii() {
      return this.getRows((value) =>
        value >= 32 && value <= 127 ? String.fromCharCode(value) : "."
      );
    },
  },
  methods: {
    getRows(fn) {
      if (!this.dataView) {
        return [];
      }
      const rows = [];
      for (let row = this.row.start; row < this.row.start + this.rows; row++) {
        const values = [];
        for (let column = 0; column < this.rowLength; column++) {
          const offset = row * this.rowLength + column;
          const value =
            offset < this.dataView.byteLength
              ? this.dataView.getUint8(offset)
              : "  ";
          values.push(fn(value));
        }
        rows.push(values);
      }
      return rows;
    },
    updateColumnToLine() {
      const offset = this.row.current * this.rowLength + this.column;
      if (offset >= this.dataView.byteLength) {
        this.column = (this.dataView.byteLength % this.rowLength) - 1;
      }
    },
    moveCharLeft() {
      this.column = Math.max(0, this.column - 1);
    },
    moveCharRight() {
      const newColumn = Math.min(this.rowLength - 1, this.column + 1);
      const offset = this.row.current * this.rowLength + newColumn;
      if (offset < this.dataView.byteLength) {
        this.column = newColumn;
      }
    },
    moveLineUp() {
      this.row.current = Math.max(0, this.row.current - 1);
      if (this.row.current < this.row.start) {
        this.row.start = this.row.current;
      }
      this.updateColumnToLine();
    },
    moveLineDown() {
      this.row.current = Math.min(this.maxRows, this.row.current + 1);
      if (this.row.current > this.row.start + (this.rows - 1)) {
        this.row.start = this.row.current - (this.rows - 1);
      }
      this.updateColumnToLine();
    },
    movePageUp() {
      this.row.start = Math.max(0, this.row.start - this.rows);
      this.row.current = this.row.start;
      this.updateColumnToLine();
    },
    movePageDown() {
      this.row.start = Math.min(this.maxStartRow, this.row.start + this.rows);
      this.row.current = this.row.start;
      this.updateColumnToLine();
    },
    moveToStart() {
      this.row.current = this.row.start = 0;
    },
    moveToEnd() {
      this.row.start = this.maxStartRow;
      this.row.current = this.maxRows;
    },
    goToChar(charIndex) {
      this.column = charIndex;
    },
    goToLineRelative(lineIndex) {
      this.row.current = this.row.start + lineIndex;
    },
    isValueActive(lineIndex, valueIndex) {
      if (!this.isLineActive(lineIndex)) {
        return false;
      }
      return valueIndex === this.column;
    },
    isLineActive(lineIndex) {
      return lineIndex === this.row.current - this.row.start;
    },
    handleValueClick(valueIndex) {
      this.goToChar(valueIndex);
    },
    handleLineClick(lineIndex) {
      this.goToLineRelative(lineIndex);
    },
    handleKey(e) {
      if (e.code === "ArrowUp" || e.key === "k") {
        this.moveLineUp();
      } else if (e.code === "ArrowDown" || e.key === "j") {
        this.moveLineDown();
      }

      if (e.code === "ArrowLeft" || e.key === "h") {
        this.moveCharLeft();
      } else if (e.code === "ArrowRight" || e.key === "l") {
        this.moveCharRight();
      }

      if (e.code === "PageUp") {
        this.movePageUp();
      } else if (e.code === "PageDown") {
        this.movePageDown();
      }

      if (e.key === "g") {
        this.moveToStart();
      } else if (e.key === "G") {
        this.moveToEnd();
      }
    },
    handleWheel(e) {
      if (e.deltaY < 0) {
        this.moveLineUp();
      } else {
        this.moveLineDown();
      }
    },
  },
};
</script>
<style scoped>
html,
body,
#app {
  width: 100%;
  display: flex;
  font-family: monospace;
  font-size: 1rem;
}
#app {
  overflow: hidden;
}
input[type="file"] {
  width: 0;
  height: 0;
  overflow: hidden;
  opacity: 0;
}
.button {
  background: #bbb;
  color: #333;
  border-radius: 0.5rem;
  padding: 1rem;
}
#app {
  flex-direction: row;
}
.file {
  display: flex;
  flex-direction: row;
}
.drag {
  background: #333;
  color: #bbb;
  display: flex;
  align-items: center;
  justify-content: center;
}
.drag .open-file {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16rem 2rem;
  border: 2px dashed #bbb;
  border-radius: 1rem;
}
.drag .open-file label.open-file-label {
  font-size: 2rem;
  width: 100%;
  height: 100%;
  text-align: center;
}
.file,
.drag,
.offsets,
.values,
.interpreter {
  width: 100%;
}
.offsets {
  background: #222;
  color: #aaa;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: auto;
}
.offsets .offset {
  margin-bottom: 0.125rem;
  padding: 0 1rem;
}
.offsets .offset.active {
  background: #224;
  color: #bbf;
}
.lines.hex {
  background: #333;
  color: #bbb;
  display: flex;
  flex-direction: column;
}
.lines.hex .line {
  margin-bottom: 0.125rem;
  display: flex;
  flex-direction: row;
  padding: 0 1rem;
}
.lines.hex .line.active {
  background: #336;
  color: #bbf;
}
.lines.hex .line .value {
  margin: 0 0.5rem;
}
.lines.hex .line .value.active {
  background: #bbf;
  color: #336;
}
.lines.ascii {
  background: #373737;
  color: #bbb;
  display: flex;
  flex-direction: column;
}
.lines.ascii .line {
  margin-bottom: 0.125rem;
  display: flex;
  flex-direction: row;
  padding: 0 1rem;
}
.lines.ascii .line.active {
  background: #373766;
  color: #bbf;
}
.lines.ascii .line .value.active {
  background: #fbf;
  color: #373766;
}
.interpreter {
  overflow-y: auto;
  padding-right: 1rem;
  padding-left: 1rem;
  background: #444;
  color: #bbb;
}
.interpreter form {
  width: 100%;
  margin-bottom: 1rem;
}
.interpreter form .setting {
  display: flex;
  flex: 1 1 auto;
  max-width: 12rem;
}
.interpreter form legend {
  padding: 0 1rem;
}
.interpreter form fieldset {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}
.interpreter form .group {
  display: flex;
}
.interpreter table {
  width: 100%;
  border-collapse: collapse;
}
.interpreter table.hexmode tr th > .show_hexmode,
.interpreter table.binmode tr th > .show_binmode {
  background: #fbf;
  color: #373766;
}

.interpreter table.hexmode tr td.raw > span::before {
  content: "0x";
}
.interpreter table.binmode tr td.raw > span::before {
  content: "0b";
}
.interpreter table tr:nth-child(2n + 1) td {
  padding-bottom: 0.8rem;
}
.interpreter table tr th {
  border-bottom: 1px solid #bbb;
  padding-bottom: 0.5rem;
}
.interpreter table tr td,
.interpreter table tr th {
  text-align: left;
  padding-right: 1rem;
}
.interpreter table tr td:last-child,
.interpreter table tr th:last-child {
  padding-right: 0;
}
.interpreter table tr td:first-child,
.interpreter table tr th:first-child {
  text-align: right;
  width: 0em;
}
</style>
