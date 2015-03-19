import _ from 'lodash';
import React from 'react/addons';
import ItemCard from '../item-card';
import Backbone from 'backdash';
import ColumnHeader from './header';
import Loading from 'react-loading';
import ProductStore from '../../../stores/product-store';
import ProductActions from '../../../actions/product-actions';
import Confidence from 'confidence';

function getColumnState(items=[]) {
  return {
    items,
    isLoading: false,
    sortField: 'last_modified',
    sortDirection: 'desc',
    perPage: 10
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

  _onChange: function() {
    var state = _.cloneDeep(this.state);
    state.items = this.items.toJSON();
    state.isLoading = false;
    this.setState(state);
  },

  setSortCriteria: function(field=this.state.sortField, direction=this.state.sortDirection) {
    if (!this.items) {
      return;
    }

    var presenter = field === 'sort' ?
      _.identity :
      (o) => +new Date(o);

    this.items.comparator = (model) => {
      let criteria = field.indexOf('.') > -1 ?
        model.get('progress')[field.split('.')[1]]:
        model.get(field);
      let value = presenter(criteria)
      return direction === 'desc' ? -value : value;
    };

    this.items.sort();

    this.setState({
      sortField: field,
      sortDirection: direction,
      items: this.items.toJSON()
    });
  },

  getItems: function(product, options={}) {
    if (this.items) {
      if (!options.refresh) {
        return;
      }
      this.stopListening(this.items);
    }
    let filters = options.filters || this.props.filters;
    this.items = ProductStore.getItemsForProduct(product, this.props.status, filters);
    this.listenTo(this.items, 'change sync add remove', _.throttle(this._onChange, 200));
    this.setState({ isLoading: true });
    this.setSortCriteria();
    ProductActions.getItems(this.items);
  },

  componentWillMount: function() {
    this.getItems(this.props.product);
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

  render: function() {
    var items = this.state.items.slice(0, this.state.perPage)

    var classes = {
      column: true,
      [this.props.status]: true
    };

    var reverseSort = (ev) => {
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
        {this.state.isLoading ?
          <div className="loading"><Loading type="bubbles" color="#ccc"/></div> :
          _.map(this.state.items, function(item, index) {
            return <ItemCard item={item} key={`item-${item.number}`} />
          })
        }
      </div>
    )
  }
});

module.exports = ItemColumn

