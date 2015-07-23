import React from 'react/addons';
import classNames from "classnames";

let AddItemTitle = React.createClass({
  propTypes: {
    title: React.PropTypes.object.isRequired,
    validation: React.PropTypes.object.isRequired
  },

  componentDidMount() {
    React.findDOMNode(this.refs.titleInput).focus();
  },

  render() {
    var classes = classNames({
      "form-group": true,
      'has-error': !this.props.validation.value['title']
    });

    return (
      <div className={classes}>
        <input className="form-control"
          placeholder="What is it?"
          name="title"
          ref="titleInput"
          valueLink={this.props.title} />
      </div>
    );
  }
});

export default AddItemTitle;
