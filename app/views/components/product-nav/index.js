/**
 * @jsx React.DOM
 */

var React = require('react')
var Product = require('./item')

var ProductNav = React.createClass({

  componentDidMount: function() {
    this.props.config.on('update', function() {
      this.forceUpdate()
    }, this);
  },

  componentDidUnmount: function() {
    this.props.config.off('update')
  },

  render: function() {
    return (
      <ul>
        <li className="header">
          <h2>Products</h2>
          <span className="icomatic next">nextlight</span>
        </li>
        {this.props.products.map(function(product) {
          return Product({ product: product, config: this.props.config })
        }, this)}
      </ul>
    )
  }

})

module.exports = ProductNav

