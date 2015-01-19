/**
 * @jsx React.DOM
 */

var _ = require('lodash');
var React = require('react/addons');
var moment = require('moment');
var OwnerAvatar = require('./owner');
var Controls = require('./controls');
var marked = require('marked');

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

var ITEM_STATUSES = {
  'someday': 'Someday',
  'backlog': 'Backlog',
  'in-progress': 'Current',
  'completed': 'Done',
  'accepted': 'Accepted'
};

var ItemCard = React.createClass({

  propTypes: {
    item: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      showDetails: false
    }
  },

  toggleDetails: function(e) {
    e.preventDefault();
    this.setState({ showDetails: !this.state.showDetails })
  },

  renderDetails: function() {
    var details = [];

    var description = this.props.item.get('description');
    if (description) {
      details.push(
        <div className="item-card__details">
          <div className="item-card__description"
            dangerouslySetInnerHTML={{
              __html: marked(description)
            }}></div>
        </div>
      );
    }

    return details;
  },

  render: function() {
    var classes = {
      'item-card': true,
      'active': this.props.active || this.state.showDetails
    };
    classes[this.props.item.get('type')] = true;

    var owner = this.props.item.get('assigned_to');

    return (
      <div className={React.addons.classSet(classes)} {...this.props}>
        <h2 className="item-card__title">{this.props.item.get('title')}</h2>
        <div className="item-card__summary">
          <OwnerAvatar person={owner || 'unassigned'} />
          <div className="item-card__summary-details">
            <a className="item-card__owner-name" href="#">
              {owner ? [owner.first_name, owner.last_name.substr(0,1) ].join(' ') : 'Unassigned' }
            </a>
            <span className="item-card__summary-supplement">
            {moment(this.props.item.get('last_modified')).fromNow()}
            </span>
          </div>
        </div>
        <Controls
          showDetails={this.state.showDetails}
          status={this.props.item.get('status')}
          toggleDetails={this.toggleDetails} />
        {this.state.showDetails ? this.renderDetails() : ''}
      </div>
    )
  }

})

module.exports = ItemCard;
