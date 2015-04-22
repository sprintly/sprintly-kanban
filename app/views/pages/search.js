import _ from 'lodash';
import React from "react";

import {State, Navigation} from "react-router";
import {ProgressBar, ButtonGroup, DropdownButton, MenuItem} from 'react-bootstrap';
import Header from '../components/header';
import SearchResults from '../components/search-results/index';

import ProductActions from '../../actions/product-actions';
import ProductStore from '../../stores/product-store';
import SearchActions from '../../actions/search-actions';
import SearchStore from '../../stores/search-store';

function getSearchSelectorState() {
  let results = SearchStore.getResults();

  return {
    results,
    products: ProductStore.getAll(),
    loading: results.loading,
    progress: 0
  };
}

var Search = React.createClass({

  mixins: [State, Navigation],

  getInitialState() {
    return _.assign(getSearchSelectorState(), {
      showProgress: true,
      loading: true
    });
  },

  _onChange() {
    this.setState(getSearchSelectorState());
  },

  search(query, options={ progressBar: true }) {
    if (options.progressBar) {
      this.updateProgressBar();
    } else {
      this.setState({
        loading: true,
        showProgress: false
      });
    }
    this.setState({ query: query.trim() });
    SearchActions.search(query);
    setTimeout(() => {
      this.transitionTo(`/search?q=${encodeURIComponent(query)}`);
    }, 0);
  },

  updateProgressBar() {
    let count = 0;
    this.setState({
      loading: true,
      showProgress: true,
      progress: 25
    });

    let tick = () => {
      let progress = this.state.progress;
      if (progress < 80 ){
        this.setState({ progress: progress + 25 })
        setTimeout(tick, 20)
      }
    }

    setTimeout(tick, 30);
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
    if (this.state.loading && this.state.showProgress) {
      return (
        <div className="col-sm-10 col-sm-offset-1">
          <small>Reticulating splines...</small>
          <ProgressBar active bsStyle="info" now={this.state.progress}/>
        </div>
      );
    } else {
      return this.state.results.items && this.state.results.items.length > 0 ?
        <SearchResults
          search={this.search}
          query={this.state.query}
          results={this.state.results}
        /> :
      <div className="col-sm-offset-2">
        <i className='no-results__message'>No items found. Try again with a different query.</i>
      </div>
    }
  },

  searchBar() {
    return (
      <div className="row">
        <form onSubmit={this.onSubmit}>
          <div className="col-xs-10 col-sm-6 col-sm-offset-2">
            <input
              name="q"
              ref="input"
              type="search"
              spellcheck={false}
              placeholder="Search"
              value={this.state.query}
              className="form-control"
              onChange={this.updateQuery}
            />
          </div>
          <button className="btn btn-primary">Go</button>
        </form>
      </div>
    )
  },

  ticketTypeControls() {
    return ([
      <i>Filter by Type</i>,
      <ButtonGroup vertical className="hidden-xs">
        {this.ticketControlLinks()}
      </ButtonGroup>,
      <ButtonGroup justified className="visible-xs-block">
        {this.ticketControlLinks()}
      </ButtonGroup>
    ])
  },

  ticketControlLinks() {
    return ([
      <a href="#" onClick={_.partial(this.addItemType, 'story')} className="btn btn-default story">Story</a>,
      <a href="#" onClick={_.partial(this.addItemType, 'defect')} className="btn btn-default defect">Defect</a>,
      <a href="#" onClick={_.partial(this.addItemType, 'task')} className="btn btn-default task">Task</a>,
      <a href="#" onClick={_.partial(this.addItemType, 'test')} className="btn btn-default test">Test</a>
    ])
  },

  resultsSummary() {
    let issueTypes = ['stories', 'defects', 'tasks', 'tests'];
    let results = this.state.results;

    return (
      <table className="table">
        <thead></thead>
        <tbody>
          <tr>
            <td>{results.items.length}</td>
            <td>matching items</td>
          </tr>
          <tr></tr>
          {_.compact(issueTypes.map((type) => {
            if (results[type].length === 0) {
              return ''
            } else {
              return (
                <tr>
                  <td>{results[type].length}</td>
                  <td>{type}</td>
                </tr>
              );
            }
          }))}
        </tbody>
      </table>
    )
  },

  addProduct(value, ev) {
    let productFacet = `product:${value}`;
    let query = this.addFacet(productFacet);
    this.search(query, { progressBar: false });
  },

  addItemType(type, ev) {
    if (ev) {
      ev.preventDefault();
    }
    let itemFacet = `type:${type}`;
    let query = this.addFacet(itemFacet);
    this.search(query, { progressBar: false });
  },

  addFacet(facet) {
    let query = this.getQuery();
    query = query.q.indexOf(facet) > -1 ? query.q.replace(facet, ''): `${query.q} ${facet}`;

    return query.trim();
  },

  productControls() {
    return ([
      <i>Filter by Product</i>,
      <ButtonGroup vertical className="hidden-xs">
        {_.map(this.state.results.products, (product) => {
          return <button className="btn btn-default" onClick={_.partial(this.addProduct, product.id)}>{product.name}</button>
        })}
      </ButtonGroup>,
      <DropdownButton block title="Products" className="visible-xs-inline-block" onSelect={(product) => { this.addProduct(product) }}>
        {_.map(this.state.results.products, (product) => {
          return <MenuItem eventKey={product.id}>{product.name}</MenuItem>
        })}
      </DropdownButton>
    ])
  },

  // React Functions

  componentDidMount() {
    SearchStore.addChangeListener(this._onChange);
    ProductStore.on('change', this._onChange);
    ProductActions.init();
    let query = this.getQuery();

    if (query && query.q) {
      this.setState({ query: query.q });
      this.updateProgressBar();
      SearchActions.search(query.q, query.sort, query.order);
    }
  },

  componentWillUnmount() {
    SearchStore.removeChangeListener(this._onChange);
    ProductStore.off('change', this._onChange);
  },

  componentWillReceiveProps(nextProps) {
    let query = this.getQuery();

    if (this.state.loading === false && query && query.q) {
      this.setState({ query: query.q });
      this.updateProgressBar();
      SearchActions.search(query.q, query.sort, query.order);
    }
  },

  render() {
    return (
      <div>
        <Header
          searchBar={false}
          user={this.props.user}
          allProducts={this.state.products}
        />
        <div className="container search">
          {this.searchBar()}
          <hr/>
          <div className="row">
            <div className="col-sm-2 search__filters">
              <div className="search__filter-group">
                {this.ticketTypeControls()}
              </div>
              <hr className="hidden-xs"/>
              <div className="search__filter-group">
                {this.productControls()}
              </div>
              <hr className="visible-xs-block"/>
            </div>
            <div className="col-sm-8 search__results">
              {this.renderResults()}
            </div>
            <div className="col-sm-2 search__counts">
              {this.resultsSummary()}
              <hr/>
              <p>Learn about our <a href="https://sprint.ly/blog/search-api/" target="_BLANK">Beta Item Search API with Facets</a>.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Search;
