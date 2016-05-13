function processOrder(){
  // TODO: what if there's an '?
  var name = document.getElementById("name").value;
  var phoneNumber = document.getElementById("phoneNumber").value;
  var locationDrop = document.getElementById("dropdownLocation");
  var foodDrop = document.getElementById("dropdownFood");

  var location = locationDrop[locationDrop.selectedIndex].id;
  var food = foodDrop[foodDrop.selectedIndex].id

    //  console.log(name)
    //  console.log(location)
    //  console.log(food)

    var newUrl = '/credit.html?name=' + name + '&phone=' + phoneNumber + '&location=' + location + '&food='+food;
  document.location.href=newUrl;
};

var button = document.getElementById("submitOrder").onclick = processOrder;
