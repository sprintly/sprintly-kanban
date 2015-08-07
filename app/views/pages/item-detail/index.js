import React from 'react/addons';
import _ from 'lodash';

// Stores
import ProductStore from '../../../stores/product-store';
import ItemActions from '../../../actions/item-actions';
// Components
import ItemDetails from './item-details';
import ItemDescription from './item-description';
import ItemAttachments from './item-attachments';
import ItemSubitems from './item-subitems';
import ItemComments from './item-comments';
import ItemActivity from './item-activity';
import ItemDetailMixin from './detail-mixin';
// Libs
import {State,Link} from 'react-router';

let initialItemDetailHeight = function() {
  let bodyHeight = document.body.getBoundingClientRect().height;
  let headerHeight = document.getElementsByClassName('product__header-menu')[0].getBoundingClientRect().height;

  return bodyHeight - headerHeight;
}

var ItemDetail = React.createClass({

  mixins: [State, ItemDetailMixin],

  getInitialState() {
    let product = ProductStore.getProduct(this.getParams().id);

    return {
      item: {},
      product: product,
      attachmentsPanel: false,
      itemDetailHeight: initialItemDetailHeight(),
      descriptionEditable: false
    };
  },

  updateStripeHeight() {
    let content = document.getElementsByClassName('content__wrapper')[0];
    let height = content ? content.getBoundingClientRect().height : 0;

    if (height > this.state.itemDetailHeight) {
      this.setState({itemDetailHeight: height})
    }
  },

  componentWillReceiveProps(nextProps) {
    this.updateStripeHeight();

    if (this.getParams().number != this.state.item.number) {
      ItemActions.fetchItem(this.getParams().id, this.props.number);
      ItemActions.fetchActivity(this.getParams().id, this.getParams().number);
      this._onChange();
    }
  },

  setItem(key, ev, value) {
    let newVal = _.isUndefined(value) ? ev.currentTarget.value : value;

    let item = _.cloneDeep(this.state.item);
    item[key] = newVal;

    this.setState({item: item});
  },

  setSubitem(subitemId, key, ev, value) {
    let item = _.cloneDeep(this.state.item);
    let subitem = _.findWhere(item.sub_items, {number: subitemId})
    subitem[key] = value;

    this.setState({item: item});
  },

  updateItem() {
    let productId = this.getParams().id;
    let itemId = this.getParams().number;

    ProductActions.updateItem(productId, itemId, { description: this.state.item.description });
  },

  itemDetails() {
    return (
      <ItemDetails  members={this.props.members}
                       type={this.state.item.type}
                      title={this.state.item.title}
                        who={this.state.item.who}
                       what={this.state.item.what}
                        why={this.state.item.why}
                     number={this.state.item.number}
                       tags={this.state.item.tags}
                  createdAt={this.state.item.created_at}
                  createdBy={this.state.item.created_by}
                     status={this.state.item.status}
                     score={this.state.item.score}
                   assignee={this.state.item.assigned_to}
                attachments={this.state.item.attachments}
                   setItem={this.setItem}
                   productTags={this.state.product.tags} />
    )
  },

  itemDescription() {
    return (
      <div className="col-xs-12 col-sm-12 col-md-12 col-lg-9 section description">
        <div className="col-lg-12">
          {this.header('description')}
          <ItemDescription    itemId={this.state.item.number}
                         description={this.state.item.description}
                             members={this.props.members}
                             setItem={this.setItem}
                     alternateLayout={true} />
        </div>
      </div>
    )
  },

  subitems() {
    let subitems = this.state.item.sub_items || [];

    return (
      <ItemSubitems    item={this.state.item}
                    members={this.props.members}
                  productId={this.state.product.id}
                   subitems={subitems}
                 setSubitem={this.setSubitem} />
    )
  },

  itemComments() {
    return (
      <ItemComments members={this.props.members} />
    )
  },

  itemActivity() {
    let activityClone;
    let activity = this.state.item.activity;

    if (activity && activity.activities && activity.activities.length) {

      activityClone = _.cloneDeep(activity);
      activityClone.activities.reverse();
    }

    return (
      <ItemActivity members={this.props.members}
                   activity={activityClone}
         updateStripeHeight={this.updateStripeHeight} />
    )
  },

  componentDidMount() {
    ProductStore.addChangeListener(this._onChange);
    ItemActions.fetchItem(this.getParams().id, this.getParams().number);

    // TODO: Fetch the item followers on component did mount
    ItemActions.fetchActivity(this.getParams().id, this.getParams().number);
    ItemActions.fetchAttachments(this.getParams().id, this.getParams().number);
  },

  componentWillUnmount() {
    ProductStore.removeChangeListener(this._onChange);
  },

  render() {
    if (!this.state.item.number) {
      // Update to loading state where correct
      return <div/>;
    }

    let stripeClass = `stripe ${this.state.item.type}`;
    let closeClass = `item-detail__close ${this.state.item.type}`;
    var stripeStyles = {height: `${this.state.itemDetailHeight}px`};

    let itemDetails = this.itemDetails()
    let itemDescription = this.itemDescription();

    let attachments = [];
    let item = this.state.item;
    if (item.attachments && item.attachments.length) {
      attachments = item.attachments;
    }
    let itemAttachments = <ItemAttachments attachments={attachments}
                                                  size={'large'} />

    let subitems;
    if (this.state.item.type == 'story' && this.state.item.sub_items) {
      subitems = this.subitems();
    }
    let itemComments = this.itemComments()
    let itemActivity = this.itemActivity()

    return (
      <div ref="itemDetail" className="container-fluid item-detail no-gutter">
        <div style={stripeStyles} className={stripeClass}>
          <Link to="product" params={{ id: this.getParams().id }} className={closeClass}>
            <span aria-hidden="true" className="glyphicon glyphicon-remove"/>
          </Link>
        </div>
        <div className="content__wrapper">
          {itemDetails}
          {itemDescription}
          {itemAttachments}
          {subitems}
          {itemComments}
          {itemActivity}
        </div>
      </div>
    )
  },

  _onChange() {
    let item = ProductStore.getItem(this.getParams().id, this.getParams().number);
    let product = ProductStore.getProduct(this.getParams().id);

    if (item) {
      this.setState({
        item,
        product
      });
    }
  }
})

export default ItemDetail
