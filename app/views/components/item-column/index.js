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
    isLoading: false
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

  getItems: function(product, options={}) {
    if (this.items) {
      if (!options.refresh) {
        return;
      }
      this.stopListening(this.items);
    }
    this.items = ProductStore.getItemsForProduct(product, this.props.status);
    this.items.comparator = function(model) {
      return -new Date(model.get('last_modified'));
    };
    this.listenTo(this.items, 'change sync add remove', this._onChange);
    this.setState({ isLoading: true });
    ProductActions.getItems(this.items);
  },

  componentWillMount: function() {
    this.getItems(this.props.product);
  },

  componentDidMount: function() {
    this.getItems(this.props.product);
  },

  componentWillUnmount: function() {
    this.stopListening(this.items);
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.product.id !== this.props.product.id) {
      this.setState({ isLoading: true });
      this.getItems(nextProps.product, { refresh: true });
    }
  },

  render: function() {
    var classes = {
      column: true,
      [this.props.status]: true
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

