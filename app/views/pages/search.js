import _ from 'lodash';
import React from "react";

import {Link, State, Navigation} from "react-router";
import {Badge, ListGroup, ListGroupItem, ButtonGroup, Button, SplitButton, MenuItem, ProgressBar} from 'react-bootstrap';
import Header from '../components/header';

import ProductActions from '../../actions/product-actions';
import ProductStore from '../../stores/product-store';
import SearchActions from '../../actions/search-actions';
import SearchStore from '../../stores/search-store';
import ItemCard from '../components/item-card';

function getSearchSelectorState() {
  return {
    results: SearchStore.getResults(),
    products: ProductStore.getAll(),
    currentPage: 1,
    perPage: 20,
    loading: false,
    progress: 0
  };
}

const SORT_OPTIONS = {
  created_at: 'Created At',
  priority: 'Priority',
  last_modified: 'Recent'
};

export default React.createClass({

  mixins: [State, Navigation],

  getInitialState() {
    return getSearchSelectorState()
  },

  _onChange() {
    this.setState(getSearchSelectorState());
  },

  componentDidMount() {
    SearchStore.addChangeListener(this._onChange);
    ProductStore.on('change', this._onChange);
    ProductActions.init();
    let query = this.getQuery();
    if (query && query.q) {
      this.setState({ query: query.q });
      this.loader();
      SearchActions.search(query.q, query.sort, query.order);
    }
  },

  componentWillUnmount() {
    SearchStore.removeChangeListener(this._onChange);
    ProductStore.off('change', this._onChange);
  },

  nextPage() {
    this.setState({ currentPage: this.state.currentPage + 1 });
  },

  search(query, options={}) {
    if (options.loader !== false) {
      this.loader();
    }
    window.history.pushState(null, null, `?q=${encodeURIComponent(query)}`);
    SearchActions.search(query);
  },

  loader: function() {
    let count = 0;
    this.setState({ loading: true, progress: 25 });

    let tick = () => {
      let progress = this.state.progress;
      if (progress < 80 ){
        this.setState({ progress: progress + 25 })
        setTimeout(tick, 20)
      }
    }

    setTimeout(tick, 30);
  },

  addProduct: function(value, ev) {
    let productFacet = `product:${value}`;
    let query = this.state.query.indexOf(productFacet) > -1 ?
      this.state.query.replace(productFacet, ''):
      `${this.state.query} ${productFacet}`;

    this.setState({ query: query.trim() });
    this.search(query, { loader: false });
  },

  onSubmit(ev) {
    ev.preventDefault();
    let value = this.refs.input.getDOMNode().value;
    this.search(value)
  },

  updateQuery(ev) {
    let query = this.refs.input.getDOMNode().value;
    this.setState({ query });
  },

  renderResults() {
    let items = this.state.results.items;
    let page = items.slice(0, this.state.perPage * this.state.currentPage);

    return (
      <div className="row">
        <div className="col-sm-2 search__filters">
          <ButtonGroup vertical>
            {_.map(this.state.results.products, function(product) {
              return <button className="btn btn-default" onClick={_.partial(this.addProduct, product.id)}>{product.name}</button>
            }, this)}
          </ButtonGroup>
          <ListGroup>
            <ListGroupItem bsStyle="success">Stories <Badge>{this.state.results.stories.length}</Badge></ListGroupItem>
            <ListGroupItem bsStyle="warning">Defects <Badge>{this.state.results.defects.length}</Badge></ListGroupItem>
            <ListGroupItem>Tasks <Badge>{this.state.results.tasks.length}</Badge></ListGroupItem>
            <ListGroupItem bsStyle="info">Tests <Badge>{this.state.results.tests.length}</Badge></ListGroupItem>
          </ListGroup>
        </div>
        <div className="col-sm-6 search__results">
          {_.map(page, function(item, index) {
            return (
              <ItemCard
                key={index}
                item={item}
                productId={item.product.id}
                sortField="relevance"
              />
            );
          }, this)}
          {items.length <= this.state.perPage * this.state.currentPage ? '' :
            <button onClick={this.nextPage} className="btn btn-block btn-default">Load More</button>
          }
        </div>
        <div className="col-sm-2">
          <small><i>{this.state.results.items.length} matching items.</i></small>
          <hr/>
          <p>Learn about our <a href="https://sprint.ly/blog/search-api/" target="_BLANK">Beta Item Search API with Facets</a>.</p>
        </div>
      </div>
    );
  },

  render() {
    let results = (
      <div className="col-sm-10 col-sm-offset-1">
        <small>Reticulating splines...</small>
        <ProgressBar active bsStyle="info" now={this.state.progress}/>
      </div>
    );

    if (this.state.loading === false) {
      results = this.state.results.items && this.state.results.items.length > 0 ?
        this.renderResults() :
        <div className="col-sm-offset-2"><i>No items found. Try again with a different query.</i></div>;
    }

    return (
      <div>
        <Header
          searchBar={false}
          user={this.props.user}
          allProducts={this.state.products}
        />
        <div className="container search">
          <div className="row">
            <form onSubmit={this.onSubmit}>
              <div className="col-sm-6 col-sm-offset-2">
                <input className="form-control" type="search" name="q" placeholder="Search" ref="input" value={this.state.query} onChange={this.updateQuery} spellcheck={false}/>
              </div>
              <button className="btn btn-primary">Go</button>
            </form>
          </div>
          <hr/>
          {results}
        </div>
      </div>
    );
  }

});

