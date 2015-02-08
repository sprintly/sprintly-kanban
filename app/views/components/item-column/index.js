import _ from 'lodash';
import React from 'react/addons';
import ItemCard from '../item-card';
import Backbone from 'backdash';
import Header from './header';
import Loading from 'react-loading';
import ProductStore from '../../../stores/product-store';
import ProductActions from '../../../actions/product-actions';

function getColumnState(items=[]) {
  return {
    items,
    isLoading: false,
    scrolling: false
  }
}

var ItemColumn = React.createClass({

  mixins: [Backbone.Events],

  propTypes: {
    status: React.PropTypes.string.isRequired,
    product: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return getColumnState();
  },

  _onChange: function() {
    var state = _.cloneDeep(this.state);
    state.items = this.items.toJSON();
    state.isLoading = false;
    this.setState(state);
  },

  getItems: function(product) {
    if (this.items) {
      this.stopListening(this.items, 'change sync', this.items);
    }
    this.items = ProductStore.getItemsForProduct(product, this.props.status);
    this.listenTo(this.items, 'change sync', this._onChange);
    this.setState({ isLoading: true });
    ProductActions.getItems(this.items);
  },

  componentWillMount: function() {
    this.getItems(this.props.product);
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.product.id !== this.props.product.id) {
      this.setState({ isLoading: true });
      this.getItems(nextProps.product);
    }
  },

  render: function() {
    var limit = this.items.length;
    var classes = {
      column: true,
      [this.props.status]: true,
      scrolling: this.state.scrolling
    };

    return (
      <div className={React.addons.classSet(classes)} {...this.props}>
      {this.state.isLoading ?
        <div className="loading"><Loading type="bubbles" color="#ccc"/></div> :
        _.map(this.state.items, function(item, index) {
          return <ItemCard item={item} key={`item-${item.number}`} />
        })
      }
      </div>
    )
  }
});

module.exports = ItemColumn

