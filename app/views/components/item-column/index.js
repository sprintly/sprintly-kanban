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

function getColumnState(items=[], previousState={}) {
  return _.extend({
    items,
    isLoading: false,
    hideLoadMore: false,
    sortField: 'last_modified',
    sortDirection: 'desc',
    offset: 0,
    limit: 0
  }, previousState);
}

var ItemColumn = React.createClass({
  propTypes: {
    status: React.PropTypes.string.isRequired,
    product: React.PropTypes.object.isRequired,
    members: React.PropTypes.array.isRequired,
    filters: React.PropTypes.object.isRequired,
    key: React.PropTypes.string.isRequired,
    velocity: React.PropTypes.object.isRequired
  },

  getInitialState() {
    let previousState = {};
    let previousSortField = window.localStorage.getItem(`itemColumn-${this.props.status}-sortField`);
    if (previousSortField) {
      previousState.sortField = previousSortField;
    }
    return getColumnState([], previousState);
  },

  _onChange() {
    let state = ProductStore.getItems(this.props.product.id, this.props.status);
    if (!state) {
      return;
    }

    state.isLoading = false;
    this.setState(state);
  },

  setSortCriteria(field=this.state.sortField, direction=this.state.sortDirection, status=this.props.status) {
    let items = ProductStore.getItemsCollection(this.props.product.id, status);
    if (!items) {
      return;
    }

    this.setState({ isLoading: true });
    let options = {
      field,
      direction,
      status
    };
    ProductActions.changeSortCriteria(items, options);
  },

  getItems(product, options={ hideLoader: false }) {
    this.setState({ isLoading: !options.hideLoader });
    ProductActions.getItemsForProduct(product, {
      filters: options.filters || this.props.filters,
      status: this.props.status,
      sortField: this.state.sortField,
      sortDirection: this.state.sortDirection
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

    if (this.state.isLoading || this.state.hideLoadMore || _.isEmpty(this.state.items) || this.state.items.length < this.state.limit) {
      return '';
    }

    return loadMore;
  },

  renderItemCard(item, index) {
    return (
      <ItemCard
        item={item}
        members={this.props.members}
        sortField={this.state.sortField}
        productId={this.props.product.id}
        key={`item-${this.props.product.id}${item.number}`}
      />
    )
  },

  productHasItemsToRender() {
    return ProductStore.hasItemsToRender(this.props.product.id);
  },

  productHasItems() {
    return ProductStore.hasItems(this.props.product.id)
  },

  renderItemCards() {
    if (this.productHasItems()) {
      if (this.productHasItemsToRender()) {
        let itemCards = _.map(this.state.items, this.renderItemCard)
        return <div>{itemCards}</div>
      } else if (this.props.status === 'in-progress') {
        return <NoSearchResults />;
      } else {
        return '';
      }
    } else {
      return <PlaceholderCards status={this.props.status} />
    }
  },

  renderSprintGroup() {
    return <SprintGroup
      items={this.state.items}
      members={this.props.members}
      velocity={this.props.velocity}
      sortField={this.state.sortField}
      productId={this.props.product.id}
    />;
  },

  columnContent() {
    if (this.state.isLoading) {
      return <div className="loading"><Loading type="bubbles" color="#ccc"/></div>
    } else {
      let showSprints = this.props.status === 'backlog' && this.state.sortField === 'priority';
      return showSprints ? this.renderSprintGroup() : this.renderItemCards();
    }
  },

  // React functions

  componentDidMount() {
    ProductStore.addChangeListener(this._onChange);
    this.getItems(this.props.product);
  },

  componentWillUnmount() {
    ProductStore.removeChangeListener(this._onChange);
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
      this.setState({ isLoading: true });
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
      let direction = this.state.sortDirection === 'desc' ? 'asc' : 'desc';
      this.setSortCriteria(this.state.sortField, direction);
    };

    return (
      <div className={React.addons.classSet(classes)} {...this.props}>
        <ColumnHeader {...this.props}
          reverse={reverseSort}
          setSortCriteria={this.setSortCriteria}
          sortDirection={this.state.sortDirection}
          sortField={this.state.sortField}
        />
        {this.columnContent()}
        {this.renderLoadMore()}
      </div>
    );
  }
});

module.exports = ItemColumn
