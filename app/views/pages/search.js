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

import SCORE_MAP from '../../lib/score-map';

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
      loading: true,
      issueControls: {},
      productControls: {}
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
    this.updateControls(query);
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
        <form className="desktop__search-form" onSubmit={this.onSubmit}>
          <div className="col-xs-10 col-sm-6 search__query-bar">
            <input
              name="q"
              ref="input"
              type="search"
              spellcheck={false}
              placeholder="Search"
              value={this.state.query}
              className="form-control search-bar"
              onChange={this.updateQuery}
            />
          </div>
          <button className="btn btn-primary">Go</button>
        </form>
      </div>
    )
  },

  issueTypeControls() {
    return ([
      <i>Filter by Type</i>,
      <ButtonGroup vertical className="hidden-xs">
        {this.issueControlLinks()}
      </ButtonGroup>,
      <ButtonGroup justified className="visible-xs-block">
        {this.issueControlLinks()}
      </ButtonGroup>
    ])
  },

  issueControlLinks() {
    let issueTypes = ['story', 'defect', 'task', 'test'];

    return _.map(issueTypes, (type) => {
      let typeClass = {}
      typeClass[type] = true;

      var classes = React.addons.classSet(_.extend({
        "btn btn-default issue-control": true,
        "active": this.state.issueControls[type]
      }, typeClass));

      return <a href="#" onClick={_.partial(this.addItemType, type)} className={classes}>{type}</a>;
    })
  },

  productControlLinks() {
    return _.map(this.state.products, (product) => {
      let productClass = {}
      productClass[`product-${product.id}`] = true;

      var classes = React.addons.classSet(_.extend({
        "btn btn-default product-control": true,
        "active": this.state.productControls[product.id]
      }, productClass));

      return <a href="#" onClick={_.partial(this.addProduct, product.id)} className={classes}>{product.name}</a>;
    })
  },

  pointSummary() {
    if (this.state.results.items.length > 0) {
      let points = _.reduce(this.state.results.items, function(total, item) {
        return total + SCORE_MAP[item.score];
      }, 0)
      return (
        <tr className="search__point-summary">
          <td>{points}</td>
          <td>points</td>
        </tr>
      );
    } else {
      return <tr />
    }
  },

  resultsSummary() {
    let issueTypes = ['stories', 'defects', 'tasks', 'tests'];
    let results = this.state.results;
    return ([
      <h5>Search Results</h5>,
      <table className="results-table">
        <thead></thead>
        <tbody>
          <tr className="total-issues">
            <td>{results.items.length}</td>
            <td>matching issues</td>
          </tr>
          <tr></tr>
          {_.compact(issueTypes.map((type) => {
            if (results[type].length === 0) {
              return ''
            } else {
              return (
                <tr className={"total-" + type}>
                  <td>{results[type].length}</td>
                  <td>{type}</td>
                </tr>
              );
            }
          }))}
          {this.pointSummary()}
        </tbody>
      </table>
    ])
  },

  addProduct(value, ev) {
    if (ev) {
      ev.preventDefault();
    }

    this.toggleControlState(this.state.productControls, value);

    let productFacet = `product:${value}`;
    let query = this.addFacet(productFacet);
    this.search(query, { progressBar: false });
  },

  toggleControlState(controls, value) {
    controls[value] = (controls[value]) ? false : true;
    this.setState(controls);
  },

  addItemType(type, ev) {
    if (ev) {
      ev.preventDefault();
    }

    this.toggleControlState(this.state.issueControls, type);

    let itemFacet = `type:${type}`;
    let query = this.addFacet(itemFacet);
    this.search(query, { progressBar: false });
  },

  addFacet(facet) {
    let query = this.getQuery();

    if (_.isEmpty(query)) {
      query = `${facet}`;
    } else if (query.q.indexOf(facet) > -1) {
      query = query.q.replace(facet, '');
    } else {
      query = `${query.q} ${facet}`;
    }

    return query.trim();
  },

  productControls() {
    let products = this.state.products;
    let content;

    if (products && products.length) {
      content = [
        <i>Filter by Product</i>,
        <ButtonGroup vertical className="hidden-xs">
          {this.productControlLinks()}
        </ButtonGroup>,
        <DropdownButton block title="Products" className="visible-xs-inline-block" onSelect={(product) => { this.addProduct(product) }}>
          {_.map(this.state.products, (product) => {
            return <MenuItem eventKey={product.id}>{product.name}</MenuItem>
          })}
        </DropdownButton>
      ]
    } else {
      content = <i className='no-products__message'>Make a query to filter by product</i>
    }

    return ({content})
  },

  updateControls(query) {
    var issuePattern = /(\btype:\b[^\s]+)/g;
    var productPattern = /(\bproduct:\b[^\s]+)/g;
    this.setControlsState(issuePattern, this.state.issueControls, query);
    this.setControlsState(productPattern, this.state.productControls, query);
  },

  setControlsState(pattern, controls, query) {
    var facets = query.match(pattern);

    // turn all controls off
    _.each(controls, (v,k) => {
      controls[k] = false
    });

    // turn only present facets on
    _.each(facets, facet => {
      var type = _.last(facet.split(":"));
      controls[type] = true;
    })
    this.setState(controls);
  },

  searchAPIInstructions() {
    let instructions = {
      blocking: "blocking:>0",
      created: "created:>=2014-01-01",
      author: "author:id",
      is: "is:blocked",
      product: "product:id",
      size: "size:M",
      status: "status:in-progress",
      tag: "tag:release-1",
      title: "title:dashboard",
      type: "type:story"
    }

    return (
      <h5>Search Examples</h5>,
      <table className="instructions-table">
        <thead></thead>
        <tbody>
          {_.map(instructions, (example, name) => {
            return (
              <tr>
                <td><b>{name}</b></td>
                <td>{example}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    )
  },

  // React Functions

  componentDidMount() {
    SearchStore.addChangeListener(this._onChange);
    ProductStore.addChangeListener(this._onChange);
    ProductActions.init();
    let query = this.getQuery();

    if (query && query.q) {
      this.setState({ query: query.q });
      this.updateProgressBar();
      this.updateControls(query.q);
      SearchActions.search(query.q, query.sort, query.order);
    }
  },

  componentWillUnmount() {
    SearchStore.removeChangeListener(this._onChange);
    ProductStore.removeChangeListener(this._onChange);
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
              <div className="search__filter-group ">
                {this.issueTypeControls()}
              </div>
              <hr className="hidden-xs"/>
              <div className="search__filter-group">
                {this.productControls()}
              </div>
              <hr className="visible-xs-block"/>
            </div>
            <div className="col-sm-7 search__results">
              {this.renderResults()}
            </div>
            <div className="col-sm-3 search__counts">
              {this.resultsSummary()}
              <hr/>
              {this.searchAPIInstructions()}
              <hr/>
              <p className="learn-more">Learn more about our <a href="https://sprint.ly/blog/search-api/" target="_BLANK">Beta Item Search API with Facets</a>.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Search;
