var _ = require('lodash');
var React = require('react')
var Promise = require('bluebird');
var RouteHandler = require('react-router').RouteHandler;

var App = React.createClass({

  propTypes: {
    user: React.PropTypes.object.isRequired,
    products: React.PropTypes.object.isRequired
  },

  componentDidMount: function() {
    Promise.all([
      this.props.user.fetch(),
      this.props.products.fetch()
    ]).then(() => {
      this.forceUpdate();
    })
  },

  render: function() {
    return (
      <div>
        <RouteHandler {...this.props} />
      </div>
    )
  }

});

module.exports = App;
