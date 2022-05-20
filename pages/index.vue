<template>
  <div>
    <DataLoader v-model="dataView" />
    <HexViewer :container="container" :dataView="dataView" />
    <IotContainer v-model="container" :dataView="dataView" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      dataView: null,
      container: null,
      schema: [],
    };
  },
  mounted() {
    const arrayBuffer = new ArrayBuffer(0x17);
    const uint8 = new Uint8Array(arrayBuffer);
    uint8.set(
      [
        0xaa, 0xaa, 0x00, 0x17, 0x00, 0xde, 0xad, 0xbe, 0xef, 0x00, 0x01, 0xaa,
        0xaa, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x0e, 0x42,
      ],
      0
    );
    this.dataView = new DataView(arrayBuffer);
  },
};
</script>
<style></style>
