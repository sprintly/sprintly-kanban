var _ = require('lodash');
var React = require('react/addons');
var moment = require('moment');
var OwnerAvatar = require('./owner');
var Controls = require('./controls');
var SprintlyUI = require('sprintly-ui');
var Bootstrap = require('react-bootstrap');
var marked = require('marked');
var ProductActions = require('../../../actions/product-actions');
var FilterActions = require('../../../actions/filter-actions');

const SCORE_MAP = {
  '~': 0,
  'S': 1,
  'M': 3,
  'L': 5,
  'XL': 8
}

const REVERSE_SCORE_MAP = _.zipObject(_.values(SCORE_MAP), _.keys(SCORE_MAP))

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
    productId: React.PropTypes.number.isRequired,
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

  filterByTag: function(tag) {
    FilterActions.update('tags', [tag]);
    return;
  },

  editTags: function(modelId, currentTags, changedTag, action) {},

  changeScore: function([productId, itemId], score) {
    ProductActions.updateItem(productId, itemId, { score: REVERSE_SCORE_MAP[score] });
  },

  changeStatus: function() {},

  renderDetails: function() {
    var tags = this.props.item.tags ? this.props.item.tags.split(',') : [];

    var statuses = {
      'someday': 'Someday',
      'backlog': 'Backlog',
      'in-progress': 'Current',
      'completed': 'Complete',
      'accepted': 'Accepted'
    };

    var statusOptions = _.omit(statuses, this.props.item.status);

    return (
      <div className="item-card__details">
        <div className="col-sm-6 item-card__summary">
          Created by {this.props.item.created_by.first_name} {this.props.item.created_by.last_name.slice(0,1)} {moment(this.props.item.created_at).fromNow()} ago.
        </div>
        <div className="col-sm-6 item-card__extra-controls">
          <Bootstrap.DropdownButton bsStyle="default" bsSize="small" title="Reorder">
            <Bootstrap.MenuItem eventKey="1">Move Up</Bootstrap.MenuItem>
            <Bootstrap.MenuItem eventKey="2">Move Down</Bootstrap.MenuItem>
            <Bootstrap.MenuItem eventKey="3">Move to Top</Bootstrap.MenuItem>
            <Bootstrap.MenuItem eventKey="3">Move to Bottom</Bootstrap.MenuItem>
          </Bootstrap.DropdownButton>
          <Bootstrap.DropdownButton bsStyle="default" bsSize="small" title={<span className="glyphicon glyphicon-cog"/>} noCaret>
            {_.map(statusOptions, function(label, status) {
              return <Bootstrap.MenuItem eventKey={status}>Move to {label}</Bootstrap.MenuItem>
            })}
          </Bootstrap.DropdownButton>
        </div>
        <div className="item-card__tags col-sm-12">
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

    var title = this.props.item.title

    if (this.props.item.what) {
      let article = this.props.item.title.split(this.props.item.who)[0];
      title = [
        <span className="item-card__title-subject">
          {article}
          <span className="item-card__title-who">{this.props.item.who}</span>
        </span>,
        <span className="item-card__title-verb"> I want </span>,
        <span className="item-card__title-predicate">
          <span className="item-card__title-what">{this.props.item.what}</span>
          <span> so that </span>
          <span className="item-card__title-why">{this.props.item.why}</span>
        </span>
      ]
    }

    return (
      <div className={React.addons.classSet(classes)} {...this.props}>
        <div className="row">
          <div className="item-card__header col-sm-12">
            <Controls
              productId={this.props.productId}
              number={this.props.item.number}
              status={this.props.item.status}
              toggleDetails={this.changeStatus}
            />
            <div className="item-card__header-right">
              <div className="item-card__number">#{this.props.item.number}</div>
              <SprintlyUI.Estimator
                modelId={[this.props.productId, this.props.item.number]}
                itemType={this.props.item.type}
                score={this.props.item.score}
                estimateChanger={{changeScore: this.changeScore}}
              />
              <OwnerAvatar person={owner} />
            </div>
          </div>
          <div className="item-card__title col-sm-12">
            <h2 className="item-card__title-left">{title}</h2>
            <button className="item-card__show-details" onClick={this.toggleDetails}>
              <span className="glyphicon glyphicon-option-horizontal" />
            </button>
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
