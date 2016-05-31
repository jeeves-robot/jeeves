var QRCodeReader = require('qrcode-reader');
var Firebase = require('firebase');

firebaseRef = new Firebase("https://jeeves-server.firebaseio.com/logs");

var video  = document.getElementById('camera');
var canvas = document.getElementById('qr-canvas');
var ctx    = canvas.getContext('2d');

function log(message) {
  console.log(message)
  firebaseRef.push(message);
}

log("Loaded delivery page.");

// Temporary hack, set to roomba computer.
// Robot does not have rossserver.
var ros = new ROSLIB.Ros({
    url : 'wss://roomba.cs.washington.edu:9090'
});

ros.on('error', function(err) {
    log(err);
});

ros.on('connection', function() {
    log('Connected to websocket server.');
});

var qr_code_topic = new ROSLIB.Topic({
    ros : ros,
    name : '/jeeves_qr_code',
    messageType : 'jeeves/Order'
});

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

if (navigator.getUserMedia) {
    navigator.getUserMedia({video: true}, handleVideo, videoError);
}

function handleVideo(stream) {
    video.src = window.URL.createObjectURL(stream);
}

function videoError(e) {
    log(e);
}

var reader = new QRCodeReader();
reader.callback = function (res) {
  if (!res.startsWith('error')) {
    log(res);
    var data = res.split(',');
    if (data.length == 4) {
        var name = data[0];
        var phone = data[1];
        var location = data[2];
        var foodType = data[3];
        log(res);
        log(name);
        log(location);
        log(foodType);
        var order = new ROSLIB.Message({
            name : name,
            phone_number: phone,
            location: location,
            food_type: foodType
        });
        qr_code_topic.publish(order);
      }
  }
  else {
    //log(res);
  }
};

video.addEventListener('play', function () {
    var $this = this; //cache
    width = video.clientWidth;
    height = video.clientHeight;
    canvas.width = width;
    canvas.height = height;
    (function loop() {
        if (!$this.paused && !$this.ended) {
            ctx.drawImage($this, 0, 0);
            setTimeout(loop, 1000 / 30); // drawing at 30fps
            reader.decode();
        }
    })();
}, 0);

window.onunload = function() {
  firebaseRef.off();
};
