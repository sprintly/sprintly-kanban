import React from "react";
import { RouteHandler } from "react-router";
import Promise from "bluebird";
import Sidebars from "./components/sidebars";

export default React.createClass({
  muteTap(e) {
    e.preventDefault();
  },

  render: function() {
    return (
      <div className="app-view" onTouchEnd={this.muteTap}>
        <RouteHandler {...this.props} />
        <Sidebars {...this.props} />
      </div>
    )
  }
});
