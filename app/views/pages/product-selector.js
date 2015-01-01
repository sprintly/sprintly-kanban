/**
 * @jsx React.DOM
 */

var React = require('react');
var Link = require('react-router').Link;

var ProductSelector = React.createClass({

  propTypes: {
    products: React.PropTypes.object.isRequired
  },

  render: function() {
    return (
      <div className="container">
        <div className="col-sm-6 product-selector">
          <h1>Build & Create</h1>
          <img src="https://sprintly-wasatch.global.ssl.fastly.net/4957/static/images/briefcase.png"/>
        </div>
        <div className="col-sm-6">
          {this.props.products.map((product) => {
            return <Link to="product" params={{ id: product.get('id')}}>{product.get('name')}</Link>
          })}
        </div>
      </div>
    );
  }

})

module.exports = ProductSelector;
