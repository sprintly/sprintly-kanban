import React from "react";
import { Link } from "react-router";

export default React.createClass({

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
          {this.props.products.map(function(product) {
            return <Link to="product" params={{ id: product.get('id') }}>{product.get('name')}</Link>
          })}
        </div>
      </div>
    );
  }

});
