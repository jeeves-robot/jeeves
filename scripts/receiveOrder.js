var React = require('react');
var ReactDOM = require('react-dom');
var Firebase = require('firebase');
var QRCode = require('qrcode.react');
var ReactBootstrapTable = require('react-bootstrap-table');
var BootstrapTable = ReactBootstrapTable.BootstrapTable;
var TableHeaderColumn = ReactBootstrapTable.TableHeaderColumn;

ordersRef = new Firebase("https://jeeves-server.firebaseio.com/orders");
notifsRef = new Firebase("https://jeeves-server.firebaseio.com/notifs");

var OrderListItem = React.createClass({

    onPrintButtonClick: function() {
      var order = this.props.order;
      var data = [order.name, order.phone_number, order.location, order.food_type];
      var message = data.join(',');
      this.props.updateQR(message);
      this.send_notification();
      window.print();
    },

    send_notification: function () {
      message = {
        to: this.props.order.phone_number,
        body: this.props.order.name + ", your delivery of " + this.props.order.food_type + " is on its way!"
      };
      console.log(message);
      notifsRef.push(message);
    },

    render: function() {
        return (
            <tr className='order-list-item'>
                <td className='order-name'>{this.props.order.name}</td>
                <td className='order-location'>{this.props.order.location}</td>
                <td className='order-food-type'>{this.props.order.food_type}</td>
                <td className='order-phone-number'>{this.props.order.phone_number}</td>
                <td>
                    <button onClick={this.onPrintButtonClick} className='btn btn-success btn-sm'>Print QR Code</button>
                </td>
            </tr>
        );
    }

});

var OrderList = React.createClass({

    render: function() {
        var that = this;
        var orderNodes = this.props.orders.map(function (order) {
            return (
                <OrderListItem order={order} key={order.id} updateQR={that.props.updateQR}></OrderListItem>
            );
        });

        return (
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Food Type</th>
                        <th>Phone Number</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                  { orderNodes }
                </tbody>
            </table>
        );
    }
});

var OrderApp = React.createClass({
    getInitialState: function() {
        return { orders: [], qr_code: "" };
    },

    updateQRCode: function(message) {
      this.state.qr_code = message;
      this.setState({
        orders: this.state.orders,
        qr_code: this.state.qr_code
      });
    },

    componentWillMount: function() {
        var that = this;
        ordersRef.on('child_added', function(snapshot) {
          newOrder = snapshot.val();
          newOrder.id = snapshot.key();
          that.state.orders.push(newOrder);
          that.setState({
              orders: that.state.orders,
              qr_code: that.state.qr_code
          });
        });
    },

    componentWillUnmount: function() {
        ordersRef.off();
        notifsRef.off();
    },

    render: function() {
        return (
          <div>
            <div className="order-list">
              <OrderList orders={this.state.orders} updateQR={this.updateQRCode}/>
            </div>
            <div className="qr-code">
              <QRCode value={this.state.qr_code} size={128}/>
            </div>
          </div>
        );
    }
});

ReactDOM.render(<OrderApp/>, document.getElementById('order-app'));
