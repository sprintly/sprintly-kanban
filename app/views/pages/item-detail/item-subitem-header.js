import React from 'react/addons';
import _ from 'lodash';
import helpers from '../../components/helpers';
import ItemDetailMixin from './detail-mixin';
import {State, Link} from 'react-router';
import ProductActions from '../../../actions/product-actions';
import ItemActions from '../../../actions/item-actions';
import Select from 'react-select';
import STATUS_MAP from '../../../lib/statuses-map';

var ItemSubitemHeader = React.createClass({
  mixins: [State, ItemDetailMixin],

  propTypes: {
    index: React.PropTypes.number,
    subitem: React.PropTypes.shape({
      assigned_to: React.PropTypes.object,
      number: React.PropTypes.number,
      status: React.PropTypes.string,
      score: React.PropTypes.string,
      title: React.PropTypes.string,
      type: React.PropTypes.string
    }),
    header: React.PropTypes.bool,
    hoverStatus: React.PropTypes.string,
    controls: React.PropTypes.shape({
      status: React.PropTypes.string,
      score: React.PropTypes.string,
      assignee: React.PropTypes.string
    }),
    toggleActionControl: React.PropTypes.func,
    toggleSubitem: React.PropTypes.func,
    updateSubitem: React.PropTypes.func
  },
  // TODO: Decouple header component from the subitem-content component if possible

  render() {
    let headerClasses = React.addons.classSet({
      'header': true,
      'open': this.props.header
    });

    let title = this.props.subitem.title;
    let status = this.props.hoverStatus || this.itemStatus(this.props.subitem.status);
    let subitemId = this.props.subitem.number;

    let email = (this.props.subitem.assigned_to && this.props.subitem.assigned_to.email) ? this.props.subitem.assigned_to.email : '';
    let assigneeGravatar = this.assigneeGravatar(email);
    let itemScoreButton = this.itemScoreButton(this.props.subitem.type, this.props.subitem.score);

    let checked = this.props.subitem.status === 'completed' || this.props.subitem.status === 'accepted';

    return (
      <div className={headerClasses}>
        <a className="toggle" onClick={_.partial(this.props.toggleSubitem, this.props.subitem.number)}>
          <span aria-hidden="true" className="glyphicon glyphicon-menu-right" />
        </a>
        <div className="sep-vertical"></div>
        <div className="meta id">#{subitemId}</div>
        <div className="title">{title}</div>
        <div className="col-md-4 state collapse-right">
          <ul>
            <div className="col-md-3">
              <li onClick={_.partial(this.props.toggleActionControl, this.props.subitem, 'status')}>
                <div className="meta status">{helpers.toTitleCase(status)}</div>
              </li>
            </div>
            <div className="col-md-3">
              <li onClick={_.partial(this.props.toggleActionControl, this.props.subitem, 'assignee')}>
                <div className="meta">{assigneeGravatar}</div>
              </li>
            </div>
            <div className="col-md-3">
              <li onClick={_.partial(this.props.toggleActionControl, this.props.subitem, 'score')}>
                <div className="meta">{itemScoreButton}</div>
              </li>
            </div>
            <div className="col-md-3">
              <li>
                <div className="meta">
                  <div className="subitemCheck">
                    <input name="subitemCheck" type="checkbox" checked={checked} onChange={_.partial(this.props.updateSubitem, this.props.subitem)} id={`subitem-${this.props.index}`} />
                    <label htmlFor={`subitem-${this.props.index}`}></label>
                  </div>
                </div>
              </li>
            </div>
          </ul>
        </div>
      </div>
    )
  }
})

export default ItemSubitemHeader
