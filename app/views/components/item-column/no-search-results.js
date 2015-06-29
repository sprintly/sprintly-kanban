import React from 'react';
import FilterActions from '../../../actions/filter-actions';
import ProductStore from '../../../stores/product-store';

var NoSearchResults = React.createClass({

  propsTypes: {
    product: React.PropTypes.object.isRequired
  },

  clearFilters() {
    let product = ProductStore.getProduct(this.props.product.id);

    FilterActions.clear(product.members, product.tags);
  },

  render() {
    return (
      <div className='no-search-results'>
        <div className="content">
          <div className="row">
            <div className="col-sm-12">
              <h1>No Results!</h1>
              <h5>Try filtering again or reset your filters.</h5>
            </div>
            <div className="item-card__title col-sm-12">
              <button style={ {width: "100%"} } className="btn btn-primary clear-filters" onClick={this.clearFilters}>Clear Filters</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
})

module.exports = NoSearchResults;
