import React from "react";
import { RouteHandler } from "react-router";
import Promise from "bluebird";

export default React.createClass({
  render: function() {
    return (
      <RouteHandler {...this.props} />
    )
  }
});
