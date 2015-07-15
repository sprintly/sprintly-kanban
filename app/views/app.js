import React from 'react';
import { RouteHandler } from 'react-router';
import Sidebars from './components/sidebars';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';

let Kanban = React.createClass({

  getInitialState() {
    return { lastTap: 0 };
  },

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

    return (
      <div style={style} className="app-view" onTouchEnd={this.muteDoubleTap}>
        <RouteHandler {...this.props} />
        <Sidebars {...this.props} />
      </div>
    );
  }
});

export default DragDropContext(HTML5Backend)(Kanban);
