import _ from 'lodash';
import React from 'react/addons';
import ItemCard from '../item-card';
import Backbone from 'backdash';
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

  mixins: [Backbone.Events],

  propTypes: {
    status: React.PropTypes.string.isRequired,
    product: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return getColumnState();
  },

  _onChange: function(payload) {
    var state = _.cloneDeep(this.state);
    state.items = this.items.sort().toJSON();
    state.isLoading = false;
    state.limit = this.items.config.get('limit');
    state.offset = this.items.config.get('offset');

    if (payload.count) {
      console.log(payload.count)
      state.hideLoadMore = this.props.status === 'accepted' ?
        payload.count < 5 : payload.count < 25;
    }
    this.setState(state);
  },

  getSortFilterValue: function(field=this.state.sortField, direction=this.state.sortDirection) {
    if (field === 'last_modified') {
      field = direction === 'asc' ? 'stale' : 'recent';
    }

    if (field === 'created_at') {
      field = direction === 'asc' ? 'oldest' : 'newest';
    }

    return field;
  },

  setSortCriteria: function(field=this.state.sortField, direction=this.state.sortDirection) {
    if (!this.items) {
      return;
    }

    this.setComparator(field, direction);

    this.setState({
      sortField: field,
      sortDirection: direction,
      items: this.items.toJSON()
    });

    this.getItems(this.props.product, {
      refresh: true,
      sort: this.getSortFilterValue(field, direction)
    });
  },

  setComparator: function(field=this.state.sortField, direction=this.state.sortDirection) {
    var presenter = (o) => +new Date(o);

    if (field === 'priority') {
      field = 'sort';
      presenter = _.identity;
    }

    this.items.comparator = (model) => {
      let criteria = field.indexOf('.') > -1 ?
        model.get('progress')[field.split('.')[1]]:
        model.get(field);
      let value = presenter(criteria)
      return direction === 'desc' ? -value : value;
    };

    this.items.sort();
  },

  getItems: function(product, options={ hideLoader: false }) {
    if (this.items) {
      if (!options.refresh) {
        return;
      }
      this.stopListening(this.items);
    }

    // update collection filter
    let filters = _.clone(options.filters || this.props.filters);
    filters.order_by = options.sort || this.getSortFilterValue();
    this.items = ProductStore.getItemsForProduct(product, this.props.status, filters);
    this.listenTo(this.items, 'change sync add remove', this._onChange);

    this.setState({ isLoading: !options.hideLoader });
    this.setComparator();

    ProductActions.getItems(this.items);
  },

  loadMoreItems: function() {
    ProductActions.loadMoreItems(this.items);
  },

  componentDidMount: function() {
    this.getItems(this.props.product);
  },

  componentWillUnmount: function() {
    this.stopListening(this.items);
  },

  componentWillReceiveProps: function(nextProps) {
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

  renderLoadMore: function() {
    var loadMore = <button className="load-more" onClick={this.loadMoreItems}>Load More</button>;

    if (this.state.isLoading || this.state.hideLoadMore || this.state.items.length < this.state.limit) {
      return '';
    }

    return loadMore;
  },

  render: function() {
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
          _.map(this.state.items, function(item, index) {
            return <ItemCard item={item} productId={productId} key={`item-${item.number}`} />
          })
        }
        {this.renderLoadMore()}
      </div>
    );
  }
});

module.exports = ItemColumn

