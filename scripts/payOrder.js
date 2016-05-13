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

function getParameterByName(name, url) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if(!results || !results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

function toggle_visibility(id) {
  var e = document.getElementById(id);
  if (e.style.display == 'none')
    e.style.display = 'block';
  else
    e.style.display = 'none';
}

function processOrder(){
  // TODO: what if there's an '?
  var url = document.location.href;
  var name = getParameterByName('name', url);
  var phoneNumber = getParameterByName('phone', url);
  var location = getParameterByName('location', url);
  var food = getParameterByName('food', url);

//  console.log(name);
//  console.log(location);
//  console.log(food);

  var orderData = [name, phoneNumber, location, food]
  var payload = orderData.join()
  var order = new ROSLIB.Message( {
      name : name,
      phone_number : phoneNumber,
      location : location,
      food_type : food
  });
  order_topic.publish(order);
  ros.close();


  // new QRCode(document.getElementById("qrcode"), payload);
  // document.location.href='prepare.html';
  toggle_visibility("payment-form");
  toggle_visibility("thank-you");

};

var button = document.getElementById("placeOrder").onclick = processOrder;
