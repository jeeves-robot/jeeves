console.log('Hello')
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
            <li className='order-list-item'>
                <span className='order-name'>{this.props.name}</span>
                <span className='order-location'>{this.props.location}</span>
                <span className='order-food-type'>{this.props.food_type}</span>
                <form>
                    <button>Print</button>
                </form>
            </li>
        );
    }

});

var OrderList = React.createClass({
    render: function() {
        var orderNodes = this.props.orders.map(function (order) {
            return (
                <OrderListItem name={order.name} location={order.location} food_type={order.food_type}>
                </OrderListItem>
            );
        });

        return (
            <ul className='order-list'>
                { orderNodes }
            </ul>
        );
    }
});

var OrderApp = React.createClass({
    getInitialState: function() {
        return { orders: [] };
    },

    componentWillMount: function() {
        order_topic.subscribe(function(message) {
            this.state.orders.push(message);
            this.setState({
                orders: this.state.orders
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

React.render(<ChatApp/>, document.body);
