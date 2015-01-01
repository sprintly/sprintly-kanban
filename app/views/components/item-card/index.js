/**
 * @jsx React.DOM
 */

var _ = require('lodash');
var React = require('react/addons');
var moment = require('moment');
var OwnerAvatar = require('./owner')
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

  renderControls: function() {
    var status = this.props.item.get('status');
    var nextAction = '';
    var prevAction = '';

    switch(status) {
      case 'someday':
        nextAction = <a href="#promote" className="icon-add" title="Add to Backlog"></a>;
        prevAction = <a href="#destroy" className="icon-close destroy" title="Delete"></a>
        break;

      case 'backlog':
        nextAction = <a href="#start" className="icon-next" title="Start"></a>;
        prevAction = <a href="#reject" className="icon-close" title="Reject"></a>
        break;

      case 'in-progress':
        nextAction = <a href="#complete" className="icon-complete" title="Accept"></a>;
        prevAction = <a href="#stop" className="icon-close" title="Reject"></a>
        break;

      case 'completed':
        nextAction = <a href="#accept" className="icon-complete complete" title="Start"></a>;
        prevAction = <a href="#restart" className="icon-refresh" title="Restart"></a>
        break;

      case 'accepted':
        prevAction = <a href="#restart" className="icon-refresh" title="Restart"></a>;
        break;

      default:
        break;
    }

    return (
     <div className="controls">
        <a href="#more" className={[
          (this.state.showDetails ? 'icon-minus' : 'icon-more'),
          'details-toggle'
        ].join(' ')} title={this.state.showDetails ? 'Hide Details': 'Show Details'} onClick={this.toggleDetails}></a>
        {nextAction}
        {prevAction}
      </div> 
    );
  },

  renderDetails: function() {
    var details = [];

    var description = this.props.item.get('description');
    if (description) {
      details.push(
        <div className="item-details">
          <div className="item-description"
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
        {this.renderControls()}
        {this.state.showDetails ? this.renderDetails() : ''}
      </div>
    )
  }

})

module.exports = ItemCard;
