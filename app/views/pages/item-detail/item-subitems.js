import React from 'react/addons';
import _ from 'lodash';
import helpers from '../../components/helpers';
import ItemDetailMixin from './detail-mixin';
import Subitem from './item-subitem';
import {State, Link} from 'react-router';
import ProductActions from '../../../actions/product-actions';
import ItemActions from '../../../actions/item-actions';
import Select from 'react-select';
import STATUS_MAP from '../../../lib/statuses-map';

var ItemSubitems = React.createClass({
  mixins: [State, ItemDetailMixin],

  propTypes: {
    members: React.PropTypes.array,
    subitems: React.PropTypes.array
  },

  getInitialState() {
    return {
      subitemsStates: {}
    }
  },

  toggleSubitem(id, ev) {
    let subitemsStates = _.cloneDeep(this.state.subitemsStates);
    subitemsStates[id].header = !subitemsStates[id].header;

    this.setState({subitemsStates: subitemsStates})
  },

  updateSubitem(subitem, ev) {
    let status;
    if (_.contains(['someday', 'backlog', 'in-progress'], subitem.status)) {
      status = 'accepted';
    } else if (_.contains(['completed', 'accepted'], subitem.status)) {
      status = 'in-progress';
    }

    ProductActions.updateItem(
      subitem.product.id,
      subitem.number,
      _.assign({}, subitem, { status }),
      { wait: false }
    );
  },

  toggleActionControl(subitem, type) {
    let id = subitem.number;
    let subitemsStates = _.cloneDeep(this.state.subitemsStates);
    subitemsStates[id].header = true;
    subitemsStates[id].controls = this.controlToggle(subitemsStates[id].controls, type);

    // TODO: See if es6 single var works here
    this.setState({subitemsStates: subitemsStates});
  },

  subitems() {
    return _.map(this.props.subitems, (subitem, index) => {
      let subitemState = this.state.subitemsStates[subitem.number]

      return (
        <Subitem index={index}
             subitem={subitem}
             members={this.props.members}
      setHoverStatus={this.setHoverStatus}
      resetHoverStatus={this.resetHoverStatus}
      toggleActionControl={this.toggleActionControl}
       toggleSubitem={this.toggleSubitem}
       updateSubitem={this.updateSubitem}
            {...subitemState} />
      )
    });
  },

  subheaderOpen(id) {
    let subitemsStates = _.values(this.state.subitemsStates[id])
    return _.contains(subitemsStates, true);
  },

  setHoverStatus(subitemId, key, ev) {
    let state = _.cloneDeep(this.state.subitemsStates)
    state[subitemId].hoverStatus = key;

    //  current
    this.setState({subitemsStates: state});
  },

  resetHoverStatus(subitemId, ev) {
    let state = _.cloneDeep(this.state.subitemsStates)
    state[subitemId].hoverStatus = false;
    // in-progress --> current
    this.setState({subitemsStates: state});
  },

  addNewSubitemState(newSubitems) {
    let requiresUpdate = false;
    let subitemsStates = _.cloneDeep(this.state.subitemsStates);
    let existingSubitems = _.keys(subitemsStates);

    _.each(newSubitems, function(item) {
      if (!_.contains(existingSubitems, item.number.toString())) {
        requiresUpdate = true;
        subitemsStates[item.number] = {
          header: false,
          hoverStatus: '',
          controls: {
            status: '',
            score: '',
            assignee: ''
          }
        }
      }
    })

    if (requiresUpdate) {
      this.setState({subitemsStates: subitemsStates});
    }
  },

  componentWillReceiveProps(nextProps) {
    let newSubitems = _.difference(nextProps.subitems, this.props.subitems);

    if (newSubitems) {
      this.addNewSubitemState(nextProps.subitems)
    }
  },

  collapseSubitems() {
    let subitemsStates = _.cloneDeep(this.state.subitemsStates);
    _.each(subitemsStates, function(val, key) {
      subitemsStates[key].header = false;
    })

    this.setState({subitemsStates: subitemsStates})
  },

  createSubitem(ev) {
    ev.preventDefault()
    let node = this.refs.addItemInput.getDOMNode()
    let title = node.value
    let productId = this.getParams().id
    let ticketNumber = this.getParams().number

    ItemActions.addItem(productId, {
      title,
      type: 'task',
      parent: ticketNumber
    }).then(function() {
      node.value = '';
    })
  },

  render: function() {
    let collapseAllLink = this.props.subitems ? <a className="collapse__subitems"onClick={this.collapseSubitems}>collapse all</a> : '';
    let subitems = this.props.subitems ? this.subitems() : [];

    return (
      <div className="col-md-12 section subitems">
        <div className="col-md-12">
          <div className="header">
            <div className="title">{helpers.toTitleCase('sub-items')}</div>
            {collapseAllLink}
            <div className="sep"></div>
          </div>
        </div>
        <div className="col-md-12">
          {subitems}
        </div>
        <div className="col-md-12 add-subitem">
          <form className="item-card__add-subitem" onSubmit={this.createSubitem}>
            <input ref="addItemInput" type="text" placeholder={"Add new sub-task"} className="form-control" />
            <button className="btn btn-default">+</button>
          </form>
        </div>
      </div>
    )
  }
});

export default ItemSubitems;
