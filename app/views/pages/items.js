import _ from "lodash";
import React from "react";
import Loading from "react-loading"
import ItemColumn from "../components/item-column";
import ProductStore from '../../stores/product-store';
import ProductAction from '../../actions/product-actions';
import {State} from 'react-router';

function getColumnsState(id) {
  return {
    product: ProductStore.get(id),
    activeItem: false,
    'show-accepted': false,
    'show-someday': false,
  }
}

export default React.createClass({

  mixins: [State],

  getInitialState: function() {
    return getColumnsState(this.getParams().id)
  },

  _onChange: function() {
    this.setState(getColumnsState(this.getParams().id));
  },

  componentDidMount: function() {
    ProductStore.on('change', this._onChange);
    ProductStore.once('sync', () => {
      var product = ProductStore.get(this.getParams().id);
      product.items.on('change', this._onChange);
      ProductAction.subscribe(product);
    });
    ProductAction.init();
  },

  componentWillUnmount: function() {
    ProductStore.off('change', this._onChange);
  },

  selectItem: function(activeItem, event) {
    this.setState({ activeItem });
  },

  handleKeyDown: function(e) {
    console.log(e);
  },

  showHiddenColumn: function(status) {
    var state = getColumnsState(this.getParams().id);
    state[`show-${status}`] = true;
    this.setState(state);
  },

  render: function() {
    var product = this.state.product;

    if (product === undefined) {
      return (
        <div className="loading"><Loading type="spin" color="#ccc" /></div>
      );
    }

    var cols = _.map(product.ItemModel.ITEM_STATUSES, (label, status) => {
      var props = {
        status,
        product,
        key: product.id + status,
      }

      if (_.contains(['someday', 'accepted'], status)) {
        props.onMouseEnter = _.partial(this.showHiddenColumn, status);
        props.onMouseLeave = () => this.setState(getColumnsState(this.getParams().id))
      }
      return <ItemColumn {...props} key={(product.id + status)}/>;
    });

    var classes = {
      tray: true,
      'show-accepted': this.state['show-accepted'],
      'show-someday': this.state['show-someday']
    }

    return (
      <div className="container-tray">
        <div className={React.addons.classSet(classes)}>
          <header>
            {_.map(product.ItemModel.ITEM_STATUSES, function(label, status) {
              return (
                <nav>
                  <h3>{label}</h3>
                </nav>
              );
            })}
          </header>
          {cols}
        </div>
      </div>
    );
  }

});
