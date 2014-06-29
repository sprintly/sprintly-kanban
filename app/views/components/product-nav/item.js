/**
 * @jsx React.DOM
 */

var React = require('react')
var _ = require('lodash')

var ITEM_TYPES = {
  'in-progress': 'Current',
  'completed': 'Done',
  'someday': 'Someday',
  'backlog': 'Backlog',
  'accepted': 'Accepted'
}

var ButtonBarItem = React.createClass({

  render: function() {
    var classList = ['topcoat-button-bar__button']
    var key = this.props.productId + '#' + this.props.status

    if (_.indexOf(this.props.columns, key) > -1) {
      classList.push('active')
    }

    return (
      <div className="topcoat-button-bar__item">
        <button className={classList.join(' ')} onClick={_.partial(this.props.addColumn, this.props.status)}>
          {ITEM_TYPES[this.props.status]}
        </button>
      </div>
    )
  }
})

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

  render: function() {
    var columns = this.props.config.get('columns');

    return (
      <li>
        <h3>{this.props.product.name}</h3>
        <div className="topcoat-button-bar">
          <ButtonBarItem status="someday" productId={this.props.product.id} columns={columns} addColumn={this.addColumn} />
          <ButtonBarItem status="backlog" productId={this.props.product.id} columns={columns} addColumn={this.addColumn} />
          <ButtonBarItem status="in-progress" productId={this.props.product.id} columns={columns} addColumn={this.addColumn} />
          <ButtonBarItem status="completed" productId={this.props.product.id} columns={columns} addColumn={this.addColumn} />
        </div>
      </li>
    )
  }

})

module.exports = Product

