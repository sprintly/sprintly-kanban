/**
 * @jsx React.DOM
 */

var _ = require('lodash')
var React = require('react')
var crypto = require('crypto')

var draggable = require('./draggable')
var ItemHeader = require('./header')

var Item = React.createClass(_.extend({
  render: function() {
    return (
      <li className={this.props.item.type}>
        <ItemHeader person={(this.props.item && this.props.item.assigned_to) || 'unassigned' } />
        <h3>{this.props.item.title}</h3>
      </li>
    )
  }

}, draggable))

module.exports = Item;
