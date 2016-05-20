# Jeeves

#### Install gulp

npm install -g gulp

#### Install Firebase CLI

npm install -g firebase-tools

#### Install NPM modules

npm install

#### Build the app

gulp

#### Serve the app

python -m SimpleHTTPServer 8888

roslaunch rosbridge_server rosbridge_websocket.launch ssl:=true certfile:=/cert.pem keyfile:=/key.pem authenticate:=false

#### Deploy the app

cd public

firebase deploy

The app is hosted at https://jeeves-server.firebaseapp.com.

#### Run the notifications server

node send_notifications.js
