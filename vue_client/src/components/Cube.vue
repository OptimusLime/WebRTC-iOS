<template>
  <mesh name="Cube">
    <geometry type="Box" :args="[size, size, size]"></geometry>
    <material type="MeshBasic">
      <texture :url="require(`@/assets/${texture}.png`)"></texture>
    </material>
  </mesh>
</template>

<script>
import { Object3D } from "vue-threejs";
export default {
  name: "cube",
  mixins: [Object3D],
  props: { size: Number, texture: String },
};
</script>