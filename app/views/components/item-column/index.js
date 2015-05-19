import _ from 'lodash';
import React from 'react/addons';
import moment from 'moment';
import ItemCard from '../item-card';
import ItemGroup from '../item-group';
import ColumnHeader from './header';
import Loading from 'react-loading';
import ProductStore from '../../../stores/product-store';
import ProductActions from '../../../actions/product-actions';
import FilterActions from '../../../actions/filter-actions';


function getColumnState(items=[]) {
  return {
    items,
    isLoading: false,
    hideLoadMore: false,
    sortField: 'last_modified',
    sortDirection: 'desc',
    offset: 0,
    limit: 0
  }
}

var ItemColumn = React.createClass({

  propTypes: {
    status: React.PropTypes.string.isRequired,
    product: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return getColumnState();
  },

  _onChange() {
    let state = ProductStore.getItems(this.props.product.id, this.props.status);
    if (!state) {
      return;
    }

    state.isLoading = false;
    this.setState(state);
  },

  setSortCriteria(field=this.state.sortField, direction=this.state.sortDirection) {
    let items = ProductStore.getItemsCollection(this.props.product.id, this.props.status);
    if (!items) {
      return;
    }

    this.setState({ isLoading: true });
    ProductActions.changeSortCriteria(items, field, direction);
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
        sortField={this.state.sortField}
        productId={this.props.product.id}
        key={`item-${this.props.product.id}${item.number}`}
      />
    );
    return card;
  },

  renderItemCards() {
    return _.map(this.state.items, this.renderItemCard);
  },

  renderItemGroups() {
    let itemsLength = this.state.items.length;
    let chunks = [];
    let currentPointCount = 0;
    let currentChunk = [];
    _.each(this.state.items, function(item, i) {
      currentPointCount += 3;
      currentChunk.push(item);
      if (currentPointCount >= 10) {
        chunks.push(currentChunk);
        currentPointCount = 0;
        currentChunk = [];
      }
    });
    let groups = _.map(chunks, (items, i) => {
      let startDate = moment().startOf('isoweek').add(7 * i, 'days').format('DD MMM');
      return (
        <ItemGroup
          key={`item-group-${i}`}
          items={items}
          productId={this.props.product.id}
          startDate={startDate}
          startOpen={i === 0}
        />
      );
    });
    return groups;
  },

  render() {
    var classes = {
      column: true,
      [this.props.status]: true
    };

    var reverseSort = (ev) => {
      let direction = this.state.sortDirection === 'desc' ? 'asc' : 'desc';
      this.setSortCriteria(this.state.sortField, direction);
    };
    var productId = this.props.product.id;
    var showGroups = this.props.status === 'backlog' && this.state.sortField === 'priority';
    var renderCardsOrGroups = showGroups ? this.renderItemGroups : this.renderItemCards;

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
          renderCardsOrGroups()
        }
        {this.renderLoadMore()}
      </div>
    );
  }
});

module.exports = ItemColumn

