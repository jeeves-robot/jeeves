var twilio = require('twilio');
var Firebase = require('firebase');

ACCOUNT_SID = 'ACe6e5e687abec7cde17af75f1e7a09cb3'
AUTH_TOKEN = '6ac8584c51b7d15c518046ff03f9efa5'
TWILIO_NUM = '+19712523263'

client = twilio(ACCOUNT_SID, AUTH_TOKEN);
notifsRef = new Firebase("https://jeeves-server.firebaseio.com/notifs");

function sendSMS(phone_num, body) {
  client.sendMessage({
    to: phone_num,
    from: TWILIO_NUM,
    body: body
  }, function(err, data) {
      if (err)
        console.log(err)
      else
        console.log(data.body)
  });
}

notifsRef.on('child_added', function(snapshot) {
  var notif = snapshot.val();
  sendSMS(notif.to, notif.body);
  notifsRef.child(snapshot.key()).remove();
});
