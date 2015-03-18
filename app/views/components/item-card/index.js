/**
 * @jsx React.DOM
 */

var _ = require('lodash');
var React = require('react/addons');
var moment = require('moment');
var OwnerAvatar = require('./owner');
var Controls = require('./controls');
var SprintlyUI = require('sprintly-ui');
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

  filterByTag: function() {
    // not sure how we're going to use this yet?
    // ie, clicking tag filters 5cols or sends to tag-filtered
    // reports/organizer/etc.?
    return;
  },

  editTags: function(modelId, currentTags, changedTag, action) {},

  changeScore: function(modelId, newScore) {},

  changeStatus: function() {},

  renderDetails: function() {
    var tags = this.props.item.tags ? this.props.item.tags.split(',') : [];

    return (
      <div className="item-card__details">
        <div className="item-card__tags">
          <SprintlyUI.TagEditor
            modelId={[this.props.item.product.id, this.props.item.pk]}
            tags={tags}
            tagChanger={{addOrRemove: this.editTags}}
          />
          <SprintlyUI.Tags
            tags={tags}
            altOnTagClick={this.filterByTag}
          />
        </div>
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
      <div className={React.addons.classSet(classes)} {...this.props}>
        <div className="row">
          <div className="col-sm-2">
            <Controls
              status={this.props.item.status}
              toggleDetails={this.changeStatus}
            />
            <div className="item-card__summary">
              <SprintlyUI.Estimator
                modelId={[this.props.item.product.id, this.props.item.number]}
                itemType={this.props.item.type}
                score={this.props.item.score}
                estimateChanger={{changeScore: this.changeScore}}
              />
            </div>
            <button className="item-card__show-details" onClick={this.toggleDetails}>...</button>
          </div>
          <div className="item-card__title col-sm-10">
            <h2 className="item-card__title-left">{this.props.item.title}</h2>
            <div className="item-card__title-right">
              <div className="item-card__number">#{this.props.item.number}</div>
              <OwnerAvatar person={owner} />
            </div>
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
