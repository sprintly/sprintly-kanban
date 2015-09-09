import React from 'react/addons';
import _ from 'lodash';
import helpers from '../../components/helpers';
import ItemDetailMixin from './detail-mixin';
import {State, Link} from 'react-router';
import ProductActions from '../../../actions/product-actions';
import ItemActions from '../../../actions/item-actions';
import Select from 'react-select';
import STATUS_MAP from '../../../lib/statuses-map';
import classNames from "classnames";

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
    toggleActionControl: React.PropTypes.func,
    toggleSubitem: React.PropTypes.func,
    updateSubitem: React.PropTypes.func,
    maxId: React.PropTypes.number
  },

  idStyles() {
    /*
      to keep title left-aligned across subitems
      we use 10px per id char of the longest id
      ids = [12,123] => #123 => 3chars => 30px
    */
    return {width: `${this.props.maxId}0px`}
  },

  render() {
    let headerClasses = classNames({
      'subitem__header': true,
      'header-dark': true,
      'open': this.props.header
    });

    let title = this.props.subitem.title;
    let status = this.itemStatus(this.props.subitem.status);
    let subitemId = this.props.subitem.number;

    let email = (this.props.subitem.assigned_to && this.props.subitem.assigned_to.email) ? this.props.subitem.assigned_to.email : '';
    let assigneeGravatar = this.assigneeGravatar(email);
    let itemScoreButton = this.itemScoreButton(this.props.subitem.type, this.props.subitem.score);

    let checked = this.props.subitem.status === 'completed' || this.props.subitem.status === 'accepted';
    let caretClass = `glyphicon glyphicon-menu-${this.caretDirection(this.props.header)}`;

    return (
      <div className={headerClasses}>
        <a className="toggle" onClick={_.partial(this.props.toggleSubitem, this.props.subitem.number)}>
          <span aria-hidden="true" className={caretClass} />
        </a>
        <div className="sep-vertical"></div>
        <div className="meta id" style={this.idStyles()}>{`#${subitemId}`}</div>
        <div className="state collapse-right">
          <ul className="action__list">
            <div className="status">
              <li onClick={_.partial(this.props.toggleActionControl, this.props.subitem, 'status')}>
                <div className="meta status">{helpers.toTitleCase(status)}</div>
              </li>
            </div>
            <div className="assignee">
              <li onClick={_.partial(this.props.toggleActionControl, this.props.subitem, 'assignee')}>
                <div className="meta">{assigneeGravatar}</div>
              </li>
            </div>
            <div className="subitem__checkbox">
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
        <div className="title">{title}</div>
      </div>
    )
  }
})

export default ItemSubitemHeader
