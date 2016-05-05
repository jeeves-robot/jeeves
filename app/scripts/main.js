var video = document.getElementById('camera');
var decodedMessage = ""
QCodeDecoder().decodeFromCamera(video, function(er,res){
  decodedMessage = res
  console.log(res);                     
});

var ros = new ROSLIB.Ros({
  url : 'ws://localhost:9090'
});

ros.on('connection', function() {
  console.log('Connected to websocket server.');
});

var qr_code_topic = new ROSLIB.Topic({
  ros : ros,
  name : '/jeeves_qr_code',
  messageType : 'std_msgs/String'
});

var message = new ROSLIB.Message({
  linear : {
    x : 0.1,
    y : 0.2,
    z : 0.3
  },
  angular : {
    x : -0.1,
    y : -0.2,
    z : -0.3
  }
});
qr_code_topic.publish(twist);
