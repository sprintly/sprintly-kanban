import React from "react/addons";
import {Label} from "react-bootstrap";

export default React.createClass({
  propTypes: {
    item: React.PropTypes.object.isRequired
  },

  render: function() {
    return (
      <div className="toolbar container-flex">
        <div className="toolbar__item-number">
          <h1><span className="hash">#</span>{this.props.item.id}</h1>
        </div>
        <div className="toolbar__score">
          <h1>{this.props.item.get('score')}</h1>
        </div>
        <div className="toolbar__item-controls">
          <a href="#item-settings">
            <small>{this.props.item.get('counts').comments}</small>
            <i className="icon-chat"/>
          </a>
          <a href="#item-settings" className="icon-settings"></a>
        </div>
        <div className="toolbar__tags col-md-2">
        {this.props.item.get('tags').map(function(tag) {
          return <Label key={tag}>{tag}</Label>
        })}
        </div>
      </div>
    );
  }
});
