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

var OrderList = React.createClass({

    render: function() {
        var that = this;
        var orderNodes = this.props.orders.map(function (order) {
            return (
              <MaterialUi.TableRow className='order-list-item' selected={order.id === that.props.selectedOrderID} key={order.id}>
                  <MaterialUi.TableRowColumn className='order-name'>{order.name}</MaterialUi.TableRowColumn>
                  <MaterialUi.TableRowColumn className='order-location'>{order.location}</MaterialUi.TableRowColumn>
                  <MaterialUi.TableRowColumn className='order-food-type'>{order.food_type}</MaterialUi.TableRowColumn>
                  <MaterialUi.TableRowColumn className='order-phone-number'>{order.phone_number}</MaterialUi.TableRowColumn>
              </MaterialUi.TableRow>
            );
        });

        var style = {
          margin: 6,
        };

        return (
            <MaterialUi.Table selectable={true} onRowSelection={this.props.updateSelectedOrder}>
                <MaterialUi.TableHeader adjustForCheckbox={true} displaySelectAll={true} enableSelectAll={false}>
                    <MaterialUi.TableRow>
                      <MaterialUi.TableHeaderColumn colSpan="4" style={{textAlign: 'right'}}>
                        <MaterialUi.RaisedButton disabled={!this.props.enableButtons} style={style} primary={true} onMouseDown={this.props.onPrintButtonClick} label='Print'/>
                        <MaterialUi.RaisedButton disabled={!this.props.enableButtons} style={style} secondary={true} onMouseDown={this.props.onArchiveButtonClick} label='Archive'/>
                      </MaterialUi.TableHeaderColumn>
                    </MaterialUi.TableRow>
                    <MaterialUi.TableRow>
                        <MaterialUi.TableHeaderColumn>Name</MaterialUi.TableHeaderColumn>
                        <MaterialUi.TableHeaderColumn>Location</MaterialUi.TableHeaderColumn>
                        <MaterialUi.TableHeaderColumn>Food Type</MaterialUi.TableHeaderColumn>
                        <MaterialUi.TableHeaderColumn>Phone Number</MaterialUi.TableHeaderColumn>
                    </MaterialUi.TableRow>
                </MaterialUi.TableHeader>
                <MaterialUi.TableBody displayRowCheckbox={true} showRowHover={true}>
                  { orderNodes }
                </MaterialUi.TableBody>
            </MaterialUi.Table>
        );
    }
});

var OrderApp = React.createClass({
    getInitialState: function() {
        return { 
          orders: [], 
          qr_code: "",
          selectedOrderID: null,
          selectedOrderIndex: null
        };
    },

    updateSelectedOrder: function(selectedRows) {
      var rowNum = selectedRows[0];
      var order = this.state.orders[rowNum];

      if (order) {
        var data = [order.name, order.phone_number, order.location, order.food_type];
        var message = data.join(',');

        this.setState({
          selectedOrderIndex: rowNum,
          selectedOrderID: order.id,
          qr_code: message
        });
      } 
      else {
        this.setState({
          selectedOrderIndex: null,
          selectedOrderID: null,
          qr_code: ""
        });
      }
    },

    updateQRCode: function(message) {
      this.state.qr_code = message;
      this.setState({
        orders: this.state.orders,
        qr_code: this.state.qr_code
      });
    },

    onPrintButtonClick: function() {
      var order = this.state.orders[this.state.selectedOrderIndex];
      message = {
        to: order.phone_number,
        body: order.name + ", your delivery of " + order.food_type + " is on its way!"
      };
      console.log(message);
      notifsRef.push(message);

      window.print();
    },

    onArchiveButtonClick: function() {
      ordersRef.child(this.state.selectedOrderID).remove();
      this.state.orders.splice(this.state.selectedOrderIndex, 1);
      this.setState({
        orders: this.state.orders,
        selectedOrderIndex: null,
        selectedOrderID: null,
        qr_code: ""
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
                <OrderList orders={this.state.orders} onPrintButtonClick={this.onPrintButtonClick} onArchiveButtonClick={this.onArchiveButtonClick} updateSelectedOrder={this.updateSelectedOrder} selectedOrderID={this.state.selectedOrderID} enableButtons={this.state.selectedOrderID !== null}/>
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
