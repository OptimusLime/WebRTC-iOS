<template>
  <div>
    <!-- <mesh v-if="mesh != null" name="Face" :obj="mesh"> -->
    <!-- <geometry ref="geometry" type="Buffer"></geometry>
            <material type="MeshStandard" :color="0x4400ff">
            </material> -->
    <!-- </mesh> -->
  </div>
</template>

<script>
// const geometry = new THREE.BufferGeometry();
// // create a simple square shape. We duplicate the top left and bottom right
// // vertices because each vertex needs to appear once per triangle.
// const vertices = new Float32Array( [
// 	-1.0, -1.0,  1.0,
// 	 1.0, -1.0,  1.0,
// 	 1.0,  1.0,  1.0,

// 	 1.0,  1.0,  1.0,
// 	-1.0,  1.0,  1.0,
// 	-1.0, -1.0,  1.0
// ] );

// // itemSize = 3 because there are 3 values (components) per vertex
// geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
// const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
// const mesh = new THREE.Mesh( geometry, material );
import {
  BufferAttribute,
  RepeatWrapping,
  TextureLoader,
  BufferGeometry,
  Mesh,
  SphereGeometry,
  WireframeGeometry,
  LineSegments,
  LineBasicMaterial,
  MeshStandardMaterial,
} from "three";
import { Object3D } from "vue-threejs";
export default {
  name: "face",
  mixins: [Object3D],
  props: { size: Number, texture: String, vertices: Array, scene: Object },
  data: function () {
    return {
      sphereGeometry: new SphereGeometry(10, 10, 10),
      mesh_object: null,
      bufferGeom: null,
      meshMaterial: null,
      wireMesh: null,
      txtOpts: {
        url: require("@/assets/water.jpg"),
        wrapS: RepeatWrapping,
        wrapT: RepeatWrapping,
        repeat: [5, 5],
      },
    };
  },
  watch: {
    vertices() {
      //   console.log("vertex adust");
      //   this.updateGeometry();
      if (this.bufferGeom == null) this.bufferGeom = new BufferGeometry();

      if (this.mesh_object == null) {
        this.meshMaterial = new MeshStandardMaterial({ color: "purple" });
        this.mesh_object = new Mesh(this.bufferGeom, this.meshMaterial);
      }
      this.bufferGeom.setAttribute(
        "position",
        new BufferAttribute(new Float32Array(this.vertices), 3)
      );
      this.bufferGeom.needsUpdate = true;

      if (this.wireMesh != null) {
        this.scene.curObj.remove(this.wireMesh);
        this.wireMesh = null;
      }
      const lineBasic = new LineBasicMaterial({ color: 0xaa33bb });
      const wireframe = new WireframeGeometry(this.bufferGeom);
      this.wireMesh = new LineSegments(wireframe, lineBasic);
      this.wireMesh.material.depthTest = false;
      this.wireMesh.material.opacity = 0.75;
      //   this.wireMesh.material.color = new uniform3fv(0.5, 0.5, 0.5);
      this.wireMesh.material.transparent = true;
      this.scene.curObj.add(this.wireMesh);
    },
    scene() {
      //   console.log("Scene watch update");
      //   //   var self = this;
      //   const line = new LineSegments(wireframe);
      //   line.material.depthTest = false;
      //   line.material.opacity = 0.25;
      //   line.material.transparent = true;
    },
  },
  computed: {
    mesh() {
      console.log("scene", this.scene);

      //   if (this.$refs.geometry == null) return null
      return this.mesh_object;
    },
    faceTexture() {
      // create a texture loader.
      const textureLoader = new TextureLoader();

      // load a texture
      const texture = textureLoader.load("@/assets/water.jpg");
      return texture;
    },
  },
  methods: {
    updateGeometry() {
      //   console.log(this.vertices);
      var geom = this.$refs.geometry.geometry;
      geom.setAttribute(
        "position",
        new BufferAttribute(new Float32Array(this.vertices), 3)
      );
      geom.needsUpdate = true;
    },
  },
  created: function () {
    // const vertices = new Float32Array([
    //   -1.0,
    //   -1.0,
    //   1.0,
    //   1.0,
    //   -1.0,
    //   1.0,
    //   1.0,
    //   1.0,
    //   1.0,
    //   1.0,
    //   1.0,
    //   1.0,
    //   -1.0,
    //   1.0,
    //   1.0,
    //   -1.0,
    //   -1.0,
    //   1.0,
    // ]);
    // var self = this;
    // this.$nextTick(function () {
    //   console.log(self.$refs);
    //   self.updateGeometry();
    // });
  },
};
</script>

