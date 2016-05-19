(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var video = document.getElementById('camera');

// Temporary hack, set to roomba computer.
// Robot does not have rossserver.
var ros = new ROSLIB.Ros({
    url : 'wss`://roomba.cs.washington.edu:9090'
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
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9jc2UvZHNpbHZhX2hhZ2dlcl9tYXRodXIvamVldmVzL3NjcmlwdHMvUVJjYXB0dXJlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFOUMsMENBQTBDO0FBQzFDLGtDQUFrQztBQUNsQyxJQUFJLEdBQUcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDckIsR0FBRyxHQUFHLHNDQUFzQztBQUNoRCxDQUFDLENBQUMsQ0FBQzs7QUFFSCxHQUFHLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxXQUFXO0lBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztBQUNsRCxDQUFDLENBQUMsQ0FBQzs7QUFFSCxJQUFJLGFBQWEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDakMsR0FBRyxHQUFHLEdBQUc7SUFDVCxJQUFJLEdBQUcsaUJBQWlCO0lBQ3hCLFdBQVcsR0FBRyxjQUFjO0FBQ2hDLENBQUMsQ0FBQyxDQUFDO0FBQ0g7O0FBRUEsWUFBWSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLFNBQVMsR0FBRyxFQUFFLEdBQUcsRUFBRTtNQUNwRCxJQUFJLGNBQWMsR0FBRyxHQUFHLENBQUM7QUFDL0IsTUFBTSxJQUFJLElBQUksR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztNQUVyQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7VUFDaEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1VBQ25CLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztVQUNwQixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7VUFDdkIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1VBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7VUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztVQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1VBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7VUFDdEIsSUFBSSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDO2NBQzNCLElBQUksR0FBRyxJQUFJO2NBQ1gsWUFBWSxFQUFFLEtBQUs7Y0FDbkIsUUFBUSxFQUFFLFFBQVE7Y0FDbEIsU0FBUyxFQUFFLFFBQVE7V0FDdEIsQ0FBQyxDQUFDO0FBQ2IsVUFBVSxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDOztPQUVoQztDQUNOLENBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgdmlkZW8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FtZXJhJyk7XG5cbi8vIFRlbXBvcmFyeSBoYWNrLCBzZXQgdG8gcm9vbWJhIGNvbXB1dGVyLlxuLy8gUm9ib3QgZG9lcyBub3QgaGF2ZSByb3Nzc2VydmVyLlxudmFyIHJvcyA9IG5ldyBST1NMSUIuUm9zKHtcbiAgICB1cmwgOiAnd3NzYDovL3Jvb21iYS5jcy53YXNoaW5ndG9uLmVkdTo5MDkwJ1xufSk7XG5cbnJvcy5vbignY29ubmVjdGlvbicsIGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdDb25uZWN0ZWQgdG8gd2Vic29ja2V0IHNlcnZlci4nKTtcbn0pO1xuXG52YXIgcXJfY29kZV90b3BpYyA9IG5ldyBST1NMSUIuVG9waWMoe1xuICAgIHJvcyA6IHJvcyxcbiAgICBuYW1lIDogJy9qZWV2ZXNfcXJfY29kZScsXG4gICAgbWVzc2FnZVR5cGUgOiAnamVldmVzL09yZGVyJ1xufSk7XG5cblxuUUNvZGVEZWNvZGVyKCkuZGVjb2RlRnJvbUNhbWVyYSh2aWRlbywgZnVuY3Rpb24oZXJyLCByZXMpIHtcbiAgICAgIHZhciBkZWNvZGVkTWVzc2FnZSA9IHJlcztcbiAgICAgIHZhciBkYXRhID0gZGVjb2RlZE1lc3NhZ2Uuc3BsaXQoJywnKTtcblxuICAgICAgaWYgKGxlbihkYXRhKSA9PSA0KSB7XG4gICAgICAgICAgdmFyIG5hbWUgPSBkYXRhWzBdO1xuICAgICAgICAgIHZhciBwaG9uZSA9IGRhdGFbMV07XG4gICAgICAgICAgdmFyIGxvY2F0aW9uID0gZGF0YVsyXTtcbiAgICAgICAgICB2YXIgZm9vZFR5cGUgPSBkYXRhWzNdO1xuICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgICAgY29uc29sZS5sb2cobmFtZSk7XG4gICAgICAgICAgY29uc29sZS5sb2cobG9jYXRpb24pO1xuICAgICAgICAgIGNvbnNvbGUubG9nKGZvb2RUeXBlKTtcbiAgICAgICAgICB2YXIgb3JkZXIgPSBuZXcgUk9TTElCLk1lc3NhZ2Uoe1xuICAgICAgICAgICAgICBuYW1lIDogbmFtZSxcbiAgICAgICAgICAgICAgcGhvbmVfbnVtYmVyOiBwaG9uZSxcbiAgICAgICAgICAgICAgbG9jYXRpb246IGxvY2F0aW9uLFxuICAgICAgICAgICAgICBmb29kX3R5cGU6IGZvb2RUeXBlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcXJfY29kZV90b3BpYy5wdWJsaXNoKG9yZGVyKTtcblxuICAgICAgfVxufSk7XG4iXX0=
