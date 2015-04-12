import _ from 'lodash';
import React from 'react/addons';
import {ListGroup, ListGroupItem} from 'react-bootstrap';
import fuzzy from 'fuzzy';

var TagsInput = React.createClass({

  propTypes: {
    tags: React.PropTypes.array,
    value: React.PropTypes.array,
    defaultValue: React.PropTypes.array,
    onChange: React.PropTypes.func,
    placeholder: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      onChange() {},
      data: []
    };
  },

  addTag(ev, value) {
    ev.preventDefault();
    let tags = this.props.value || [];
    React.addons.update(tags, { $push: [value] });
    this.onChange(tags);
  },

  removeTag(ev, value) {
    let tags = this.props.value || [];
    this.onChange(_.without(tags, value));
  },

  renderValues() {
    if (this.props.value && this.props.defaultValue) {
      // TODO: lookup warning conventions in React
      console.warn('Warning: you have provided both a `value` and `defaultValue` to a form element. Check the render method of TagsInput');
    }

    let tags = this.props.value || this.props.defaultValue || [];

    return _.map(tags, (value) => {
      return (
        <div className="label label-default">
          <span>{value}</span>
          <button
            type="button"
            className="close"
            aria-label="Remove"
            onClick={_.partial(this.removeTag, value)}>
              <span aria-hidden="true">&times;</span>
          </button>
        </div>
      );
    });
  },

  renderMenu() {
    return (
      <ListGroup>
        {_.map(this.props.tags, (value) => {
          return <ListGroupItem onClick={_.partial(this.addTag, value)} />
        })}
      </ListGroup>
    )
  },

  render() {
    return (
      <div className="form-group tags-input" {...props}>
        {this.renderValues()}
        <input className="form-control"  />
        {this.renderMenu()}
      </div>
    )
  }

});
