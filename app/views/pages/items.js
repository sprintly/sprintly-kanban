/**
 * @jsx React.DOM
 */

var _ = require('lodash')
var React = require('react')
var ItemColumn = require('../components/item-column')
var BS = require('react-bootstrap');

var Items = React.createClass({

  getInitialState: function() {
    return {
      product: null
    }
  },

  componentDidMount: function() {
    this.props.config.on('update', () => { this.forceUpdate() })
  },

  handleHide: function(e) {
    this.setState({ product: this.refs.product.getValue() });
  },

  renderColumns: function() {
    var product = this.props.products.get(this.state.product);

    var cols = _.map(product.ItemModel.ITEM_STATUSES, function(label, status) {
      return <ItemColumn product={product} status={status} />;
    });

    return cols;
  },

  renderModal: function() {
    return (
      <div className="static-modal">
        <BS.Modal
          backdrop={true}
          animation={false}>
          <div className="modal-body">
            <div className="modal-tout">
              <h1>Build & Create</h1>
              <img src="https://sprintly-wasatch.global.ssl.fastly.net/4957/static/images/briefcase.png"/>
            </div>
            <BS.Input type="select" label="Choose a Product" ref="product">
              {this.props.products.map((product) => {
                return <option value={product.get('id')}>{product.get('name')}</option>
              })}
            </BS.Input>
          </div>
          <div className="modal-footer">
            <BS.Button bsSize="large" onClick={this.handleHide}>Get Started!</BS.Button>
          </div>
        </BS.Modal>
      </div>
    );
  },

  render: function() {
    return (
      <div className="tray">
        {this.state.product ?
          this.renderColumns() :
          this.renderModal()
        }
      </div>
    )
  }

})

module.exports = Items
