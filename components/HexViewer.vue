<template>
  <div id="app" tabIndex="1" @keydown.prevent="handleKey">
    <div v-if="dataView" class="file">
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
      <div class="interpreter" title="Data interpreter">
        <h2>Info</h2>
        <div class="offset">
          <div class="hex">
            0x{{ offset.toString(16).padStart(8, "0") }} : 0x{{
              size.toString(16).padStart(8, "0")
            }}
            bytes
          </div>
          <div class="dec">
            &nbsp;&nbsp;{{ offset.toString().padStart(8, "0") }} :
            &nbsp;&nbsp;{{ size.toString().padStart(8, "0") }} bytes
          </div>
        </div>
        <h2>Data Interpreter</h2>
        <form class="settings">
          <div class="settings-row">
            <fieldset class="setting endian">
              <legend>Byte Order</legend>
              <div class="group">
                <input
                  id="little-endian"
                  v-model="settings.le"
                  type="checkbox"
                /><label id="little-endian-label" for="little-endian"
                  >Show little-endian</label
                >
              </div>
              <div class="group">
                <input
                  id="big-endian"
                  v-model="settings.be"
                  type="checkbox"
                /><label id="big-endian-label" for="little-endian"
                  >Show big-endian</label
                >
              </div>
            </fieldset>
            <fieldset class="setting sign">
              <legend>Signedness</legend>
              <div class="group">
                <input
                  id="unsigned"
                  v-model="settings.u"
                  type="checkbox"
                /><label id="unsigned-label" for="unsigned"
                  >Show unsigned</label
                >
              </div>
              <div class="group">
                <input id="signed" v-model="settings.i" type="checkbox" /><label
                  id="signed-label"
                  for="signed"
                  >Show signed</label
                >
              </div>
            </fieldset>
          </div>
        </form>
        <table
          :class="{
            hexmode: settings.radixmode == 16,
            binmode: settings.radixmode == 2,
          }"
        >
          <tr>
            <th>type</th>
            <th>value</th>
            <th @click="togglePreview">
              <span class="show_hexmode">hex</span>
              ↔️
              <span class="show_binmode">binary</span>
            </th>
          </tr>
          <tr v-if="settings.u" class="u8" title="8-bit unsigned int">
            <td class="type">u8</td>
            <td class="value">
              {{ interpreter.u8 }}
            </td>
            <td class="raw">
              <span>{{ rawdata_presenter(interpreter.u8, 1) }}</span>
            </td>
          </tr>
          <tr v-if="settings.i" class="i8" title="8-bit signed int">
            <td class="type">i8</td>
            <td class="value">
              {{ interpreter.i8 }}
            </td>
            <td class="raw">
              <span>{{ rawdata_presenter(interpreter.u8, 1) }}</span>
            </td>
          </tr>
          <tr
            v-if="settings.u &amp;&amp; settings.le"
            class="u16le"
            title="16-bit little endian unsigned int"
          >
            <td class="type">u16le</td>
            <td class="value">
              {{ interpreter.u16le }}
            </td>
            <td class="raw">
              <span>{{ rawdata_presenter(interpreter.u16le, 2) }}</span>
            </td>
          </tr>
          <tr
            v-if="settings.i &amp;&amp; settings.le"
            class="i16le"
            title="16-bit little endian signed int"
          >
            <td class="type">i16le</td>
            <td class="value">
              {{ interpreter.i16le }}
            </td>
            <td class="raw">
              <span>{{ rawdata_presenter(interpreter.u16le, 2) }}</span>
            </td>
          </tr>
          <tr
            v-if="settings.u &amp;&amp; settings.be"
            class="u16be"
            title="16-bit big endian unsigned int"
          >
            <td class="type">u16be</td>
            <td class="value">
              {{ interpreter.u16be }}
            </td>
            <td class="raw">
              <span>{{ rawdata_presenter(interpreter.u16be, 2) }}</span>
            </td>
          </tr>
          <tr
            v-if="settings.i &amp;&amp; settings.be"
            class="i16be"
            title="16-bit big endian signed int"
          >
            <td class="type">i16be</td>
            <td class="value">
              {{ interpreter.i16be }}
            </td>
            <td class="raw">
              <span>{{ rawdata_presenter(interpreter.u16be, 2) }}</span>
            </td>
          </tr>
          <tr
            v-if="settings.u &amp;&amp; settings.le"
            class="u32le"
            title="32-bit little endian unsigned int"
          >
            <td class="type">u32le</td>
            <td class="value">
              {{ interpreter.u32le }}
            </td>
            <td class="raw">
              <span>{{ rawdata_presenter(interpreter.u32le, 4) }}</span>
            </td>
          </tr>
          <tr
            v-if="settings.i &amp;&amp; settings.le"
            class="i32le"
            title="32-bit little endian signed int"
          >
            <td class="type">i32le</td>
            <td class="value">
              {{ interpreter.i32le }}
            </td>
            <td class="raw">
              <span>{{ rawdata_presenter(interpreter.u32le, 4) }}</span>
            </td>
          </tr>
          <tr
            v-if="settings.u &amp;&amp; settings.be"
            class="u32be"
            title="32-bit big endian unsigned int"
          >
            <td class="type">u32be</td>
            <td class="value">
              {{ interpreter.u32be }}
            </td>
            <td class="raw">
              <span>{{ rawdata_presenter(interpreter.u32be, 4) }}</span>
            </td>
          </tr>
          <tr
            v-if="settings.i &amp;&amp; settings.be"
            class="i32be"
            title="32-bit big endian signed int"
          >
            <td class="type">i32be</td>
            <td class="value">
              {{ interpreter.i32be }}
            </td>
            <td class="raw">
              <span>{{ rawdata_presenter(interpreter.u32be, 4) }}</span>
            </td>
          </tr>
          <tr
            v-if="settings.le"
            class="f32le"
            title="32-bit little endian float"
          >
            <td class="type">f32le</td>
            <td class="value">
              {{ interpreter.f32le }}
            </td>
            <td class="raw">
              <span>{{ rawdata_presenter(interpreter.u32le, 4) }}</span>
            </td>
          </tr>
          <tr v-if="settings.be" class="f32be" title="32-bit big endian float">
            <td class="type">f32be</td>
            <td class="value">
              {{ interpreter.f32be }}
            </td>
            <td class="raw">
              <span>{{ rawdata_presenter(interpreter.u32be, 4) }}</span>
            </td>
          </tr>
          <tr
            v-if="settings.le"
            class="f64le"
            title="64-bit little endian float"
          >
            <td class="type">f64le</td>
            <td class="value">
              {{ interpreter.f64le }}
            </td>
            <td class="raw">
              <span>{{ rawdata_presenter(interpreter.u64le, 8) }}</span>
            </td>
          </tr>
          <tr v-if="settings.be" class="f64be" title="64-bit big endian float">
            <td class="type">f64be</td>
            <td class="value">
              {{ interpreter.f64be }}
            </td>
            <td class="raw">
              <span>{{ rawdata_presenter(interpreter.u64be, 8) }}</span>
            </td>
          </tr>
          <tr
            v-if="settings.le"
            class="tu32le"
            title="32-bit little endian time (unsigned int 32)"
          >
            <td class="type">tu32le</td>
            <td class="value">
              {{ interpreter.tu32le }}
            </td>
            <td class="raw">
              <span>{{ rawdata_presenter(interpreter.u32le, 4) }}</span>
            </td>
          </tr>
          <tr
            v-if="settings.be"
            class="tu32be"
            title="32-bit big endian time (unsigned int 32)"
          >
            <td class="type">tu32be</td>
            <td class="value">
              {{ interpreter.tu32be }}
            </td>
            <td class="raw">
              <span>{{ rawdata_presenter(interpreter.u32be, 4) }}</span>
            </td>
          </tr>
          <tr
            v-if="settings.le"
            class="tf32le"
            title="32-bit little endian time (float 32)"
          >
            <td class="type">tf32le</td>
            <td class="value">
              {{ interpreter.tf32le }}
            </td>
            <td class="raw">
              <span>{{ rawdata_presenter(interpreter.u32le, 4) }}</span>
            </td>
          </tr>
          <tr
            v-if="settings.be"
            class="tf32be"
            title="32-bit big endian time (float 32)"
          >
            <td class="type">tf32be</td>
            <td class="value">
              {{ interpreter.tf32be }}
            </td>
            <td class="raw">
              <span>{{ rawdata_presenter(interpreter.u32be, 4) }}</span>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>
<!--https://codepen.io/AzazelN28/pen/mQMapb -->
<script>
export default {
  props: ["dataView"],
  data() {
    return {
      rowLength: 16,
      row: {
        start: 0,
        current: 0,
      },
      column: 0,
      settings: {
        le: true,
        be: true,
        u: true,
        i: true,
        colorize: {
          enabled: false,
          palette: null,
        },
        radixmode: 16, // hex(16)/bin(2)
      },
      interpreter: {
        u8: 0,
        i8: 0,
        u16le: 0,
        i16le: 0,
        u16be: 0,
        i16be: 0,
        u32le: 0,
        i32le: 0,
        u32be: 0,
        i32be: 0,
        f32le: 0,
        f32be: 0,
        u64be: 0,
        i64be: undefined,
        u64le: 0,
        i64le: undefined,
        f64le: 0,
        f64be: 0,
        tu32le: 0,
        tu32be: 0,
        tf32le: 0,
        tf32be: 0,
        binary: 0,
        hex: 0,
      },
    };
  },
  watch: {
    dataView() {
      this.row.start = 0;
      this.row.current = 0;
      this.column = 0;
      this.updateInterpreter();
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
    togglePreview() {
      if (this.settings.radixmode == 16) this.settings.radixmode = 2;
      else {
        this.settings.radixmode = 16;
      }
      return;
    },
    rawdata_presenter(value, bytelength) {
      const keta = Math.ceil(
        (bytelength * 8) / Math.log2(this.settings.radixmode)
      );
      return value.toString(this.settings.radixmode).padStart(keta, "0");
    },
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
      this.updateInterpreter();
    },
    moveCharRight() {
      const newColumn = Math.min(this.rowLength - 1, this.column + 1);
      const offset = this.row.current * this.rowLength + newColumn;
      if (offset < this.dataView.byteLength) {
        this.column = newColumn;
      }
      this.updateInterpreter();
    },
    moveLineUp() {
      this.row.current = Math.max(0, this.row.current - 1);
      if (this.row.current < this.row.start) {
        this.row.start = this.row.current;
      }
      this.updateColumnToLine();
      this.updateInterpreter();
    },
    moveLineDown() {
      this.row.current = Math.min(this.maxRows, this.row.current + 1);
      if (this.row.current > this.row.start + (this.rows - 1)) {
        this.row.start = this.row.current - (this.rows - 1);
      }
      this.updateColumnToLine();
      this.updateInterpreter();
    },
    movePageUp() {
      this.row.start = Math.max(0, this.row.start - this.rows);
      this.row.current = this.row.start;
      this.updateColumnToLine();
      this.updateInterpreter();
    },
    movePageDown() {
      this.row.start = Math.min(this.maxStartRow, this.row.start + this.rows);
      this.row.current = this.row.start;
      this.updateColumnToLine();
      this.updateInterpreter();
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
    toTimestampString(number) {
      try {
        return new Date(number * 1000).toISOString();
      } catch (error) {
        // do nothing...
        return "invalid timestamp";
      }
    },
    updateInterpreter() {
      this.interpreter.u8 = 0;
      this.interpreter.i8 = 0;
      if (this.offset + 1 <= this.dataView.byteLength) {
        this.interpreter.u8 = this.dataView.getUint8(this.offset);
        this.interpreter.i8 = this.dataView.getInt8(this.offset);
      }

      this.interpreter.u16le = 0;
      this.interpreter.i16le = 0;
      this.interpreter.u16be = 0;
      this.interpreter.i16be = 0;
      if (this.offset + 2 <= this.dataView.byteLength) {
        this.interpreter.u16le = this.dataView.getUint16(this.offset, true);
        this.interpreter.i16le = this.dataView.getInt16(this.offset, true);
        this.interpreter.u16be = this.dataView.getUint16(this.offset, false);
        this.interpreter.i16be = this.dataView.getInt16(this.offset, false);
      }

      this.interpreter.u32le = 0;
      this.interpreter.i32le = 0;
      this.interpreter.u32be = 0;
      this.interpreter.i32be = 0;
      this.interpreter.f32le = 0;
      this.interpreter.f32be = 0;
      this.interpreter.tu32le = 0;
      this.interpreter.tu32be = 0;
      this.interpreter.tf32le = 0;
      this.interpreter.tf32be = 0;
      if (this.offset + 4 <= this.dataView.byteLength) {
        this.interpreter.u32le = this.dataView.getUint32(this.offset, true);
        this.interpreter.i32le = this.dataView.getInt32(this.offset, true);
        this.interpreter.u32be = this.dataView.getUint32(this.offset, false);
        this.interpreter.i32be = this.dataView.getInt32(this.offset, false);
        this.interpreter.f32le = this.dataView.getFloat32(this.offset, true);
        this.interpreter.f32be = this.dataView.getFloat32(this.offset, false);
        this.interpreter.tu32le = this.toTimestampString(
          this.dataView.getUint32(this.offset, true)
        );
        this.interpreter.tu32be = this.toTimestampString(
          this.dataView.getUint32(this.offset, false)
        );
        this.interpreter.tf32le = this.toTimestampString(
          this.dataView.getFloat32(this.offset, true)
        );
        this.interpreter.tf32be = this.toTimestampString(
          this.dataView.getFloat32(this.offset, false)
        );
      }
      this.interpreter.f64le = 0;
      this.interpreter.f64be = 0;
      this.interpreter.u64le = 0;
      this.interpreter.u64be = 0;
      if (this.offset + 8 <= this.dataView.byteLength) {
        this.interpreter.u64le = this.dataView.getUint64(this.offset, true);
        this.interpreter.u64be = this.dataView.getUint64(this.offset, false);
        this.interpreter.f64le = this.dataView.getFloat64(this.offset, true);
        this.interpreter.f64be = this.dataView.getFloat64(this.offset, false);
      }
    },
    handleValueClick(valueIndex) {
      this.goToChar(valueIndex);
    },
    handleLineClick(lineIndex) {
      this.goToLineRelative(lineIndex);
      this.updateInterpreter();
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
<style>
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
.interpreter form .settings-row {
  display: flex;
  flex-direction: row;
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
}
.interpreter .u8 .type,
.interpreter .i8 .type {
  color: #c66;
}
.interpreter .u8 .value,
.interpreter .i8 .value {
  color: #df9f9f;
}
.interpreter .u16le .type,
.interpreter .i16le .type {
  color: #c96;
}
.interpreter .u16le .value,
.interpreter .i16le .value {
  color: #dfbf9f;
}
.interpreter .u16be .type,
.interpreter .i16be .type {
  color: #cc6;
}
.interpreter .u16be .value,
.interpreter .i16be .value {
  color: #dfdf9f;
}
.interpreter .u32le .type,
.interpreter .i32le .type {
  color: #9c6;
}
.interpreter .u32le .value,
.interpreter .i32le .value {
  color: #bfdf9f;
}
.interpreter .u32be .type,
.interpreter .i32be .type {
  color: #6c6;
}
.interpreter .u32be .value,
.interpreter .i32be .value {
  color: #9fdf9f;
}
.interpreter .f32le .type,
.interpreter .f32be .type {
  color: #6c9;
}
.interpreter .f32le .value,
.interpreter .f32be .value {
  color: #9fdfbf;
}
.interpreter .f64le .type,
.interpreter .f64be .type {
  color: #6cc;
}
.interpreter .f64le .value,
.interpreter .f64be .value {
  color: #9fdfdf;
}
.interpreter .tu32le .type,
.interpreter .tu32be .type {
  color: #69c;
}
.interpreter .tu32le .value,
.interpreter .tu32be .value {
  color: #9fbfdf;
}
.interpreter .tf32le .type,
.interpreter .tf32be .type {
  color: #7070c2;
}
.interpreter .tf32le .value,
.interpreter .tf32be .value {
  color: #a6a6d9;
}
</style>
