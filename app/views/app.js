import React from "react";
import { RouteHandler } from "react-router";
import Promise from "bluebird";
import Sidebar from "./components/sidebar";
import SidebarConstants from '../constants/sidebar-constants';

export default React.createClass({
  render: function() {
    return (
      <div className="app-view">
        <RouteHandler {...this.props} />
        <Sidebar type={SidebarConstants.CORE} />
        <Sidebar type={SidebarConstants.FILTERS} />
      </div>
    )
  }
});
