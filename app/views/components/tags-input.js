import _ from 'lodash';
import React from 'react/addons';
import classNames from "classnames";
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
      onChange() {}
    };
  },

  getInitialState() {
    return {
      filteredTags: [],
      isOpen: false
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
        if (node.value === "") {
          return;
        }
        ev.preventDefault();
        this.addTag(node.value);
      break

      case 13: // enter
        ev.preventDefault();
        if (this.state.focusedOption) {
          this.addTag(this.state.focusedOption);
        } else {
          this.addTag(node.value);
        }
      break;

      case 188: // comma
        if (node.value.length > 0 && ev.shiftKey !== true) {
          ev.preventDefault();
          this.addTag(node.value);
        }
      break;

      case 38: // up
        this.focusOption('previous');
      break;

      case 40: // down
        this.focusOption('next');
      break;

      case 27: // esc
        console.log('ESCAPE');
      break;

      default:
        this.setState({
          focusedOption: ''
        })
    }
  },

  updateFocusedOption(ev, value) {
    this.setState({
      focusedOption: ev.currentTarget.text
    })
  },

  getFocusedOptionIndex() {
    let tags = this.state.filteredTags;
    let focusedIndex = -1;

    for (var i = 0; i < tags.length; i++) {
      if (this.state.focusedOption === tags[i]) {
        focusedIndex = i;
        break;
      }
    }

    return focusedIndex;
  },

  focusOption(direction) {
    let tags = this.state.filteredTags;
    let tagCount = tags.length;

    if (!tagCount) {
      return;
    }

    let focusedIndex = this.getFocusedOptionIndex();
    let focusedOption = tags[0];

    if (direction === 'next' && focusedIndex > -1 && focusedIndex < tagCount - 1) {
      focusedOption = tags[focusedIndex + 1];
    } else if (direction === 'previous') {
      if (focusedIndex > 0) {
        focusedOption = tags[focusedIndex - 1];
      } else {
        focusedOption = tags[tagCount - 1];
      }
    }

    this.setState({
      focusedOption: focusedOption
    })
  },

  renderValues() {
    if (this.props.value && this.props.defaultValue) {
      // TODO: lookup warning conventions in React
      console.warn('Warning: you have provided both a `value` and `defaultValue` to a form element. Check the render method of TagsInput');
    }

    let tags = this.props.value || this.props.defaultValue || [];

    return _.map(tags, (value, i) => {
      return (
        <div className="label label-default" key={i}>
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

  handleInputFocus: function() {
    this.setState({
      isOpen: true
    }, function() {
      this._bindCloseMenuIfClickedOutside();
    });
  },

  clickedOutsideElement(element, event) {
    var eventTarget = (event.target) ? event.target : event.srcElement;
    while (eventTarget != null) {
      if (eventTarget === element) return false;
      eventTarget = eventTarget.offsetParent;
    }
    return true;
  },

  componentDidMount() {
    this._closeMenuIfClickedOutside = function(event) {

      var menuElem = this.refs.listGroup.getDOMNode();
      var controlElem = this.refs.input.getDOMNode();

      var eventOccuredOutsideMenu = this.clickedOutsideElement(menuElem, event);
      var eventOccuredOutsideControl = this.clickedOutsideElement(controlElem, event);

      // Hide dropdown menu if click occurred outside of menu
      if (eventOccuredOutsideMenu && eventOccuredOutsideControl) {
        this.setState({
          isOpen: false
        }, this._unbindCloseMenuIfClickedOutside);
      }
    }.bind(this);

    this._bindCloseMenuIfClickedOutside = function() {
      document.addEventListener('click', this._closeMenuIfClickedOutside);
    };

    this._unbindCloseMenuIfClickedOutside = function() {
      document.removeEventListener('click', this._closeMenuIfClickedOutside);
    };
  },

  componentWillUnmount() {
    this._unbindCloseMenuIfClickedOutside();
  },

  renderMenu() {
    if (this.state.filteredTags.length === 0 || !this.state.isOpen) {
      return '';
    }

    return (
      <ListGroup>
        {_.map(this.state.filteredTags, (value, index) => {
          let focusedClass = classNames({
            'tag-item__focused': (value === this.state.focusedOption)
          })

          let props = {
            href: "#",
            key: index,
            className: focusedClass,
            onMouseOver: this.updateFocusedOption,
            onClick: _.partial(this.addTag, value)
          }

          return (
            <ListGroupItem {...props}>{value}</ListGroupItem>
          );
        })}
      </ListGroup>
    )
  },

  render() {
    return (
      <div className="tags-input" ref='listGroup'>
        {this.renderValues()}
        <input
          ref="input"
          onKeyUp={this.onKeyUp}
          onKeyDown={this.onKeyDown}
          onChange={this.filterTags}
          onFocus={this.handleInputFocus}
          placeholder={this.props.placeholder || "Type to Search and Add Tags..."}
        />
        {this.renderMenu()}
      </div>
    )
  }

});

export default TagsInput;
