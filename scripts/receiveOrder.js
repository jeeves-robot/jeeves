var twilio = require('twilio');
var React = require('react');
var ReactDOM = require('react-dom');

TWILIO_ACCOUNT_SID = 'ACe6e5e687abec7cde17af75f1e7a09cb3';
TWILIO_AUTH_TOKEN = '6ac8584c51b7d15c518046ff03f9efa5';
TWILIO_PHONE_NUM = '+19712523263'

PHONE_NUM = '5034320633'
NAME='Mallika'
FOOD='Pizza'

twilio_client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

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



var OrderListItem = React.createClass({

    send_notification: function () {
      var message = this.props.order.name + ", your delivery of " + this.props.order.food + " is on its way!";
      //twilio_client.sendMessage( { to:PHONE_NUM, from:TWILIO_PHONE_NUM, body:message }, function( err, data ) {});
      console.log(message);
    },

    render: function() {
        return (
            <tr className='order-list-item'>
                <td className='order-name'>{this.props.order.name}</td>
                <td className='order-location'>{this.props.order.location}</td>
                <td className='order-food-type'>{this.props.order.food_type}</td>
                <td className='order-phone-number'>{this.props.order.phone_number}</td>
                <td>
                    <button onSubmit={this.send_notification} className='btn btn-success btn-sm'>Print QR Code</button>
                </td>
            </tr>
        );
    }

});

var OrderList = React.createClass({

    send_notification: function () {
      var message = "Bran, your delivery of Pizza is on its way!";
      //twilio_client.sendMessage( { to:PHONE_NUM, from:TWILIO_PHONE_NUM, body:message }, function( err, data ) {});
      console.log(message);
    },

    render: function() {
        var orderNodes = this.props.orders.map(function (order) {
            return (
                <OrderListItem order={order}></OrderListItem>
            );
        });

        return (
            <table className='table'>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Food Type</th>
                        <th>Phone Number</th>
                        <th></th>
                    </tr>
                    <tr>
                      <td>Bran</td>
                      <td>CSE 101</td>
                      <td>Pizza</td>
                      <td>(503) 432-0633</td>
                      <button onClick={this.send_notification}>Print QR Code</button>
                    </tr>
                </thead>
                { orderNodes }
            </table>
        );
    }
});

var OrderApp = React.createClass({
    getInitialState: function() {
        return { orders: [] };
    },

    componentWillMount: function() {
        var that = this;
        order_topic.subscribe(function(message) {
            // THAT because javascript
            console.log(that)
            that.state.orders.push(message);
            that.setState({
                orders: that.state.orders
            });
        });
    },

    componentWillUnmount: function() {
        order_topic.unsubscribe();
    },

    render: function() {
        return (
            <div className='orderapp'>
                <OrderList orders={this.state.orders}/>
            </div>
        );
    }
});

ReactDOM.render(<OrderApp/>, document.getElementById('order-list'));
