import React from 'react/addons';

let AddItemTitle = React.createClass({
  propTypes: {
    title: React.PropTypes.object.isRequired,
    validation: React.PropTypes.object.isRequired
  },

  render() {
    var classes = React.addons.classSet({
      "form-group": true,
      'has-error': !this.props.validation.value['title']
    });

    return (
      <div className={classes}>
        <input className="form-control" placeholder="What is it?" name="title" valueLink={this.props.title}/>
      </div>
    );
  }
});

export default AddItemTitle;
