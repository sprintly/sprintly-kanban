import React from "react";
import { RouteHandler } from "react-router";
import Promise from "bluebird";

export default React.createClass({

  propTypes: {
    user: React.PropTypes.object.isRequired,
    products: React.PropTypes.object.isRequired
  },

  componentDidMount: function() {
    Promise.all([
      this.props.user.fetch(),
      this.props.products.fetch()
    ]).then(() => {
      this.forceUpdate();
    });
  },

  render: function() {
    return (
      <div>
        <RouteHandler {...this.props} />
      </div>
    )
  }

});
