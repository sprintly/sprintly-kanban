/**
 * @jsx React.DOM
 */

var _ = require('lodash')
var React = require('react')
var ItemCard = require('../item-card')
var Backbone = require('backdash');
var Header = require('./header')
var Loading = require('react-loading');

var ItemColumn = React.createClass({

  mixins: [Backbone.Events],

  propTypes: {
    status: React.PropTypes.string.isRequired,
    product: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      isLoading: true
    }
  },

  getItems: function(product) {
    if (this.items) {
      this.stopListening(this.items);
    }
    this.items = product.getItemsByStatus(this.props.status);
    this.listenTo(this.items, {
      sync: () => { this.setState({ isLoading: false }) },
      change: () => { this.forceUpdate() }
    });

    switch(this.props.status) {
      case 'someday':
        this.items.config.set({ limit: 50 });
        break;

      case 'accepted':
        this.items.config.set({ limit: 5 });
        break;

      default:
        break;
    }

    return this.items.fetch();
  },

  componentWillMount: function() {
    this.getItems(this.props.product);
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.product.id !== this.props.product.id) {
      this.setState({ isLoading: true });
      this.getItems(nextProps.product);
    }
  },

  render: function() {
    var limit = this.items.length;
    var classes = "column " + this.props.status;

    return (
      <div className={classes}>
        {this.state.isLoading ?
          <div className="loading"><Loading type="bubbles" color="#ccc"/></div> :
          this.items.map(function(model, index) {
            return <ItemCard item={model} key={model.id} />
          })
        }
      </div>
    )
  }
});

module.exports = ItemColumn

