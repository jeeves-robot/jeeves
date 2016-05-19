(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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


QCodeDecoder().decodeFromCamera(video, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      var decodedMessage = res;
      var data = decodedMessage.split(',');

      if (len(data) == 4) {
          var name = data[0];
          var phone = data[1];
          var location = data[2];
          var foodType = data[3];
          console.log(res);
          console.log(name);
          console.log(location);
          console.log(foodType);
          var order = new ROSLIB.Message({
              name : name,
              phone_number: phone,
              location: location,
              food_type: foodType
          });
          qr_code_topic.publish(order);

      }
    }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9jc2UvZHNpbHZhX2hhZ2dlcl9tYXRodXIvamVldmVzL3NjcmlwdHMvUVJjYXB0dXJlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFOUMsMENBQTBDO0FBQzFDLGtDQUFrQztBQUNsQyxJQUFJLEdBQUcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDckIsR0FBRyxHQUFHLG9DQUFvQztBQUM5QyxDQUFDLENBQUMsQ0FBQzs7QUFFSCxHQUFHLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxXQUFXO0lBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztBQUNsRCxDQUFDLENBQUMsQ0FBQzs7QUFFSCxJQUFJLGFBQWEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDakMsR0FBRyxHQUFHLEdBQUc7SUFDVCxJQUFJLEdBQUcsaUJBQWlCO0lBQ3hCLFdBQVcsR0FBRyxjQUFjO0FBQ2hDLENBQUMsQ0FBQyxDQUFDO0FBQ0g7O0FBRUEsWUFBWSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLFNBQVMsR0FBRyxFQUFFLEdBQUcsRUFBRTtJQUN0RCxJQUFJLEdBQUcsRUFBRTtNQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDbEIsTUFBTTtNQUNMLElBQUksY0FBYyxHQUFHLEdBQUcsQ0FBQztBQUMvQixNQUFNLElBQUksSUFBSSxHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7O01BRXJDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtVQUNoQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7VUFDbkIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1VBQ3BCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztVQUN2QixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7VUFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztVQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1VBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7VUFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztVQUN0QixJQUFJLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUM7Y0FDM0IsSUFBSSxHQUFHLElBQUk7Y0FDWCxZQUFZLEVBQUUsS0FBSztjQUNuQixRQUFRLEVBQUUsUUFBUTtjQUNsQixTQUFTLEVBQUUsUUFBUTtXQUN0QixDQUFDLENBQUM7QUFDYixVQUFVLGFBQWEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7O09BRWhDO0tBQ0Y7Q0FDSixDQUFDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHZpZGVvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbWVyYScpO1xuXG4vLyBUZW1wb3JhcnkgaGFjaywgc2V0IHRvIHJvb21iYSBjb21wdXRlci5cbi8vIFJvYm90IGRvZXMgbm90IGhhdmUgcm9zc3NlcnZlci5cbnZhciByb3MgPSBuZXcgUk9TTElCLlJvcyh7XG4gICAgdXJsIDogJ3dzOi8vcm9vbWJhLmNzLndhc2hpbmd0b24uZWR1OjkwOTAnXG59KTtcblxucm9zLm9uKCdjb25uZWN0aW9uJywgZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ0Nvbm5lY3RlZCB0byB3ZWJzb2NrZXQgc2VydmVyLicpO1xufSk7XG5cbnZhciBxcl9jb2RlX3RvcGljID0gbmV3IFJPU0xJQi5Ub3BpYyh7XG4gICAgcm9zIDogcm9zLFxuICAgIG5hbWUgOiAnL2plZXZlc19xcl9jb2RlJyxcbiAgICBtZXNzYWdlVHlwZSA6ICdqZWV2ZXMvT3JkZXInXG59KTtcblxuXG5RQ29kZURlY29kZXIoKS5kZWNvZGVGcm9tQ2FtZXJhKHZpZGVvLCBmdW5jdGlvbihlcnIsIHJlcykge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBkZWNvZGVkTWVzc2FnZSA9IHJlcztcbiAgICAgIHZhciBkYXRhID0gZGVjb2RlZE1lc3NhZ2Uuc3BsaXQoJywnKTtcblxuICAgICAgaWYgKGxlbihkYXRhKSA9PSA0KSB7XG4gICAgICAgICAgdmFyIG5hbWUgPSBkYXRhWzBdO1xuICAgICAgICAgIHZhciBwaG9uZSA9IGRhdGFbMV07XG4gICAgICAgICAgdmFyIGxvY2F0aW9uID0gZGF0YVsyXTtcbiAgICAgICAgICB2YXIgZm9vZFR5cGUgPSBkYXRhWzNdO1xuICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgICAgY29uc29sZS5sb2cobmFtZSk7XG4gICAgICAgICAgY29uc29sZS5sb2cobG9jYXRpb24pO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGZvb2RUeXBlKTtcbiAgICAgICAgICB2YXIgb3JkZXIgPSBuZXcgUk9TTElCLk1lc3NhZ2Uoe1xuICAgICAgICAgICAgICBuYW1lIDogbmFtZSxcbiAgICAgICAgICAgICAgcGhvbmVfbnVtYmVyOiBwaG9uZSxcbiAgICAgICAgICAgICAgbG9jYXRpb246IGxvY2F0aW9uLFxuICAgICAgICAgICAgICBmb29kX3R5cGU6IGZvb2RUeXBlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcXJfY29kZV90b3BpYy5wdWJsaXNoKG9yZGVyKTtcblxuICAgICAgfVxuICAgIH1cbn0pO1xuIl19
