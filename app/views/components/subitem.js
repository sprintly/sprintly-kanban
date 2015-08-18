import React from 'react/addons';
import _ from 'lodash';

let Subitem = React.createClass({

  propTypes: {
    subitem: React.PropTypes.shape({
      short_url: React.PropTypes.string,
      status: React.PropTypes.string,
      number: React.PropTypes.number,
      title: React.PropTypes.string
    }).isRequired,
    updateItem: React.PropTypes.oneOfType([
      React.PropTypes.bool,
      React.PropTypes.func
    ]),
    deleteItem: React.PropTypes.oneOfType([
      React.PropTypes.bool,
      React.PropTypes.func
    ]),
    checked: React.PropTypes.bool.isRequired,
    listPosition: React.PropTypes.number
  },

  subitemNumber() {
    let subitemURL = this.props.subitem.short_url;

    if (subitemURL) {
      return (
        <a href={subitemURL} target="_BLANK" className="small">
          #{this.props.subitem.number}
        </a>
      )
    } else {
      return <div className="subitem__id-ref">{this.props.listPosition + 1}</div>
    }
  },

  checkbox() {
    if (this.props.updateItem) {
      return <input type="checkbox"
                 checked={this.props.checked}
                onChange={_.partial(this.props.updateItem, this.props.subitem)} />
    }
  },

  deleteButton() {
    if (this.props.deleteItem) {
      return (
        <button className="btn btn-danger pull-right delete"
                     type="button"
                  onClick={_.partial(this.props.deleteItem, this.props.subitem)}>
          <span className="glyphicon glyphicon-remove"></span>
        </button>
      )
    }
  },

  render: function() {
    return (
      <li className="subitem task">
        <div className="checkbox">
          <label className="subitem__id">
            {this.checkbox()}
            <span>
              {this.subitemNumber()}
            </span>
          </label>
          <span className="subitem__title">
            {this.props.subitem.title}
          </span>
          {this.deleteButton()}
        </div>
      </li>
    );
  }
});

module.exports = Subitem;
