/**
 * @jsx React.DOM
 */

var _ = require('lodash');
var React = require('react/addons');
var moment = require('moment');
var OwnerAvatar = require('./owner')

var Item = React.createClass({

  render: function() {
    var classes = {
      'item-card': true
    };
    classes[this.props.item.get('type')] = true;

    var owner = this.props.item.get('assigned_to');

    return (
      <div className={React.addons.classSet(classes)}>
        <h2 className="title">{this.props.item.get('title')}</h2>
        <div className="summary">
          <OwnerAvatar person={owner || 'unassigned'} />
          <div className="summary-details">
            <a className="owner-name" href="#">
              {owner ? [owner.first_name, owner.last_name.substr(0,1) ].join(' ') : 'Unassigned' }
            </a>
            <span className="summary-supplement">
            {moment(this.props.item.get('last_modified')).fromNow()}
            </span>
          </div>
        </div>
        <div className="controls">
          <a href="#start" className="icon-next" title="Start"></a>
          <a href="#reject" className="icon-close" title="Reject"></a>
        </div>
      </div>
    )
  }

})

module.exports = Item;
