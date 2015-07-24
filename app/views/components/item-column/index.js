import _ from 'lodash';
import React, { PropTypes } from 'react/addons';
import ScoreMap from '../../../lib/score-map';
// Components
import ItemCard from '../item-card';
import PlaceholderCards from './placeholder-cards';
import SprintGroup from './sprint-group';
import ColumnHeader from './header';
import NoSearchResults from './no-search-results';
// Flux
import ProductStore from '../../../stores/product-store';
import ProductActions from '../../../actions/product-actions';

import { DropTarget } from 'react-dnd';

const dropSpec = {
  drop(props, monitor, component) {
    if (monitor.didDrop()) {
      return;
    }

    let item = monitor.getItem();
    let { props } = component;

    if (item.status !== props.status) {
      ProductActions.updateItem(
        props.product.id,
        item.number,
        { status: props.status },
        { wait: false }
      );
    }

    return { moved: true };
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType()
  };
}

let ItemColumn = React.createClass({
  propTypes: {
    status: PropTypes.string.isRequired,
    product: PropTypes.object.isRequired,
    members: PropTypes.array.isRequired,
    filters: PropTypes.object.isRequired,
    velocity: PropTypes.object.isRequired,
    colWidth: PropTypes.object,
    sortField: PropTypes.string.isRequired,
    sortDirection: PropTypes.string.isRequired,
    limit: PropTypes.number.isRequired,
    items: PropTypes.array.isRequired,
    // DnD
    connectDropTarget: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      hideLoadMore: false
    };
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
      return <div className="loading">...</div>;
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
    let reverseSort = (ev) => {
      let direction = this.props.sortDirection === 'desc' ? 'asc' : 'desc';
      this.setSortCriteria(this.props.sortField, direction);
    };

    return this.props.connectDropTarget(
      <div style={this.props.colWidth} className={`column ${this.props.status}`} {...this.props}>
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

export default DropTarget('ITEM_CARD', dropSpec, collect)(ItemColumn);
