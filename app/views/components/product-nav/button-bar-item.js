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

module.exports = ButtonBarItem
