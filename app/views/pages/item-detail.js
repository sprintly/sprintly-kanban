import React from 'react/addons'
import _ from 'lodash'
import helpers from './helpers'
// Stores
import ProductStore from '../../stores/product-store'
import ItemActions from '../../actions/item-actions'
import ProductActions from '../../actions/product-actions'
// Components
import ItemHeader from '../components/item-detail/item-header'
import DrawerStripe from '../components/drawer-stripe'
import ItemDetails from '../components/item-detail/item-details'
import ItemDescription from '../components/item-detail/item-description'
import ItemAttachments from '../components/item-detail/item-attachments'
import ItemSubitems from '../components/item-detail/item-subitems'
import ItemComments from '../components/item-detail/item-comments'
import ItemActivity from '../components/item-detail/item-activity'
import ItemDetailMixin from '../components/item-detail/detail-mixin'
// Libs
import {State} from 'react-router'

var ItemDetail = React.createClass({

  mixins: [State, ItemDetailMixin],

  getInitialState() {
    let product = ProductStore.getProduct(this.getParams().id)

    return {
      item: {},
      product: product,
      attachmentsPanel: false,
      stripeHeight: helpers.stripeHeight(),
      descriptionEditable: false
    }
  },

  updateStripeHeight() {
    let content = document.getElementsByClassName('drawer__content')[0]
    let height = content ? content.getBoundingClientRect().height : 0

    if (height > this.state.stripeHeight) {
      this.setState({stripeHeight: height})
    }
  },

  toggleAttachments() {
    this.setState({attachmentsOpen: !this.state.attachmentsOpen})
  },

  setItem(key, ev, value) {
    let newVal = _.isUndefined(value) ? ev.currentTarget.value : value

    let item = _.cloneDeep(this.state.item)
    item[key] = newVal

    this.setState({item: item})
  },

  setSubitem(subitemId, key, ev, value) {
    let item = _.cloneDeep(this.state.item)
    let subitem = _.findWhere(item.sub_items, {number: subitemId})
    subitem[key] = value

    this.setState({item: item})
  },

  updateItem() {
    let productId = this.getParams().id
    let itemId = this.getParams().number

    ProductActions.updateItem(productId, itemId, { description: this.state.item.description })
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
      <div className="col-xs-12 section description">
        <div className="col-xs-12">
          <ItemHeader title="description" />
          <ItemDescription    itemId={this.state.item.number}
                           productId={this.props.product.id}
                         description={this.state.item.description}
                             members={this.props.members}
                             setItem={this.setItem}
                     alternateLayout={true} />
        </div>
      </div>
    )
  },

  itemSubitems() {
    if (this.state.item.type == 'story' && this.state.item.sub_items) {
      let subitems = this.state.item.sub_items || []

      return (
        <ItemSubitems    item={this.state.item}
                      members={this.props.members}
                    productId={this.props.product.id}
                     subitems={subitems}
                   setSubitem={this.setSubitem} />
      )
    }
  },

  itemComments() {
    return (
      <ItemComments members={this.props.members} />
    )
  },

  itemActivity() {
    let activityClone
    let activity = this.state.item.activity

    if (activity && activity.activities && activity.activities.length) {

      activityClone = _.cloneDeep(activity)
      activityClone.activities.reverse()
    }

    return (
      <ItemActivity members={this.props.members}
                   activity={activityClone}
         updateStripeHeight={this.updateStripeHeight} />
    )
  },

  itemAttachments() {
    let attachments = []
    let item = this.state.item
    if (item.attachments && item.attachments.length) {
      attachments = item.attachments
    }
    return (
      <ItemAttachments attachments={attachments}
                              open={this.state.attachmentsOpen}
                            toggle={this.toggleAttachments} />
    )
  },

  componentWillReceiveProps(nextProps) {
    this.updateStripeHeight()

    if (this.props.number != nextProps.number) {
      this._fetchItemData()
      this.setState({
        attachmentsOpen: false
      })
      this._onChange()
    }
  },

  componentDidMount() {
    ProductStore.addChangeListener(this._onChange)
    this._fetchItemData()
  },

  componentWillUnmount() {
    ProductStore.removeChangeListener(this._onChange)
  },

  render() {
    if (!this.state.item.number) {
      // Update to loading state where correct
      return <div/>
    }

    return (
      <div ref="itemDetail" className="container-fluid item-detail no-gutter drawer">
        <DrawerStripe type={this.state.item.type}
                      height={this.state.stripeHeight} />
        <div className="drawer__content">
          {this.itemDetails()}
          {this.itemDescription()}
          {this.itemAttachments()}
          {this.itemSubitems()}
          {this.itemComments()}
          {this.itemActivity()}
        </div>
      </div>
    )
  },

  _onChange() {
    let item = ProductStore.getItem(this.getParams().id, this.getParams().number)
    let product = ProductStore.getProduct(this.getParams().id)

    if (item) {
      this.setState({
        item,
        product
      })
    }
  },

  _fetchItemData() {
    ItemActions.fetchItem(this.getParams().id, this.getParams().number)
    ItemActions.fetchActivity(this.getParams().id, this.getParams().number)
    ItemActions.fetchAttachments(this.getParams().id, this.getParams().number)
  }
})

export default ItemDetail
