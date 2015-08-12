import React from 'react/addons';
import _ from 'lodash';
import helpers from '../../components/helpers';
import ItemDetailMixin from './detail-mixin';
import ItemDescription from './item-description';
import SubitemHeader from './item-subitem-header';
import {State, Link} from 'react-router';
import ProductActions from '../../../actions/product-actions';
import ItemActions from '../../../actions/item-actions';
import classNames from "classnames";
import ScoreMap from '../../../lib/score-map';
import STATUS_MAP from '../../../lib/statuses-map';
const INVERTED_STATUS_MAP = _.zipObject(_.values(STATUS_MAP), _.keys(STATUS_MAP))

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
    setSubitem: React.PropTypes.func,
    maxId: React.PropTypes.number
  },

  subitemActions() {
    let members = helpers.formatSelectMembers(this.props.members);
    let scores = helpers.formatForSelect(ScoreMap);
    let statuses = helpers.formatStatusesForSelect(INVERTED_STATUS_MAP);

    let subitem = this.props.subitem;
    let assigneeToId = (subitem.assigned_to && subitem.assigned_to.id) ? subitem.assigned_to.id : '';
    let itemParams = {
      score: subitem.score,
      number: subitem.number,
      type: subitem.type,
      status: subitem.status,
      assigned_to: assigneeToId
    }

    let statusPicker = this.selector(itemParams, itemParams.status, statuses, 'status');
    let scoreSelector = this.selector(itemParams, itemParams.score, scores, 'score');
    let assigneeSelector = this.assigneeSelector(itemParams, members);

    return (
      <div className="state">
        <div className={this.componentVisible(this.props.controls, 'assignee')}>
          {assigneeSelector}
        </div>
        <div className={this.componentVisible(this.props.controls, 'score')}>
          {scoreSelector}
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
               updateSubitem={this.props.updateSubitem}
                       maxId={this.props.maxId} />
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
      "col-xs-8 col-lg-9": true,
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
          <div className="col-xs-4 col-lg-3 control">
            {subitemActions}
          </div>
          <div className="col-xs-12 meta footer">
            <div className="col-xs-6 tags no-gutter">
              <Link to={viewTicketURL}>View Full Ticket</Link>
              {tags}
            </div>
            <div className="col-xs-6 timestamp no-gutter">
              {createdByTimestamp}
            </div>
          </div>
        </div>
      </div>
    )
  }
})

export default ItemSubitem;
