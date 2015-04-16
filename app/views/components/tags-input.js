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

  getInitialState() {
    return {
      filteredTags: []
    }
  },

  addTag(value) {
    let tags = React.addons.update(this.props.value || [], { $push: [value] });
    this.setState({ filteredTags: [] });
    this.refs.input.getDOMNode().value = '';
    this.props.onChange(_.unique(tags));
  },

  removeTag(value) {
    let tags = this.props.value || [];
    this.props.onChange(_.without(tags, value));
  },

  filterTags(ev) {
    let value = ev.target.value;
    if (value === '') {
      this.setState({ filteredTags: [] });
      return;
    }
    let results = fuzzy.filter(value, this.props.tags);
    this.setState({ filteredTags: _.pluck(results, 'string') });
  },

  onKeyDown(ev) {
    let node = this.refs.input.getDOMNode();

    switch (ev.keyCode) {
      case 8: // backspace
        if (node.value.length === 0) {
          this.removeTag(_.last(this.props.value));
        }
        break;
      case 9: // tab
      case 188: // comma
        if (node.value.length > 0 && ev.shiftKey !== true) {
          ev.preventDefault();
          this.addTag(node.value);
        }
        break;
      default:
        break;
    }
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
    if (this.state.filteredTags.length === 0) {
      return '';
    }

    return (
      <ListGroup>
        {_.map(this.state.filteredTags.slice(0, 3), (value, index) => {
          return (
            <ListGroupItem onClick={_.partial(this.addTag, value)} href="#" key={index}>
              {value}
            </ListGroupItem>
          );
        })}
      </ListGroup>
    )
  },

  render() {
    return (
      <div className="tags-input">
        {this.renderValues()}
        <input onChange={this.filterTags} onKeyDown={this.onKeyDown} placeholder="Add Tags..." ref="input" />
        {this.renderMenu()}
      </div>
    )
  }

});

export default TagsInput;
