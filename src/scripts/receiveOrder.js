var React = require('react');
var ReactDOM = require('react-dom');
var Firebase = require('firebase');
var QRCode = require('qrcode.react');
var injectTapEventPlugin = require("react-tap-event-plugin");

var MaterialUi = require('material-ui');
var MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
var getMuiTheme = require('material-ui/styles/getMuiTheme').default;
var lightBaseTheme = require('material-ui/styles/baseThemes/lightBaseTheme').default;
var muiTheme = getMuiTheme(lightBaseTheme);

injectTapEventPlugin();

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
            <MaterialUi.TableRow className='order-list-item'>
                <MaterialUi.TableRowColumn className='order-name'>{this.props.order.name}</MaterialUi.TableRowColumn>
                <MaterialUi.TableRowColumn className='order-location'>{this.props.order.location}</MaterialUi.TableRowColumn>
                <MaterialUi.TableRowColumn className='order-food-type'>{this.props.order.food_type}</MaterialUi.TableRowColumn>
                <MaterialUi.TableRowColumn className='order-phone-number'>{this.props.order.phone_number}</MaterialUi.TableRowColumn>
                <MaterialUi.TableRowColumn>
                    <MaterialUi.RaisedButton onMouseDown={this.onPrintButtonClick} className='btn btn-success btn-sm' label='Print'/>
                </MaterialUi.TableRowColumn>
            </MaterialUi.TableRow>
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
            <MaterialUi.Table>
                <MaterialUi.TableHeader adjustForCheckbox={false} displaySelectAll={false} enableSelectAll={false}>
                    <MaterialUi.TableRow>
                        <MaterialUi.TableHeaderColumn>Name</MaterialUi.TableHeaderColumn>
                        <MaterialUi.TableHeaderColumn>Location</MaterialUi.TableHeaderColumn>
                        <MaterialUi.TableHeaderColumn>Food Type</MaterialUi.TableHeaderColumn>
                        <MaterialUi.TableHeaderColumn>Phone Number</MaterialUi.TableHeaderColumn>
                        <MaterialUi.TableHeaderColumn>Print</MaterialUi.TableHeaderColumn>
                    </MaterialUi.TableRow>
                </MaterialUi.TableHeader>
                <MaterialUi.TableBody>
                  { orderNodes }
                </MaterialUi.TableBody>
            </MaterialUi.Table>
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
          <MuiThemeProvider muiTheme={muiTheme}>
            <div>
              <div className="order-list">
                <OrderList orders={this.state.orders} updateQR={this.updateQRCode}/>
              </div>
              <div className="qr-code">
                <QRCode value={this.state.qr_code} size={128}/>
              </div>
            </div>
          </MuiThemeProvider>
        );
    },

});

ReactDOM.render(<OrderApp/>, document.getElementById('order-app'));
