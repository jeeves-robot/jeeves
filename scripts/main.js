var video = document.getElementById('camera');

// Temporary hack, set to roomba computer.
// Robot does not have rossserver.
var ros = new ROSLIB.Ros({
    url : 'ws://roomba.cs.washington.edu:9090'
});

ros.on('connection', function() {
    console.log('Connected to websocket server.');
});

var qr_code_topic = new ROSLIB.Topic({
    ros : ros,
    name : '/jeeves_qr_code',
    messageType : 'jeeves/Order'
});


QCodeDecoder().decodeFromCamera(video, function(er,res){
    var decodedMessage = res
    var data = decodedMessage.split(',')
    var name = data[0]
    var location = data[1]
    var foodType = data[2]
    console.log(res)
    console.log(name)
    console.log(location)
    console.log(foodType)
    var order = new ROSLIB.Message({
        name : name,
        location: location,
        food_type: foodType
    });
    qr_code_topic.publish(order);
});
