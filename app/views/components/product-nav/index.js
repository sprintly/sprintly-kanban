/**
 * @jsx React.DOM
 */

var React = require('react')
var Product = require('./item')

var ProductNav = React.createClass({

  componentDidMount: function() {
    var forceUpdate = function(){
      this.forceUpdate()
    }.bind(this)

    this.props.config.on('update change', forceUpdate, this);
  },

  componentDidUnmount: function() {
    this.props.config.off('update')
  },

  render: function() {
    return (
      <ul>
        <li className="header">
          <span className="icomatic next">nextlight</span>
        </li>
        {this.props.products.map(function(product) {
          return Product({ product: product, config: this.props.config, key: product.id })
        }, this)}
      </ul>
    )
  }

})

module.exports = ProductNav

