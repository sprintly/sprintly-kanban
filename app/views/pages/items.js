/**
 * @jsx React.DOM
 */

var _ = require('lodash')
var React = require('react')
var ItemColumn = require('../components/item-column')

var Items = React.createClass({

  componentDidMount: function() {
    this.props.config.on('update', function() {
      this.forceUpdate()
    }.bind(this))
  },

  reorderColumns: function(a, b) {
    var columns = this.props.config.get('columns');
    var at = _.indexOf(columns, a)
    var previousIndex = _.indexOf(columns, b)
    columns = _.without(columns, b)
    columns.splice(at, 0, b)
    this.props.config.set('columns', columns).trigger('update')
  },

  removeColumn: function(col, e) {
    e.preventDefault()
    var columns = this.props.config.get('columns');
    columns = _.without(columns, col)
    this.props.config.set('columns', columns).trigger('update')
  },

  render: function() {
    var cols = this.props.config.get('columns')

    var columns = cols.map(function(colName, i) {
      var params = colName.split('#')
      var id = params[0]
      var type = params[1]
      var product = this.props.products.get(id)
      var items = product.getItemsByStatus(type)
      var prev = cols[i - 1]
      var hideLabel = (prev && prev.split('#')[0] == id)

      return ItemColumn({
        key: colName,
        items: items,
        hideLabel: hideLabel,
        product: product.toJSON(),
        reorder: this.reorderColumns,
        removeColumn: this.removeColumn
      })
    }, this)

    var style = {
      width: columns.length > 0 ? columns.length * 21 + 'rem' : '100%'
    }

    return (
      <div style={style}>
        {columns.length > 0 ?
          columns :
          <h2 className="tout">Add some Products!</h2>
        }
      </div>
    )
  }

})

module.exports = Items
