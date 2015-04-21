import _ from 'lodash';
import React from "react";

import {State, Navigation} from "react-router";
import {ProgressBar} from 'react-bootstrap';
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
    let results;

    if (this.state.loading && this.state.showProgress) {
      results = (
        <div className="col-sm-10 col-sm-offset-1">
          <small>Reticulating splines...</small>
          <ProgressBar active bsStyle="info" now={this.state.progress}/>
        </div>
      );
    } else {
      results = this.state.results.items && this.state.results.items.length > 0 ?
        <SearchResults
          search={this.search}
          query={this.state.query}
          results={this.state.results}
        /> :
        <div className="col-sm-offset-2">
          <i>No items found. Try again with a different query.</i>
        </div>;
    }

    return results;
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
          <hr/>
          {this.renderResults()}
        </div>
      </div>
    );
  }
});

module.exports = Search;
