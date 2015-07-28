import React from 'react/addons';
import _ from 'lodash';
import helpers from '../../components/helpers';
import ItemDetailMixin from './detail-mixin';
import {State, Link} from 'react-router';
import ProductActions from '../../../actions/product-actions';
import ItemActions from '../../../actions/item-actions';

var ItemSubitems = React.createClass({
  mixins: [State, ItemDetailMixin],

  propTypes: {
    subitems: React.PropTypes.array
  },

  getInitialState() {
    return {
      openStates: {}
    }
  },

  toggleSubitem(id, ev) {
    var openStates = _.clone(this.state.openStates);
    openStates[id] = !this.state.openStates[id];

    this.setState({openStates: openStates})
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

  subitemHeader(subitem, index, ctx) {
    let headerClasses = React.addons.classSet({
      'header': true,
      'open': ctx.state.openStates[subitem.number]
    });
    let title = subitem.title;
    let status = ctx.itemStatus(subitem.status);
    let itemID = subitem.number;

    let email = (subitem.assigned_to && subitem.assigned_to.email) ? subitem.assigned_to.email : '';
    let assigneeGravatar = ctx.assigneeGravatar(email);
    let itemScoreButton = ctx.itemScoreButton(subitem.type, subitem.score);
    let checked = subitem.status === 'completed' || subitem.status === 'accepted';

    return (
      <div className={headerClasses}>
        <a className="toggle" onClick={_.partial(ctx.toggleSubitem, subitem.number)}>
          <span aria-hidden="true" className="glyphicon glyphicon-menu-right" />
        </a>
        <div className="sep-vertical"></div>
        <div className="title">{title}</div>
        <div className="col-md-4 state collapse-right">
          <ul>
            <li><div className="meta status">{status}</div></li>
            <li><div className="meta id">#{itemID}</div></li>
            <li><div className="meta">{assigneeGravatar}</div></li>
            <li><div className="meta">{itemScoreButton}</div></li>
            <li>
              <div className="meta">
                <div className="subitemCheck">
                  <input name="subitemCheck" type="checkbox" checked={checked} onChange={_.partial(ctx.updateSubitem, subitem)} id={`subitem-${index}`} />
                  <label htmlFor={`subitem-${index}`}></label>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    )
  },

  subitems() {
    return _.map(this.props.subitems, (subitem, i) => {
      let contentClasses = React.addons.classSet({
        'content': true,
        'open': this.state.openStates[subitem.number]
      });

      let descriptionClasses = React.addons.classSet({
        "col-md-9": true,
        "description": true,
        'italicize': !subitem.description
      })
      let description = subitem.description || 'This subitem has no description yet...';

      let tags = this.buildTags(subitem.tags);
      let createdByTimestamp = this.createdByTimestamp(subitem.created_at, subitem.created_by);

      let header = this.subitemHeader(subitem, i, this);
      let viewTicketURL = `/product/${this.getParams().id}/item/${subitem.number}`;

      return (
        <div key={i} className="subitem">
          {header}
          <div className={contentClasses}>
            <div className="col-md-12">
              <div className="col-md-12 collapse-right">
                <div className={descriptionClasses}>
                  {description}
                </div>
                <div className="col-md-3 collapse-right">
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

  addNewSubitemState(subitems) {
    let requiresUpdate = false;
    let openStates = _.cloneDeep(this.state.openStates);
    let subitemIds = _.keys(openStates);

    _.each(subitems, function(sub) {
      if (!_.contains(subitemIds, sub.id)) {
        requiresUpdate = true;
        openStates[sub.id] = false
      }
    })

    if (requiresUpdate) {
      this.setState({openStates: openStates});
    }
  },

  componentWillReceiveProps(nextProps) {
    let newSubitems = _.difference(nextProps.subitems, this.props.subitems);

    if (newSubitems) {
      this.addNewSubitemState(nextProps.subitems)
    }
  },

  collapseSubitems() {
    let openStates = _.cloneDeep(this.state.openStates);
    _.each(openStates, function(val, key) {
      openStates[key] = false;
    })
    this.setState({openStates: openStates})
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
    let subitems = this.subitems();

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
