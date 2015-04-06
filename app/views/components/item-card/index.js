var _ = require('lodash');
var React = require('react/addons');
var moment = require('moment');
var OwnerAvatar = require('./owner');
var Controls = require('./controls');
var SprintlyUI = require('sprintly-ui');
var Bootstrap = require('react-bootstrap');
var ProductActions = require('../../../actions/product-actions');
var FilterActions = require('../../../actions/filter-actions');
var ItemCardDetails = require('./details');

const SCORE_MAP = {
  '~': 0,
  'S': 1,
  'M': 3,
  'L': 5,
  'XL': 8
}

const REVERSE_SCORE_MAP = _.zipObject(_.values(SCORE_MAP), _.keys(SCORE_MAP))

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

  changeScore: function([productId, itemId], score) {
    ProductActions.updateItem(productId, itemId, { score: REVERSE_SCORE_MAP[score] });
  },

  renderStoryTitle: function() {
    let article = this.props.item.title.split(this.props.item.who)[0];
    return [
      <span key="subject" className="item-card__title-subject">
        {article}
        <span className="item-card__title-who">{this.props.item.who}</span>
      </span>,
      <span key="verb" className="item-card__title-verb"> I want </span>,
      <span key="predicate" className="item-card__title-predicate">
        <span className="item-card__title-what">{this.props.item.what}</span>
        <span> so that </span>
        <span className="item-card__title-why">{this.props.item.why}</span>
      </span>
    ]
  },

  render: function() {
    var classes = {
      'item-card': true,
      'active': this.props.active || this.state.showDetails,
      [this.props.item.type]: true
    };

    var owner = this.props.item.assigned_to;
    var title = this.props.item.title

    if (this.props.item.type === 'story') {
      title = this.renderStoryTitle();
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
              <div className="item-card__number">
                <a href={`https://sprint.ly/product/${this.props.productId}/item/${this.props.item.number}`} target="_blank">#{this.props.item.number}</a>
              </div>
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
            <h2 className="item-card__title-left">
              <a href={`https://sprint.ly/product/${this.props.productId}/item/${this.props.item.number}`} target="_blank">{title}</a>
            </h2>
            <button className="item-card__show-details" onClick={this.toggleDetails}>
              <span className="glyphicon glyphicon-option-horizontal" />
            </button>
          </div>
        </div>
        <div className="row">
          {this.state.showDetails ? <ItemCardDetails {...this.props} /> : ''}
        </div>
      </div>
    )
  }

})

module.exports = ItemCard;
