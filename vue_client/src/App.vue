<template>
  <div id="app">
    <h2>Vue.js WebSocket Tutorial</h2>
    <HelloWorld :face="faceData" />

    <div class="camera-box">
      <video id="received_video" autoplay style="width: 400px"></video>
      <video id="local_video" autoplay muted style="width: 400px"></video>
      <button id="hangup-button" @click="sendDataButton()" disabled>
        Send Data
      </button>
    </div>
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld";
export default {
  name: "App",
  components: {
    HelloWorld,
  },
  data: function () {
    return {
      connection: null,
      myPeerConnection: null,
      remoteDataChannel: null,
      localDataChannel: null,
      faceData: null,
    };
  },
  created: function () {
    var self = this;
    console.log("Starting connection to WebSocket Server");
    this.connection = new WebSocket("ws://192.168.1.238:7070");

    this.connection.onmessage = async function (event) {
      // console.log(event);
      var edata = JSON.parse(await event.data.text());
      if (edata.type == "SessionDescription" && edata.payload.type == "offer") {
        self.handleVideoOfferMsg(edata.payload);
      } else if (edata.type == "IceCandidate") {
        self.handleNewICECandidateMsg(edata.payload);
      } else if (edata.type == "FaceDescription") {
        self.handleFaceDescription(edata.payload);
      } else console.log("message", edata);
    };

    this.connection.onopen = async function (event) {
      console.log(event);
      // var emessage = await event.data.text()
      console.log("Successfully connected to the echo websocket server...");
    };
  },
  methods: {
    createPeerConnection() {
      this.myPeerConnection = new RTCPeerConnection({
        iceServers: [
          // Information about ICE servers - Use your own!
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      });

      var sendChannel = this.myPeerConnection.createDataChannel("WebRTCData");

      sendChannel.onmessage = this.handleAnyMessage;
      sendChannel.onopen = this.handleLocalDataChannelStatus;
      sendChannel.onclose = this.handleLocalDataChannelStatus;
      this.localDataChannel = sendChannel;

      this.myPeerConnection.onicecandidate = this.handleICECandidateEvent;
      this.myPeerConnection.ontrack = this.handleTrackEvent;
      this.myPeerConnection.ondatachannel = this.handleDataChannelEvent;
      this.myPeerConnection.onnegotiationneeded = this.handleNegotiationNeededEvent;
      this.myPeerConnection.onremovetrack = this.handleRemoveTrackEvent;
      // this.myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
      // this.myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
      // this.myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
    },
    async handleAnyMessage(evt) {
      var enc = new TextDecoder("utf-8");
      var emsg = enc.decode(evt.data);
      console.log("incoming data message", emsg);
    },
    handleNegotiationNeededEvent() {
      console.warn("wants negotiation unhandled");
    },
    handleLocalDataChannelStatus(evt) {
      console.log("local status change", evt);
    },
    handleDataChannelEvent(event) {
      console.log("DATA Channel establish", event);

      var receiveChannel = event.channel;
      receiveChannel.onmessage = this.handleReceiveMessage;
      receiveChannel.onopen = this.handleDataChannelOpen;
      receiveChannel.onclose = this.handleDataChannelClose;
      this.remoteDataChannel = receiveChannel;
    },
    handleReceiveMessage(msg) {
      console.log("Incoming data channel", msg);
    },

    handleDataChannelOpen(msg) {
      console.log("data channel open ", msg);
      var message = "hello friend";
      // const blob = new Blob([JSON.stringify(message, null, 2)], {
      //   type: "application/json",
      // });

      this.remoteDataChannel.send(message);
    },
    sendDataButton() {
      if (this.remoteDataChannel) {
        this.remoteDataChannel.send("button msg");
      }
    },
    handleDataChannelClose(msg) {
      console.log(" data channel close ", msg);
    },
    handleTrackEvent(event) {
      document.getElementById("received_video").srcObject = event.streams[0];
      document.getElementById("hangup-button").disabled = false;
    },
    handleRemoveTrackEvent(event) {
      console.log("rem track", event);
      var stream = document.getElementById("received_video").srcObject;
      var trackList = stream.getTracks();

      if (trackList.length == 0) {
        this.closeVideoCall();
      }
    },
    handleICECandidateEvent(event) {
      if (event.candidate) {
        console.log("ice cand added", event.candidate);

        var message = {
          type: "IceCandidate",
          payload: {
            sdp: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
          },
        };
        this.sendToServer(message);
      }
    },

    handleFaceDescription(face_info) {
      // now we need to base64 decode into a json string then parse
      var blend_info = atob(face_info.json_blend);
      var blend_obj = JSON.parse(blend_info);

      var geom_info = atob(face_info.json_geometry);
      var geom_obj = JSON.parse(geom_info);
      // console.log("geom info", geom_obj);
      this.faceData = { faceInfo: blend_obj, faceGeometry: geom_obj };
    },
    sendToServer(message) {
      console.log("return message", message);
      const blob = new Blob([JSON.stringify(message, null, 2)], {
        type: "application/json",
      });
      // send back our answer
      this.connection.send(blob);
    },
    handleGetUserMediaError(err) {
      console.error(err);
    },
    handleNewICECandidateMsg(msg) {
      console.log("Handle ice cand", msg);
      var candidate = new RTCIceCandidate(msg);

      this.myPeerConnection
        .addIceCandidate(candidate)
        .catch(this.handleGetUserMediaError);
    },

    handleVideoOfferMsg(msg) {
      var localStream = null;

      // targetUsername = msg.name;
      this.createPeerConnection();
      console.log("handle offer msg", msg);
      var desc = new RTCSessionDescription(msg);
      var mediaConstraints = {
        audio: true, // We want an audio track
        video: true, // ...and we want a video track
      };
      var self = this;
      self.myPeerConnection
        .setRemoteDescription(desc)
        .then(function () {
          return navigator.mediaDevices.getUserMedia(mediaConstraints);
        })
        .then(function (stream) {
          localStream = stream;
          document.getElementById("local_video").srcObject = localStream;

          localStream
            .getTracks()
            .forEach((track) =>
              self.myPeerConnection.addTrack(track, localStream)
            );
        })
        .then(function () {
          return self.myPeerConnection.createAnswer();
        })
        .then(function (answer) {
          return self.myPeerConnection.setLocalDescription(answer);
        })
        .then(function () {
          var message = {
            type: "SessionDescription",
            payload: self.myPeerConnection.localDescription,
          };

          self.sendToServer(message);

          // console.log("return message", message);

          // const blob = new Blob([JSON.stringify(message, null, 2)], {
          //   type: "application/json",
          // });

          // // send back our answer
          // self.connection.send(blob);

          // console.log("Ready to return: ");
          // var msg = {
          //   name: myUsername,
          //   target: targetUsername,
          //   type: "video-answer",
          //   sdp: self.myPeerConnection.localDescription,
          // };
          // sendToServer(msg);
        })
        .catch(self.handleGetUserMediaError);
    },
    closeVideoCall() {
      var remoteVideo = document.getElementById("received_video");
      var localVideo = document.getElementById("local_video");

      if (this.myPeerConnection) {
        this.myPeerConnection.ontrack = null;
        this.myPeerConnection.onremovetrack = null;
        this.myPeerConnection.onremovestream = null;
        this.myPeerConnection.onicecandidate = null;
        this.myPeerConnection.oniceconnectionstatechange = null;
        this.myPeerConnection.onsignalingstatechange = null;
        this.myPeerConnection.onicegatheringstatechange = null;
        this.myPeerConnection.onnegotiationneeded = null;

        if (remoteVideo.srcObject) {
          remoteVideo.srcObject.getTracks().forEach((track) => track.stop());
        }

        if (localVideo.srcObject) {
          localVideo.srcObject.getTracks().forEach((track) => track.stop());
        }

        this.myPeerConnection.close();
        this.myPeerConnection = null;
      }

      remoteVideo.removeAttribute("src");
      remoteVideo.removeAttribute("srcObject");
      localVideo.removeAttribute("src");
      remoteVideo.removeAttribute("srcObject");

      document.getElementById("hangup-button").disabled = true;
      // targetUsername = null;
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>