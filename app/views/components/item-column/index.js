/**
 * @jsx React.DOM
 */

var _ = require('lodash')
var React = require('react')
var Item = require('../item')
var draggable = require('./draggable')

var Header = require('./header')

var ItemColumn = React.createClass(_.extend({

  getInitialState: function() {
    return {
      dragging: false,
      over: false
    }
  },

  componentDidMount: function() {
    this.props.items.fetch().done(function(){
      this.forceUpdate()
      this.props.items.on('change', function(){
        this.forceUpdate()
      }, this)
    }.bind(this))
  },

  componentDidUnmount: function() {
    this.props.items.off('change')
  },

  render: function() {
    var classList = ['column']

    if (this.state.dragging) {
      classList.push('dragging')
    }

    return (
      <section
        draggable="true"
        onDrop={this.drop}
        onDragEnd={this.dragEnd}
        onDragOver={this.dragOver}
        onDragStart={this.dragStart}
        onDragEnter={this.dragEnter}
        onDragLeave={this.dragLeave}
        className={classList.join(' ')}>

        <Header
          hideLabel={this.props.hideLabel}
          product={this.props.product}
          items={this.props.items}
          columnKey={this.props.key}
          removeColumn={this.props.removeColumn} />

        <ul className="item-list">
          {this.props.items.map(function(model) {
            return Item({ item: model.toJSON(), key: model.id })
          })}
        </ul>
      </section>
    )
  }
}, draggable))

module.exports = ItemColumn

