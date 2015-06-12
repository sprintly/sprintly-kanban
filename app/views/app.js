import React from "react";
import { RouteHandler } from "react-router";
import Promise from "bluebird";
import Sidebars from "./components/sidebars";

export default React.createClass({
  render: function() {
    return (
      <div className="app-view">
        <RouteHandler {...this.props} />
        <Sidebars />
      </div>
    )
  }
});
