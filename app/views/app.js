import React from 'react';
import { RouteHandler } from 'react-router';
import Sidebars from './components/sidebars';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';

let Kanban = React.createClass({

  getInitialState() {
    return { lastTap: 0 };
  },

  /*
    Mobile double tap muting to prevent unwanted content zoom.
    Instead of adding a markup tag to control content scale which might
    prevent zoom levels on non-mobile
  */
  muteDoubleTap(e) {
    let timeBetweenTaps = e.timeStamp - this.state.lastTap;

    if (timeBetweenTaps < 500 && timeBetweenTaps > 0) {
      e.preventDefault();
    }
    this.setState({
      lastTap: e.timeStamp
    });
  },

  render: function() {
    let style = { minHeight: `${window.innerHeight}px`};
    let touchEndFn = helpers.isMobile(window) ? this.muteDoubleTap : function() {};

    return (
      <div style={style} className="app-view" onTouchEnd={this.muteDoubleTap}>
        <RouteHandler {...this.props} />
        <Sidebars {...this.props} />
      </div>
    );
  }
});

export default DragDropContext(HTML5Backend)(Kanban);
