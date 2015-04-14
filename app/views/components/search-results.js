import _ from 'lodash';
import React from "react";
import {Badge, ListGroup, ListGroupItem, ButtonGroup} from 'react-bootstrap';
import ItemCard from '../components/item-card';

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

  addProduct: function(value, ev) {
    let productFacet = `product:${value}`;
    let query = this.addFacet(productFacet);
    this.props.search(query, { loader: false });
  },

  addItemType(type, ev) {
    ev.preventDefault();
    let itemFacet = `type:${type}`;
    let query = this.addFacet(itemFacet);
    this.props.search(query, { loader: false });
  },

  addFacet(facet) {
    let query = this.props.query.indexOf(facet) > -1 ?
      this.props.query.replace(facet, ''):
      `${this.props.query} ${facet}`;

    return query.trim();
  },

  render() {
    let items = this.props.results.items;
    let page = items.slice(0, this.state.perPage * this.state.currentPage);

    return (
      <div className="row">
        <div className="col-sm-2 search__filters">
          <ButtonGroup vertical>
            {_.map(this.props.results.products, function(product) {
              return <button className="btn btn-default" onClick={_.partial(this.addProduct, product.id)}>{product.name}</button>
            }, this)}
          </ButtonGroup>
          <ListGroup>
            <ListGroupItem href="#" onClick={_.partial(this.addItemType, 'story')} bsStyle="success">
              Stories <Badge>{this.props.results.stories.length}</Badge>
            </ListGroupItem>
            <ListGroupItem href="#" onClick={_.partial(this.addItemType, 'defect')} bsStyle="warning">
              Defects <Badge>{this.props.results.defects.length}</Badge>
            </ListGroupItem>
            <ListGroupItem href="#" onClick={_.partial(this.addItemType, 'task')}>
              Tasks <Badge>{this.props.results.tasks.length}</Badge>
            </ListGroupItem>
            <ListGroupItem href="#" onClick={_.partial(this.addItemType, 'test')} bsStyle="info">
              Tests <Badge>{this.props.results.tests.length}</Badge>
            </ListGroupItem>
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
          <small><i>{this.props.results.items.length} matching items.</i></small>
          <hr/>
          <p>Learn about our <a href="https://sprint.ly/blog/search-api/" target="_BLANK">Beta Item Search API with Facets</a>.</p>
        </div>
      </div>
    );
  }
});

export default SearchResults;
