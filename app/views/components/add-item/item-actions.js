import React from 'react/addons';

let AddItemActions = React.createClass({

  propTypes: {
    addItem: React.PropTypes.func.isRequired,
    dismiss: React.PropTypes.func,
    productId: React.PropTypes.string,
    checked: React.PropTypes.oneOfType([
      React.PropTypes.object,
      React.PropTypes.bool
    ])
  },

  render: function() {
    return (
      <div className="col-xs-12 add-item__actions no-gutter">
        <input type="submit" className="btn btn-primary btn-lg create-item" value="Create Item" onClick={this.props.addItem} />
        <button className="btn btn-default btn-lg cancel-item" onClick={this.props.dismiss}>Cancel</button>
        <div className="checkbox pull-right">
          <label>
            <input className="backlog-checkbox" type="checkbox" name="backlog" checkedLink={this.props.checked}/>
            <div className="attachments__info">Automatically send to backlog.</div>
          </label>
          <label className="attachments__beta">
            <span>BETA:</span>
            <div className="attachments__info">Attachments functionality coming soon. To add attachments the old way</div>
             <a href={`https://sprint.ly/product/${this.props.productId}`} target="_blank">Click Here</a>
          </label>
        </div>
      </div>
    );
  }
});

module.exports = AddItemActions;
