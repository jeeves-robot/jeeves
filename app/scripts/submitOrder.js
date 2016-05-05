var button = document.getElementById("submitOrder").onclick = processOrder;

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

  var payload = name + "," + location + "," + food;
  new QRCode(document.getElementById("qrcode"), payload);

};



