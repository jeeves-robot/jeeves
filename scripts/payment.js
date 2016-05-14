var Firebase = require('firebase');

firebaseRef = new Firebase("https://jeeves-server.firebaseio.com/orders");

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

  console.log(name);
  console.log(location);
  console.log(food);


  var order = {
      name : name,
      phone_number : phoneNumber,
      location : location,
      food_type : food
  };
  firebaseRef.push(order);
  firebaseRef.off()

  //var orderData = [name, phoneNumber, location, food]
  //var payload = orderData.join()
  // new QRCode(document.getElementById("qrcode"), payload);
  // document.location.href='prepare.html';
  toggle_visibility("payment-form");
  toggle_visibility("thank-you");

};

var button = document.getElementById("placeOrder").onclick = processOrder;
