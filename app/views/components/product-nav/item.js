/**
 * @jsx React.DOM
 */

var _ = require('lodash')
var React = require('react')
var ButtonBarItem = require('./button-bar-item')
var Toggle = require('./toggle')

var ITEM_TYPES = {
  'in-progress': 'Current',
  'completed': 'Done',
  'someday': 'Someday',
  'backlog': 'Backlog',
  // 'accepted': 'Accepted'
}

var Product = React.createClass({

  addColumn: function(column, e) {
    e.preventDefault()
    var name = this.props.product.id + '#' + column;
    var columns = this.props.config.get('columns');

    if (_.indexOf(columns, name) > -1) {
      columns = _.without(columns, name);
    } else {
      columns.push(name);
    }

    this.props.config.set('columns', columns);
    this.props.config.trigger('update')
  },

  addAllColumns: function(e) {
    console.log(e)
    var columns = this.props.config.get('columns');

    var allColumns = this.allColumns()
    var diff = _.difference(allColumns, columns)

    if (diff.length === 0) {
      columns = _.reject(columns, function(col){
        return _.indexOf(allColumns, col) > -1
      })
    } else {
      columns = columns.concat(diff)
    }

    this.props.config.set('columns', columns);
    this.props.config.trigger('update')
  },

  allColumns: function(){
    return _.map(_.keys(ITEM_TYPES), function(status){
      return this.props.product.id + '#' + status
    }, this)
  },

  render: function() {
    var columns = this.props.config.get('columns');
    var checked = _.difference(this.allColumns(), columns).length === 0

    return (
      <li>
        <h3>{this.props.product.name}</h3>

        <div className="topcoat-button-bar">
          <ButtonBarItem status="someday" productId={this.props.product.id} columns={columns} addColumn={this.addColumn} />
          <ButtonBarItem status="backlog" productId={this.props.product.id} columns={columns} addColumn={this.addColumn} />
          <ButtonBarItem status="in-progress" productId={this.props.product.id} columns={columns} addColumn={this.addColumn} />
          <ButtonBarItem status="completed" productId={this.props.product.id} columns={columns} addColumn={this.addColumn} />
        </div>

        <Toggle label="Show All" onChange={this.addAllColumns} checked={checked}/>
      </li>
    )
  }

})

module.exports = Product

