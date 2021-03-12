<template>
  <div>
    <mesh name="Ocean" @update:obj="handleMesh">
      <geometry type="Plane" :args="[10000, 10000, 40, 40]"></geometry>
      <material type="MeshBasic" :color="0x0044ff">
        <texture :options="txtOpts"></texture>
      </material>
    </mesh>
    <animation v-if="geom" :fn="animate" :speed="5"></animation>
  </div>
</template>

<script>
import { RepeatWrapping, DynamicDrawUsage } from "three";
import { Object3D } from "vue-threejs";
// http://threejs.org/examples/#webgl_geometry_dynamic
export default {
  name: "Ocean",
  mixins: [Object3D],
  data() {
    return {
      txtOpts: {
        url: require("@/assets/water.jpg"),
        wrapS: RepeatWrapping,
        wrapT: RepeatWrapping,
        repeat: [5, 5],
      },
      geom: null,
    };
  },
  methods: {
    handleMesh(mesh) {
      if (!mesh) return;
      let g = mesh.geometry;
      g.rotateX(-Math.PI / 2);
      // console.log(g);
      const position = g.attributes.position;
      position.usage = DynamicDrawUsage;

      for (let i = 0; i < position.count; i++) {
        const y = 35 * Math.sin(i / 2);
        position.setY(i, y);
      }

      this.geom = g;
    },
    animate(tt) {
      // console.log(tt);
      let g = this.geom;

      const position = g.attributes.position;
      position.usage = DynamicDrawUsage;

      for (let i = 0; i < position.count; i++) {
        const y = 35 * Math.sin(i / 5 + (tt + i) / 7);
        position.setY(i, y);
      }
      // for (let i = 0, l = g.vertices.length; i < l; i++) {
      //   g.vertices[i].y = 10 * Math.sin(i / 5 + (tt + i) / 7);
      // }
      position.needsUpdate = true;
      // g.verticesNeedUpdate = true;
    },
  },
};
</script>