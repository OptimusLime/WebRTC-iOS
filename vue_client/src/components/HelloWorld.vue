<template>
  <div class="hello">
    <h1 v-if="face != null">{{ face.faceInfo.tongueOut }}</h1>
    <renderer :size="size3d">
      <dat-gui :setup="uiSetup" :model="ui"></dat-gui>
      <scene ref="scene">
        <orbit-controls :position="ui.camera" :rotation="{ x: 2, y: 0, z: 3 }">
          <camera></camera>
          <audio-listener></audio-listener>
        </orbit-controls>
        <light
          :hex="0xefefff"
          :intensity="2"
          :position="{ x: 50, y: 50, z: 50 }"
        ></light>
        <light
          :hex="0xefefff"
          :intensity="2"
          :position="{ x: -50, y: -50, z: -50 }"
        ></light>
        <ocean :position="ui.ocean"></ocean>
        <Face
          texture="cobblestone"
          :vertices="faceVertexData"
          :scene="this_scene"
        />
        <div :key="ui.sysKey">
          <movement-system>
            <mass-object
              :rv0="{ x: 2, y: 2 }"
              :v0="{ x: 10 }"
              :f="{ x: -3, y: -2 }"
              :m="1"
            >
              <cube texture="cobblestone" :size="1"></cube>
            </mass-object>
            <mass-object
              :rv0="{ x: 2, z: 2 }"
              :v0="{ z: 20 }"
              :f="{ y: -1, z: -8 }"
              :m="1.2"
            >
              <cube texture="diamond" :size="1.2"></cube>
            </mass-object>
            <movement-object
              :rv0="{ x: 2, z: 2 }"
              :v0="{ x: 15, z: -20 }"
              :a="{ x: -6, y: 0.5, z: 6 }"
            >
              <cube texture="redwool" :size="1.1"></cube>
            </movement-object>
          </movement-system>
          <oimo-world :options="{ gravity: [0, 1, 0] }">
            <space-system :m-scale="10 ** 4">
              <space-object v-for="t in textures" :key="t">
                <oimo-body :options="{ move: true, density: 1 }">
                  <cube :texture="t" :size="1"></cube>
                </oimo-body>
              </space-object>
            </space-system>
          </oimo-world>
        </div>
      </scene>
    </renderer>
  </div>
</template>

<script>
import * as gui from "./gui";
import Cube from "./Cube";
import Ocean from "./Ocean";
import Face from "./Face";
export default {
  name: "HelloWorld",
  components: {
    Cube,
    Ocean,
    Face,
  },
  props: {
    face: Object,
  },
  mounted() {
    var self = this;
    this.$nextTick(function () {
      console.log("post mount check", self.$refs.scene);
      self.scene = self.$refs.scene;
    });
  },
  computed: {
    this_scene() {
      return this.scene;
    },
    faceVertexData() {
      if (this.face == null || this.face.faceGeometry == null)
        return this.faceVertices;
      var faceGeom = this.face.faceGeometry;
      // if (faceGeom == null) {
      //   return this.faceVertices;
      // }

      // console.log(faceGeom);

      var scale = 60;

      var faceVert = faceGeom.vertices;
      var faceTriIndex = faceGeom.triangleIndices;
      var triCount = faceGeom.triangleCount;

      // console.log(faceTriIndex, triCount);
      var all_points = [];
      for (var ix = 0; ix < triCount; ix++) {
        for (var triangle_ix = 0; triangle_ix < 3; triangle_ix++) {
          var tri_ix = faceTriIndex[3 * ix + triangle_ix];
          var pt = faceVert[tri_ix];
          all_points.push(scale * pt[0]);
          all_points.push(scale * pt[1]);
          all_points.push(scale * pt[2]);
        }
      }
      // console.log(all_points);
      return all_points;
    },
  },
  data: function () {
    let uiSetup = gui.setupPanel;
    let ui = gui.getModel();

    return {
      textures: ["cobblestone", "diamond", "redwool"],
      scene: null,
      faceVertices: [
        -1.0,
        -1.0,
        1.0,
        1.0,
        -1.0,
        1.0,
        1.0,
        1.0,
        1.0,

        1.0,
        1.0,
        1.0,
        -1.0,
        1.0,
        1.0,
        -1.0,
        -1.0,
        1.0,
      ],
      ui,
      uiSetup,
      size3d: {
        w: 1000,
        h: 1000,
      },
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

/* body {
  margin: 0;
  overflow: hidden;
} */
</style>
