/**
 * @jsx React.DOM
 */

var _ = require('lodash')
var React = require('react')

var Header = React.createClass({
  render: function() {
    return (
      <header>
        <h2 className={this.props.hideLabel ? 'no-label': ''}>
          {this.props.hideLabel ? <span className="icomatic">chain</span> : this.props.product.name}
          <small className="type">[{this.props.items.config.get('status')}]</small>
        </h2>
        <span className="icomatic close" onClick={_.partial(this.props.removeColumn, this.props.columnKey)}>cancel</span>
      </header>
    )
  }
})

module.exports = Header
