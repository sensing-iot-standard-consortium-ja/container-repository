<template>
  <div>
    <DataLoader v-model="dataView" />
    <HexViewer :container="container" :dataView="dataView" />
    <IotContainer v-model="container" :dataView="dataView" />
  </div>
</template>

<script>
DataView.prototype.getUint64 = function (byteOffset, littleEndian) {
  // split 64-bit number into two 32-bit (4-byte) parts
  const left = this.getUint32(byteOffset, littleEndian);
  const right = this.getUint32(byteOffset + 4, littleEndian);

  // combine the two 32-bit values
  const combined = littleEndian
    ? left + 2 ** 32 * right
    : 2 ** 32 * left + right;

  if (!Number.isSafeInteger(combined)) {
    console.warn(combined, "exceeds MAX_SAFE_INTEGER. Precision may be lost");
  }

  return combined;
};
export default {
  data() {
    return {
      dataView: null,
      container: null,
      schema: [],
    };
  },
};
</script>
