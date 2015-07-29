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
// Libs
import {State,Link} from 'react-router';

let initialItemDetailHeight = function() {
  let bodyHeight = document.body.getBoundingClientRect().height;
  let headerHeight = document.getElementsByClassName('product__header-menu')[0].getBoundingClientRect().height;

  return bodyHeight - headerHeight;
}

var ItemDetail = React.createClass({

  mixins: [State],

  getInitialState() {
    return {
      item: {},
      attachmentsPanel: false,
      itemDetailHeight: initialItemDetailHeight(),
      descriptionEditable: false,
    };
  },

  updateStripeHeight() {
    let content = document.getElementsByClassName('item-detail__content')[0];
    let height = content ? content.getBoundingClientRect().height : 0;

    if (height > this.state.itemDetailHeight) {
      this.setState({itemDetailHeight: height})
    }
  },

  componentWillReceiveProps: function(nextProps) {
    this.updateStripeHeight();

    if (this.getParams().number != this.state.item.number) {
      ItemActions.fetchItem(this.getParams().id, this.props.number);
      ItemActions.fetchActivity(this.getParams().id, this.getParams().number);
      this._onChange();
    }
  },

  setItem(key, ev, value) {
    let item = _.cloneDeep(this.state.item);
    item[key] = value;

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
                   assignee={this.state.item.assigned_to} />
    )
  },

  itemDescription() {
    return (
      <ItemDescription followers={[]}
                     description={this.state.item.description}
                         setItem={this.setItem} />
    )
  },

  itemAttachments() {
    let attachments = [];
    let item = this.state.item;

    if (item.activity && item.activity.activities) {
      attachments = _.where(item.activity.activities, {'action':'attachment'});
    }

    return (
      <ItemAttachments attachments={attachments} />
    )
  },

  subitems() {
    let subitems = this.state.item.sub_items || [];

    return (
      <ItemSubitems  members={this.props.members}
                    subitems={subitems} />
    )
  },

  itemComments() {
    return (
      <ItemComments />
    )
  },

  itemActivity() {
    let activity = this.state.item.activity || [];

    return (
      <ItemActivity members={this.props.members}
                    activity={activity} />
    )
  },

  componentDidMount() {
    ProductStore.addChangeListener(this._onChange);
    ItemActions.fetchItem(this.getParams().id, this.getParams().number);
    // TODO: Fetch the item followers on component did mount

    ItemActions.fetchActivity(this.getParams().id, this.getParams().number);
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
    let itemAttachments = this.itemAttachments();

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
            <span aria-hidden="true" className="glyphicon glyphicon-menu-right"/>
          </Link>
        </div>
        <div className="item-detail__content">
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

    if (item) {
      this.setState({item});
    }
  }
})

export default ItemDetail
