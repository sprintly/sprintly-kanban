import _ from 'lodash';
import React from "react";
import { Link } from "react-router";
import ProductActions from '../../actions/product-actions';
import ProductStore from '../../stores/product-store';

function getProductSelectorState() {
  return {
    products: ProductStore.getAll()
  };
}

export default React.createClass({

  getInitialState: function() {
    return getProductSelectorState()
  },

  _onChange: function() {
    this.setState(getProductSelectorState());
  },

  componentDidMount: function() {
    ProductStore.on('change', this._onChange);
    ProductActions.init();
  },

  componentWillUnmount: function() {
    ProductStore.off('change', this._onChange);
  },

  render: function() {
    return (
      <div className="container product-selector">
        <div className="col-sm-6 col-sm-offset-3">
          <img src="https://sprintly-wasatch.global.ssl.fastly.net/4957/static/images/briefcase.png"/>
          <ul className="list-unstyled">
          {_.map(this.state.products, function(product) {
            return (
              <li>
                <Link to="product" params={{ id: product.id }} className="btn btn-default">{product.name}</Link>
              </li>
            );
          })}
          </ul>
        </div>
      </div>
    );
  }

});
