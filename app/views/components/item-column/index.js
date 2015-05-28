import _ from 'lodash';
import React from 'react/addons';
import moment from 'moment';
import ItemCard from '../item-card';
import SprintGroup from './sprint-group';
import ColumnSummary from './summary';
import ColumnHeader from './header';
import Loading from 'react-loading';
import ProductStore from '../../../stores/product-store';
import ProductActions from '../../../actions/product-actions';
import FilterActions from '../../../actions/filter-actions';
import ScoreMap from '../../../lib/score-map';

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
    product: React.PropTypes.object.isRequired
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
    })
  },

  loadMoreItems() {
    let items = ProductStore.getItemsCollection(this.props.product.id, this.props.status);
    if (!items) {
      return;
    }
    ProductActions.loadMoreItems(items);
  },

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

  calculateSummary() {
    let points = _.reduce(this.state.items, function(total, item) {
      total += ScoreMap[item.score];
      return total;
    }, 0);
    return {
      points,
      startDate: moment().startOf('isoweek').format('D MMM')
    }
  },

  renderLoadMore() {
    var loadMore = <button className="load-more" onClick={this.loadMoreItems}>Load More</button>;

    if (this.state.isLoading || this.state.hideLoadMore || this.state.items.length < this.state.limit) {
      return '';
    }

    return loadMore;
  },

  renderItemCard(item, index) {
    let card = (
      <ItemCard
        item={item}
        members={this.props.members}
        sortField={this.state.sortField}
        productId={this.props.product.id}
        key={`item-${this.props.product.id}${item.number}`}
      />
    );
    return card;
  },

  renderItemCards() {
    let showSummary = this.props.status === 'in-progress' && this.state.sortField === 'priority';
    let itemCards = _.map(this.state.items, this.renderItemCard);
    if (showSummary) {
      let props = this.calculateSummary();
      return (
        <div>
          <ColumnSummary {...props} />
          {itemCards}
        </div>
      );
    } else {
      return (<div>{itemCards}</div>);
    }
  },

  renderSprintGroup() {
    return <SprintGroup
      items={this.state.items}
      velocity={this.props.velocity}
      sortField={this.state.sortField}
      productId={this.props.product.id} />;
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

    let showSprints = this.props.status === 'backlog' && this.state.sortField === 'priority';
    let renderCardsOrSprints = showSprints ? this.renderSprintGroup : this.renderItemCards;

    return (
      <div className={React.addons.classSet(classes)} {...this.props}>
        <ColumnHeader {...this.props}
          reverse={reverseSort}
          setSortCriteria={this.setSortCriteria}
          sortDirection={this.state.sortDirection}
          sortField={this.state.sortField}
        />
        {this.state.isLoading ?
          <div className="loading"><Loading type="bubbles" color="#ccc"/></div> :
          renderCardsOrSprints()
        }
        {this.renderLoadMore()}
      </div>
    );
  }
});

module.exports = ItemColumn

