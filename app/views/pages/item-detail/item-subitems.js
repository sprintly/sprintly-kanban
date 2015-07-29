import React from 'react/addons';
import _ from 'lodash';
import helpers from '../../components/helpers';
import ItemDetailMixin from './detail-mixin';
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
    if (type === 'assignee' & !this.canBeReassigned(subitem.status)) {
      // Update UI with message as to why cannot reassign
    }

    let id = subitem.number;
    let subitemsStates = _.cloneDeep(this.state.subitemsStates);
    subitemsStates[id].header = true;
    subitemsStates[id].controls = this.controlToggle(subitemsStates[id].controls, type);

    // TODO: See if es6 single var works here
    this.setState({subitemsStates: subitemsStates});
  },

  subitemHeader(subitem, index, ctx) {
    let subitemState = ctx.state.subitemsStates[subitem.number];
    let headerClasses = React.addons.classSet({
      'header': true,
      'open': subitemState.header
    });

    let title = subitem.title;
    let status = subitemState.hoverStatus || ctx.itemStatus(subitem.status);
    let subitemId = subitem.number;

    let email = (subitem.assigned_to && subitem.assigned_to.email) ? subitem.assigned_to.email : '';
    let assigneeGravatar = ctx.assigneeGravatar(email);
    let itemScoreButton = ctx.itemScoreButton(subitem.type, subitem.score);

    let checked = subitem.status === 'completed' || subitem.status === 'accepted';

    return ([
      <div className={headerClasses}>
        <a className="toggle" onClick={_.partial(ctx.toggleSubitem, subitem.number)}>
          <span aria-hidden="true" className="glyphicon glyphicon-menu-right" />
        </a>
        <div className="sep-vertical"></div>
        <div className="meta id">#{subitemId}</div>
        <div className="title">{title}</div>
        <div className="col-md-4 state collapse-right">
          <ul>
            <div className="col-md-3">
              <li onClick={_.partial(ctx.toggleActionControl, subitem, 'status')}>
                <div className="meta status">{helpers.toTitleCase(status)}</div>
              </li>
            </div>
            <div className="col-md-3">
              <li onClick={_.partial(ctx.toggleActionControl, subitem, 'assignee')}>
                <div className="meta">{assigneeGravatar}</div>
              </li>
            </div>
            <div className="col-md-3">
              <li onClick={_.partial(ctx.toggleActionControl, subitem, 'score')}>
                <div className="meta">{itemScoreButton}</div>
              </li>
            </div>
            <div className="col-md-3">
              <li>
                <div className="meta">
                  <div className="subitemCheck">
                    <input name="subitemCheck" type="checkbox" checked={checked} onChange={_.partial(ctx.updateSubitem, subitem)} id={`subitem-${index}`} />
                    <label htmlFor={`subitem-${index}`}></label>
                  </div>
                </div>
              </li>
            </div>
          </ul>
        </div>
      </div>
    ])
  },

  subitems() {
    return _.map(this.props.subitems, (subitem, i) => {
      let header = this.subitemHeader(subitem, i, this);
      let subitemActions = this.subitemActions(subitem, i, this);

      let headerOpenState = this.state.subitemsStates[subitem.number].header;
      let contentClasses = React.addons.classSet({
        'content': true,
        'open': headerOpenState
      });
      let contentStyles = !headerOpenState ? {overflow: 'hidden'} : {};

      let descriptionClasses = React.addons.classSet({
        "col-md-8": true,
        "description": true,
        'italicize': !subitem.description
      })
      let description = subitem.description || 'This subitem has no description yet...';

      let tags = this.buildTags(subitem.tags);
      let createdByTimestamp = this.createdByTimestamp(subitem.created_at, subitem.created_by);

      let viewTicketURL = `/product/${this.getParams().id}/item/${subitem.number}`;

      return (
        <div key={i} className="subitem">
          {header}
          <div className={contentClasses} style={contentStyles}>
            <div className="col-md-12">
              <div className="col-md-12 collapse-right">
                <div className={descriptionClasses}>
                  {description}
                </div>
                <div className="col-md-4 control collapse-right">
                  {subitemActions}
                  <button className="detail-button kanban-button-secondary">
                    <Link to={viewTicketURL}>View Full Ticket</Link>
                  </button>
                </div>
              </div>
              <div className="col-md-12 meta collapse-right">
                <div className="col-md-6 tags no-gutter">
                  {tags}
                </div>
                <div className="col-md-6 timestamp no-gutter">
                  {createdByTimestamp}
                </div>
              </div>
            </div>
          </div>
        </div>
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

  updateAttribute(subitemId, attr, value) {
    let productId = this.getParams().id;
    // restart status map
    if (attr === 'status') {
      value = STATUS_MAP[value];
    }

    let newAttrs = {};
    newAttrs[attr] = value;

    ProductActions.updateItem(productId, subitemId, newAttrs);
  },

  subitemActions(subitem, index, ctx) {
    let subheaderClasses = React.addons.classSet({
      'subheader': true,
      'open': ctx.state.subitemsStates[subitem.number].header
    });
    let members = helpers.formatSelectMembers(this.props.members);
    let currentAssignee = ctx.currentAssignee(ctx.props.members, subitem.assigned_to);
    let estimator = ctx.estimator(subitem.score, subitem.type, _.partial(ctx.updateAttribute, subitem.number));
    let statusPicker = ctx.statusPicker(subitem.status, _.partial(ctx.setHoverStatus, subitem.number), _.partial(ctx.resetHoverStatus, subitem.number), _.partial(ctx.updateAttribute, subitem.number));
    let controlsState = this.state.subitemsStates[subitem.number].controls;

    return (
      <div className="col-md-8 state collapse-right pull-right">
        <div className={ctx.componentVisible(controlsState, 'assignee')}>
          <Select placeholder={"Choose assignee"}
                name="form-field-name"
                className="assign-dropdown"
                disabled={false}
                value={currentAssignee}
                options={members}
                onChange={_.partial(ctx.updateAttribute, subitem.number, 'assigned_to')}
                clearable={true} />
        </div>
        <div className={ctx.componentVisible(controlsState, 'score')}>
          {estimator}
        </div>
        <div className={ctx.componentVisible(controlsState, 'status')}>
          {statusPicker}
        </div>
      </div>
    )
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
          hoverStatus: false,
          controls: {
            status: false,
            score: false,
            assignee: false
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
