import _ from 'lodash';
import React from 'react/addons';
import Loading from 'react-loading';
import ScoreMap from '../../../lib/score-map';
// Components
import ItemCard from '../item-card';
import PlaceholderCards from './placeholder-cards'
import SprintGroup from './sprint-group';
import ColumnSummary from './summary';
import ColumnHeader from './header';
import NoSearchResults from './no-search-results';
// Flux
import ProductStore from '../../../stores/product-store';
import ProductActions from '../../../actions/product-actions';
import FilterActions from '../../../actions/filter-actions';

let ItemColumn = React.createClass({
  propTypes: {
    status: React.PropTypes.string.isRequired,
    product: React.PropTypes.object.isRequired,
    members: React.PropTypes.array.isRequired,
    filters: React.PropTypes.object.isRequired,
    velocity: React.PropTypes.object.isRequired,
    colWidth: React.PropTypes.object,
    sortField: React.PropTypes.string.isRequired,
    sortDirection: React.PropTypes.string.isRequired,
    limit: React.PropTypes.number.isRequired,
    items: React.PropTypes.array.isRequired
  },

  getInitialState() {
    return {
      hideLoadMore: false
    }
  },

  _onChange() {
    let state = ProductStore.getItems(this.props.product.id, this.props.status);
    if (!state) {
      return;
    }

    this.setState(state);
  },

  setSortCriteria(field=this.props.sortField, direction=this.props.sortDirection, status=this.props.status) {
    let items = ProductStore.getItemsCollection(this.props.product.id, status);
    if (!items) {
      return;
    }

    let options = {
      field,
      direction,
      status
    };
    ProductActions.changeSortCriteria(items, options);
  },

  getItems(product, options={ hideLoader: false }) {
    ProductActions.getItemsForStatus(product, {
      filters: options.filters || this.props.filters,
      status: this.props.status,
      sortField: this.props.sortField,
      sortDirection: this.props.sortDirection
    });
  },

  loadMoreItems() {
    let items = ProductStore.getItemsCollection(this.props.product.id, this.props.status);
    if (!items) {
      return;
    }
    ProductActions.loadMoreItems(items);
  },

  renderLoadMore() {
    var loadMore = <button className="load-more" onClick={this.loadMoreItems}>Load More</button>;

    if (this.state.hideLoadMore || _.isEmpty(this.props.items) || this.props.items.length < this.props.limit) {
      return '';
    }

    return loadMore;
  },

  renderItemCard(item, index) {
    return (
      <ItemCard
        item={item}
        members={this.props.members}
        sortField={this.props.sortField}
        productId={this.props.product.id}
        key={`item-${this.props.product.id}${item.number}`}
      />
    )
  },

  productHasItems() {
    return ProductStore.hasItems(this.props.product.id)
  },

  productHasItemsToRender() {
    return ProductStore.hasItemsToRender(this.props.product.id);
  },

  renderItemCards() {
    if (this.props.loading) {
      return <div className="loading"><Loading type="bubbles" color="#ccc"/></div>;
    }

    if (this.productHasItems()) {
      if (this.productHasItemsToRender()) {
        let itemCards = _.map(this.props.items, this.renderItemCard)

        return <div>{itemCards}</div>
      } else if (this.props.status === 'in-progress') {
        return <NoSearchResults product={this.props.product} />;
      } else {
        return '';
      }
    } else {
      return <PlaceholderCards status={this.props.status} />
    }
  },

  renderSprintGroup() {
    return <SprintGroup
      items={this.props.items}
      members={this.props.members}
      velocity={this.props.velocity}
      sortField={this.props.sortField}
      productId={this.props.product.id}
    />;
  },

  columnContent() {
    let showSprints = this.props.status === 'backlog' && this.props.sortField === 'priority';
    if (showSprints) {
      return this.renderSprintGroup()
    } else {
      return this.renderItemCards();
    }
  },

  // React functions

  componentDidMount() {
    this.getItems(this.props.product);
  },

  componentWillReceiveProps(nextProps) {
    var reload = false;

    if (nextProps.product.id !== this.props.product.id) {
      reload = true;
    }

    if (_.isEqual(nextProps.filters, this.props.filters) === false) {
      reload = true;
    }

    if (reload) {
      this.getItems(nextProps.product, {
        filters: nextProps.filters
      });
    }
  },

  render() {
    let classes = {
      column: true,
      [this.props.status]: true
    };

    let reverseSort = (ev) => {
      let direction = this.props.sortDirection === 'desc' ? 'asc' : 'desc';
      this.setSortCriteria(this.props.sortField, direction);
    };

    return (
      <div style={this.props.colWidth} className={React.addons.classSet(classes)} {...this.props}>
        <ColumnHeader {...this.props}
          reverse={reverseSort}
          setSortCriteria={this.setSortCriteria}
          sortDirection={this.props.sortDirection}
          sortField={this.props.sortField}
        />
        {this.columnContent()}
        {this.renderLoadMore()}
      </div>
    );
  }
});

module.exports = ItemColumn
