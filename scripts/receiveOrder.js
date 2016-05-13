console.log('Hello');
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

    render: function() {
        return (
            <tr className='order-list-item'>
                <td className='order-name'>{this.props.order.name}</td>
                <td className='order-location'>{this.props.order.location}</td>
                <td className='order-food-type'>{this.props.order.food_type}</td>
                <td className='order-phone-number'>{this.props.order.phone_number}</td>
                <td>
                    <button className='btn btn-success btn-sm'>Print QR Code</button>
                </td>
            </tr>
        );
    }

});

var OrderList = React.createClass({
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
