var button = document.getElementById("submitOrder").onclick = processOrder;

function processOrder(){
  var name = document.getElementById("userName").value;
  var locationDrop = document.getElementById("dropdownLocation");
  var foodDrop = document.getElementById("dropdownFood");

    
  var location = locationDrop[locationDrop.selectedIndex].id;
  var food = foodDrop[foodDrop.selectedIndex].id

  console.log(name)
  console.log(location)
  console.log(food)
};



