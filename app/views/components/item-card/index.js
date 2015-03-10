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
    var description = '';
    if (this.props.item.description) {
      description = (
        <div className="item-card__description well"
          dangerouslySetInnerHTML={{
            __html: marked(this.props.item.description)
          }}></div>
      );
    }

    var tags = '';
    if (this.props.item.tags) {
      tags =(
        <div className="item-card__tags">
          <span className="item-card__tags-label">Tags:</span>
          {_.map(this.props.item.tags.split(','), (tag) => <span className="btn btn-default">{tag}</span>)}
        </div>
      );
    }

    return (
      <div className="item-card__details">
        <div className="item-card__extra-controls">
          <a href="#promote" className="icon-down" title="Move to Bottom"></a>
          <a href="#promote" className="icon-add" title="Move to Top"></a>
          <a href="#promote" className="icon-down" title="Move Down"></a>
          <a href="#promote" className="icon-add" title="Move Up"></a>
        </div>
        {tags}
        {description}
      </div>
    );
  },

  render: function() {
    var classes = {
      'item-card': true,
      'active': this.props.active || this.state.showDetails,
    };
    classes[this.props.item.type] = true;

    var owner = this.props.item.assigned_to;

    return (
      <div className={React.addons.classSet(classes)} {...this.props} onClick={this.toggleDetails}>
        <div className="row">
          <Controls
            showDetails={this.state.showDetails}
            status={this.props.item.status}
            toggleDetails={this.toggleDetails} />
          <h2 className="item-card__title col-sm-8">{this.props.item.title}</h2>
          <div className="item-card__summary col-sm-2">
            <div className="item-card__number">#{this.props.item.number}</div>
            <OwnerAvatar person={owner}/>
          </div>
        </div>
        <div className="row">
          {this.state.showDetails ? this.renderDetails() : ''}
        </div>
      </div>
    )
  }

})

module.exports = ItemCard;
