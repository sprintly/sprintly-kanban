import React from 'react/addons';
import _ from 'lodash';
import helpers from '../../components/helpers';
import ItemDetailMixin from './detail-mixin';
import ItemDescription from './item-description';
import SubitemHeader from './item-subitem-header';
import {State, Link} from 'react-router';
import ProductActions from '../../../actions/product-actions';
import ItemActions from '../../../actions/item-actions';
import STATUS_MAP from '../../../lib/statuses-map';
import classNames from "classnames";

var ItemSubitem = React.createClass({
  mixins: [State, ItemDetailMixin],

  propTypes: {
    index: React.PropTypes.number,
    members: React.PropTypes.array,
    subitem: React.PropTypes.shape({
      assigned_to: React.PropTypes.object,
      created_at: React.PropTypes.string,
      created_by: React.PropTypes.object,
      number: React.PropTypes.number,
      status: React.PropTypes.string,
      score: React.PropTypes.string,
      type: React.PropTypes.string
    }),
    header: React.PropTypes.bool,
    hoverStatus: React.PropTypes.bool,
    controls: React.PropTypes.shape({
      status: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool
      ]),
      score: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool
      ]),
      assignee: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.bool
      ])
    }),
    setHoverStatus: React.PropTypes.func,
    resetHoverStatus: React.PropTypes.func,
    toggleActionControl: React.PropTypes.func,
    toggleSubitem: React.PropTypes.func,
    updateSubitem: React.PropTypes.func,
    setSubitem: React.PropTypes.func
  },

  subitemActions() {
    let members = helpers.formatSelectMembers(this.props.members);
    let estimator = this.estimator(this.props.subitem);
    let statusPicker = this.statusPicker(this.props.subitem, this.props.setHoverStatus, this.props.resetHoverStatus);
    let subitem = this.props.subitem;
    let assigneeToId = (subitem.assigned_to && subitem.assigned_to.id) ? subitem.assigned_to.id : '';
    let itemParams = {
      score: subitem.score,
      number: subitem.number,
      type: subitem.type,
      status: subitem.status,
      assigned_to: assigneeToId
    }

    let reassigner = this.reassigner(itemParams, members);

    return (
      <div className="state">
        <div className={this.componentVisible(this.props.controls, 'assignee')}>
          {reassigner}
        </div>
        <div className={this.componentVisible(this.props.controls, 'score')}>
          {estimator}
        </div>
        <div className={this.componentVisible(this.props.controls, 'status')}>
          {statusPicker}
        </div>
      </div>
    )
  },

  subitemHeader() {
    return (
      <SubitemHeader subitem={this.props.subitem}
                       index={this.props.index}
                      header={this.props.header}
                 hoverStatus={this.props.hoverStatus}
                    controls={this.props.controls}
         toggleActionControl={this.props.toggleActionControl}
               toggleSubitem={this.props.toggleSubitem}
               updateSubitem={this.props.updateSubitem} />
    )
  },

  description() {
    return (
      <ItemDescription itemId={this.props.subitem.number}
                  description={this.props.subitem.description}
                      members={this.props.members}
                      setItem={_.partial(this.props.setSubitem, this.props.subitem.number)}
              alternateLayout={true}
                     readOnly={true} />
    )
  },

  render() {
    let header = this.subitemHeader();
    let description = this.description();
    let subitemActions = this.subitemActions();
    let contentClasses = classNames({
      'content-dark': true,
      'open': this.props.header
    });
    let contentStyles = !this.props.header ? {overflow: 'hidden', display: 'none'} : {};
    let descriptionClasses = classNames({
      "col-md-9": true,
      "collapse-left": true,
      "description": true,
      'italicize': !this.props.subitem.description
    })
    let tags = this.buildTags(this.props.subitem.tags);
    let createdByTimestamp = this.createdByTimestamp(this.props.subitem.created_at, this.props.subitem.created_by);
    let viewTicketURL = `/product/${this.getParams().id}/item/${this.props.subitem.number}`;

    return (
      <div className="subitem">
        {header}
        <div className={contentClasses} style={contentStyles}>
          <div className={descriptionClasses}>
            {description}
          </div>
          <div className="col-md-3 control">
            {subitemActions}
          </div>
          <div className="col-md-12 meta footer">
            <div className="col-md-6 tags no-gutter">
              <Link to={viewTicketURL}>View Full Ticket</Link>
              {tags}
            </div>
            <div className="col-md-6 timestamp no-gutter">
              {createdByTimestamp}
            </div>
          </div>
        </div>
      </div>
    )
  }
})

export default ItemSubitem;
