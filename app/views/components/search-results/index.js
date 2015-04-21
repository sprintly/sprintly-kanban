import _ from 'lodash';
import React from "react";
import {Badge, ListGroup, ListGroupItem, ButtonGroup, DropdownButton, MenuItem} from 'react-bootstrap';
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

  addProduct(value, ev) {
    let productFacet = `product:${value}`;
    let query = this.addFacet(productFacet);
    this.props.search(query, { progressBar: false });
  },

  addItemType(type, ev) {
    if (ev) {
      ev.preventDefault();
    }
    let itemFacet = `type:${type}`;
    let query = this.addFacet(itemFacet);
    this.props.search(query, { progressBar: false });
  },

  addFacet(facet) {
    let query = this.props.query.indexOf(facet) > -1 ?
      this.props.query.replace(facet, ''):
      `${this.props.query} ${facet}`;

    return query.trim();
  },

  ticketControlLinks() {
    return ([
      <a href="#" onClick={_.partial(this.addItemType, 'story')} className="btn btn-default story">Story</a>,
      <a href="#" onClick={_.partial(this.addItemType, 'defect')} className="btn btn-default defect">Defect</a>,
      <a href="#" onClick={_.partial(this.addItemType, 'task')} className="btn btn-default task">Task</a>,
      <a href="#" onClick={_.partial(this.addItemType, 'test')} className="btn btn-default test">Test</a>
    ])
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

  productControls() {
    return ([
      <i>Filter by Product</i>,
      <ButtonGroup vertical className="hidden-xs">
        {_.map(this.props.results.products, (product) => {
          return <button className="btn btn-default" onClick={_.partial(this.addProduct, product.id)}>{product.name}</button>
        })}
      </ButtonGroup>,
      <DropdownButton block title="Products" className="visible-xs-inline-block" onSelect={(product) => { this.addProduct(product) }}>
        {_.map(this.props.results.products, (product) => {
          return <MenuItem eventKey={product.id}>{product.name}</MenuItem>
        })}
      </DropdownButton>
    ])
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

  resultsSummary() {
    let issueTypes = ['stories', 'defects', 'tasks', 'tests'];
    let results = this.props.results;

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

  render() {
    return (
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
        <div className="col-sm-6 search__results">
          {this.itemCardNodes()}
          {this.pageControls()}
        </div>
        <div className="col-sm-2 search__counts">
          {this.resultsSummary()}
          <hr/>
          <p>Learn about our <a href="https://sprint.ly/blog/search-api/" target="_BLANK">Beta Item Search API with Facets</a>.</p>
        </div>
      </div>
    );
  }
});

export default SearchResults;
