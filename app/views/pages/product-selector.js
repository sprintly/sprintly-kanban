import React from "react";
import { Link } from "react-router";

export default React.createClass({

  propTypes: {
    products: React.PropTypes.object.isRequired
  },

  render: function() {
    return (
      <div className="container product-selector">
        <div className="col-sm-6 col-sm-offset-3">
          <img src="https://sprintly-wasatch.global.ssl.fastly.net/4957/static/images/briefcase.png"/>
          <ul className="list-unstyled">
          {this.props.products.map(function(product) {
            return (
              <li>
                <Link to="product" params={{ id: product.get('id') }} className="btn btn-default">{product.get('name')}</Link>
              </li>
            );
          })}
          </ul>
        </div>
      </div>
    );
  }

});
