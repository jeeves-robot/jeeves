var ros = new ROSLIB.Ros({
    url : 'ws://localhost:9090'
});

ros.on('connection', function() {
    console.log('Connected to websocket server.');
});

var order_topic = new ROSLIB.Topic({
    ros : ros,
    name : '/jeeves_order',
    messageType : 'jeeves/Order'
});


function processOrder(){
  // TODO: what if there's an '?
  var name = document.getElementById("userName").value;
  var locationDrop = document.getElementById("dropdownLocation");
  var foodDrop = document.getElementById("dropdownFood");

  var location = locationDrop[locationDrop.selectedIndex].id;
  var food = foodDrop[foodDrop.selectedIndex].id

  console.log(name)
  console.log(location)
  console.log(food)

  var newUrl = '/credit.html?name=' + name + '&location=' + location + '&food='+food;
  document.location.href=newUrl;
};



var button = document.getElementById("submitOrder").onclick = processOrder;
