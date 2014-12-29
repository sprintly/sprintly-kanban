/**
 * @jsx React.DOM
 */

var _ = require('lodash')
var React = require('react')
var Item = require('../item')
var draggable = require('./draggable')

var Header = require('./header')

var ItemColumn = React.createClass({

  propTypes: {
    status: React.PropTypes.string.isRequired,
    product: React.PropTypes.object.isRequired
  },

  componentWillMount: function() {
    this.items = this.props.product.getItemsByStatus(this.props.status);
    this.items.fetch();
    this.items.on('change sync', () => { this.forceUpdate() });
  },

  render: function() {
    return (
      <div className="column">
        {this.items.map(function(model) {
          return <Item item={model} key={model.id} />
        })}
      </div>
    )
  }
});

module.exports = ItemColumn

