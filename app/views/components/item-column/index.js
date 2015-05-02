import _ from 'lodash';
import React from 'react/addons';
import moment from 'moment';
import ItemCard from '../item-card';
import ColumnHeader from './header';
import Loading from 'react-loading';
import ProductStore from '../../../stores/product-store';
import ProductActions from '../../../actions/product-actions';
import FilterActions from '../../../actions/filter-actions';
import Confidence from 'confidence';


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

  _onChange(payload) {
    let [sortField, sortDirection] = ProductStore.getSortCriteria(this.items);
    let state = {
      items: this.items.sort().toJSON(),
      limit: this.items.config.get('limit'),
      offset: this.items.config.get('offset'),
      isLoading: false,
      sortDirection,
      sortField
    };

    if (payload.count) {
      state.hideLoadMore = this.props.status === 'accepted' ?
        payload.count < 5 : payload.count < 25;
    }
    this.setState(state);
  },

  setSortCriteria(field=this.state.sortField, direction=this.state.sortDirection) {
    if (!this.items) {
      return;
    }

    this.setState({ isLoading: true });
    ProductActions.changeSortCriteria(this.items, field, direction);
  },

  getItems(product, options={ hideLoader: false }) {
    if (this.items) {
      if (!options.refresh) {
        return;
      }
      this.items.off(null, this._onChange);
    }

    // update collection filter
    let filters = _.clone(options.filters || this.props.filters);
    this.items = ProductStore.getItemsForProduct(product, this.props.status, filters);
    this.items.on('change sync add remove', this._onChange, this)
    this.setState({ isLoading: !options.hideLoader });

    ProductActions.getItems(this.items, this.state.sortField, this.state.sortDirection);
  },

  loadMoreItems() {
    ProductActions.loadMoreItems(this.items);
  },

  componentDidMount() {
    this.getItems(this.props.product);
  },

  componentWillUnmount() {
    this.items.off(null, this._onChange);
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
        refresh: true,
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
        key={`item-${this.props.product.id}${item.number}-${index}`}
      />
    );
    return card;
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
          _.map(this.state.items, this.renderItemCard)
        }
        {this.renderLoadMore()}
      </div>
    );
  }
});

module.exports = ItemColumn

