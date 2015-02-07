/**
 * @jsx React.DOM
 */

var _ = require('lodash')
var React = require('react/addons')
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
      isLoading: true,
      headerOffset: 0,
      scrolling: false
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
      case 'accepted':
        this.items.config.set({ limit: 5 });
        break;

      default:
        this.items.config.set({ limit: 50 });
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

  setHeaderOffset: _.debounce(function() {
    this.setState({
      headerOffset: this.getDOMNode().scrollTop,
      scrolling: false
    })
  }, 300),

  hideHeader: _.throttle(function() {
    this.setState({
      scrolling: true
    })
  }, 20),

  onScroll: function() {
    this.setState({
      scrolling: true
    })
    this.setHeaderOffset();
  },

  render: function() {
    var limit = this.items.length;
    var classes = {
      column: true,
      [this.props.status]: true,
      scrolling: this.state.scrolling
    };

    return (
      <div className={React.addons.classSet(classes)} {...this.props} onScroll={_.throttle(this.onScroll, 30)}>
        <header style={{ top: this.state.headerOffset }}>
          {this.props.status}
        </header>
        <div className="column__inner">
        {this.state.isLoading ?
          <div className="loading"><Loading type="bubbles" color="#ccc"/></div> :
          this.items.map(function(model, index) {
            return <ItemCard item={model} key={model.id} />
          })
        }
        </div>
      </div>
    )
  }
});

module.exports = ItemColumn

