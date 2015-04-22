import _ from 'lodash';
import React from "react";
import ItemCard from '../item-card';

var SearchResults = React.createClass({

  propTypes: {
    query: React.PropTypes.string.isRequired,
    search: React.PropTypes.func.isRequired,
    results: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      perPage: 20,
      currentPage: 1
    }
  },

  nextPage() {
    this.setState({ currentPage: this.state.currentPage + 1 });
  },

  itemCardNodes() {
    let items = this.props.results.items;
    let page = items.slice(0, this.state.perPage * this.state.currentPage);

    return (
      _.map(page, (item, index) => {
        return (
          <ItemCard
            key={index}
            item={item}
            productId={item.product.id}
            sortField="relevance"
          />
        );
      })
    )
  },

  pageControls() {
    let items = this.props.results.items;
    let cannotLoadMore = items.length <= this.state.perPage * this.state.currentPage

    let controls = cannotLoadMore ? '' : <button onClick={this.nextPage} className="btn btn-block btn-default">Load More</button>

    return controls;
  },

  render() {
    return (
      <div className="col-sm-12 search__results">
        {this.itemCardNodes()}
        {this.pageControls()}
      </div>
    );
  }
});

export default SearchResults;
