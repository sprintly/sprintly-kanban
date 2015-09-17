import _ from 'lodash'
import React from 'react'

import {Link} from 'react-router'
import {Well} from 'react-bootstrap'
import Header from '../components/header'

import ProductActions from '../../actions/product-actions'
import ProductStore from '../../stores/product-store'

function getProductSelectorState() {
  return {
    products: ProductStore.getAll()
  }
}

export default React.createClass({

  getInitialState: function() {
    return getProductSelectorState()
  },

  _onChange: function() {
    this.setState(getProductSelectorState())
  },

  componentDidMount: function() {
    ProductStore.addChangeListener(this._onChange)
    ProductActions.init()
  },

  componentWillUnmount: function() {
    ProductStore.removeChangeListener(this._onChange)
  },

  render: function() {
    return (
      <div>
        <Header
          user={this.props.user}
          allProducts={this.state.products}
        />
        <div className="container product-selector">
          <div className="col-sm-6 product__tout hidden-xs">
            <img src="https://sprintly-wasatch.global.ssl.fastly.net/4957/static/images/briefcase.png"/>
            <h1>Sprintly Kanban Board</h1>
          </div>
          <div className="col-sm-4">
            <Well>
              <ul className="list-unstyled">
              {_.map(this.state.products, function(product) {
                return (
                  <li key={`product-selector-${product.id}`}>
                    <Link to="product" params={{ id: product.id }} className="btn btn-default btn-block">{product.name}</Link>
                  </li>
                )
              })}
              </ul>
            </Well>
          </div>
        </div>
      </div>
    )
  }

})
