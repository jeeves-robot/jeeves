(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function processOrder(){
  // TODO: what if there's an '?
  var name = document.getElementById("name").value;
  var phoneNumber = document.getElementById("phoneNumber").value;
  var locationDrop = document.getElementById("dropdownLocation");
  var foodDrop = document.getElementById("dropdownFood");

  var location = locationDrop[locationDrop.selectedIndex].id;
  var food = foodDrop[foodDrop.selectedIndex].id;

    //  console.log(name)
    //  console.log(location)
    //  console.log(food)

    var newUrl = '/payment.html?name=' + name + '&phone=' + phoneNumber + '&location=' + location + '&food='+food;
  document.location.href=newUrl;
}

var button = document.getElementById("submitOrder").onclick = processOrder;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9jc2UvZHNpbHZhX2hhZ2dlcl9tYXRodXIvamVldmVzL3NjcmlwdHMvc3VibWl0T3JkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxTQUFTLFlBQVksRUFBRTs7RUFFckIsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUM7RUFDakQsSUFBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxLQUFLLENBQUM7RUFDL0QsSUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0FBQ2pFLEVBQUUsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQzs7RUFFdkQsSUFBSSxRQUFRLEdBQUcsWUFBWSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDN0QsRUFBRSxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNqRDtBQUNBO0FBQ0E7QUFDQTs7SUFFSSxJQUFJLE1BQU0sR0FBRyxxQkFBcUIsR0FBRyxJQUFJLEdBQUcsU0FBUyxHQUFHLFdBQVcsR0FBRyxZQUFZLEdBQUcsUUFBUSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7RUFDaEgsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQ2hDLENBQUM7O0FBRUQsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImZ1bmN0aW9uIHByb2Nlc3NPcmRlcigpe1xuICAvLyBUT0RPOiB3aGF0IGlmIHRoZXJlJ3MgYW4gJz9cbiAgdmFyIG5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVcIikudmFsdWU7XG4gIHZhciBwaG9uZU51bWJlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGhvbmVOdW1iZXJcIikudmFsdWU7XG4gIHZhciBsb2NhdGlvbkRyb3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRyb3Bkb3duTG9jYXRpb25cIik7XG4gIHZhciBmb29kRHJvcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZHJvcGRvd25Gb29kXCIpO1xuXG4gIHZhciBsb2NhdGlvbiA9IGxvY2F0aW9uRHJvcFtsb2NhdGlvbkRyb3Auc2VsZWN0ZWRJbmRleF0uaWQ7XG4gIHZhciBmb29kID0gZm9vZERyb3BbZm9vZERyb3Auc2VsZWN0ZWRJbmRleF0uaWQ7XG5cbiAgICAvLyAgY29uc29sZS5sb2cobmFtZSlcbiAgICAvLyAgY29uc29sZS5sb2cobG9jYXRpb24pXG4gICAgLy8gIGNvbnNvbGUubG9nKGZvb2QpXG5cbiAgICB2YXIgbmV3VXJsID0gJy9wYXltZW50Lmh0bWw/bmFtZT0nICsgbmFtZSArICcmcGhvbmU9JyArIHBob25lTnVtYmVyICsgJyZsb2NhdGlvbj0nICsgbG9jYXRpb24gKyAnJmZvb2Q9Jytmb29kO1xuICBkb2N1bWVudC5sb2NhdGlvbi5ocmVmPW5ld1VybDtcbn1cblxudmFyIGJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3VibWl0T3JkZXJcIikub25jbGljayA9IHByb2Nlc3NPcmRlcjtcbiJdfQ==