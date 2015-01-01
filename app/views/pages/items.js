/**
 * @jsx React.DOM
 */

var _ = require('lodash')
var React = require('react')
var ItemColumn = require('../components/item-column')
var Loading = require('react-loading');
var Label = require('react-bootstrap').Label;

var Items = React.createClass({
  getInitialState: function() {
    return {
      activeItem: false
    }
  },

  selectItem: function(item, event) {
    this.setState({ activeItem: item });
  },

  renderToolbar: function() {
    var item = this.state.activeItem;
    return (
      <div className="toolbar container-flex">
        <div className="toolbar__item-number">
          <h1><span className="hash">#</span>{item.id}</h1>
        </div>
        <div className="toolbar__score">
          <h1>{item.get('score')}</h1>
        </div>
        <div className="toolbar__item-controls">
          <a href="#item-settings"><small>{item.get('counts').comments}</small><i className="icon-chat"/></a>
          <a href="#item-settings" className="icon-settings"></a>
        </div>
        <div className="toolbar__tags col-md-2">
        {item.get('tags').map(function(tag) {
          return <Label>{tag}</Label>
        })}
        </div>
      </div>
    );
  },

  render: function() {
    var product = this.props.products.get(this.props.params.id);

    if (product === undefined) {
      return (
        <div className="loading"><Loading type="spin" color="#ccc" /></div>
      );
    }

    var cols = _.map(product.ItemModel.ITEM_STATUSES, function(label, status) {
      return <ItemColumn selectItem={this.selectItem} activeItem={this.state.activeItem} product={product} status={status} />;
    }, this);

    return (
      <div className="container-tray">
        <div className="tray">{cols}</div>
        {this.state.activeItem ? this.renderToolbar() : ''}
      </div>
    );
  }


})

module.exports = Items
