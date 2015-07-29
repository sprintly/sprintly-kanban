import React from 'react/addons';
import _ from 'lodash';
import helpers from '../../components/helpers';
import ItemDetailMixin from './detail-mixin';
import SubitemHeader from './item-subitem-header';
import {State, Link} from 'react-router';
import ProductActions from '../../../actions/product-actions';
import ItemActions from '../../../actions/item-actions';
import Select from 'react-select';
import STATUS_MAP from '../../../lib/statuses-map';

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
    hoverStatus: React.PropTypes.string,
    controls: React.PropTypes.shape({
      status: React.PropTypes.string,
      score: React.PropTypes.string,
      assignee: React.PropTypes.string
    }),
    setHoverStatus: React.PropTypes.func,
    resetHoverStatus: React.PropTypes.func,
    toggleActionControl: React.PropTypes.func,
    toggleSubitem: React.PropTypes.func,
    updateSubitem: React.PropTypes.func
  },

  subitemActions() {
    let subheaderClasses = React.addons.classSet({
      'subheader': true,
      'open': this.props.header
    });
    let members = helpers.formatSelectMembers(this.props.members);
    let currentAssignee = this.currentAssignee(this.props.members, this.props.subitem.assigned_to);

    let estimator = this.estimator( this.props.subitem.score,
                                    this.props.subitem.type,
                                    _.partial(this.updateAttribute, this.props.subitem.number)
                                  );

    let statusPicker = this.statusPicker(this.props.subitem.status,
                                        _.partial(this.props.setHoverStatus, this.props.subitem.number),
                                        _.partial(this.props.resetHoverStatus, this.props.subitem.number),
                                        _.partial(this.updateAttribute, this.props.subitem.number)
                                      );
    let reassigner;
    if (!this.canBeReassigned(this.props.subitem.status)) {
      let currentStatus = helpers.toTitleCase(this.props.subitem.status)
      reassigner = <div>{`Cannot reassign tickets which are ${currentStatus}`}</div>
    } else {
      reassigner = <Select placeholder={"Choose assignee"}
                                  name="form-field-name"
                             className="assign-dropdown"
                              disabled={false}
                                 value={currentAssignee}
                               options={members}
                              onChange={_.partial(this.updateAttribute, this.props.subitem.number, 'assigned_to')}
                             clearable={true} />
    }

    return (
      <div className="col-md-8 state collapse-right pull-right">
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

  render() {
    let header = this.subitemHeader();
    let subitemActions = this.subitemActions();

    let contentClasses = React.addons.classSet({
      'content': true,
      'open': this.props.header
    });
    let contentStyles = !this.props.header ? {overflow: 'hidden'} : {};

    let descriptionClasses = React.addons.classSet({
      "col-md-8": true,
      "description": true,
      'italicize': !this.props.subitem.description
    })
    let description = this.props.subitem.description || 'This subitem has no description yet..';

    let tags = this.buildTags(this.props.subitem.tags);
    let createdByTimestamp = this.createdByTimestamp(this.props.subitem.created_at, this.props.subitem.created_by);

    let viewTicketURL = `/product/${this.getParams().id}/item/${this.props.subitem.number}`;

    return (
      <div key={this.props.index} className="subitem">
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
  }
})

export default ItemSubitem;
